/* Two video decks keep scene changes smooth without downloading the whole film. */
(() => {
  'use strict';

  const hero = document.querySelector('.hero-video-hero');
  const background = hero?.querySelector('.hero-background');
  const videos = [document.getElementById('hero-video'), document.getElementById('hero-video-next')];
  const buttons = hero ? [...hero.querySelectorAll('.scene-button')] : [];
  const control = hero?.querySelector('.video-control');
  if (!hero || !background || videos.some(video => !video) || !buttons.length || !control) return;

  const scenes = buttons.map(button => ({
    video: button.dataset.video,
    poster: button.dataset.poster,
    title: button.dataset.title || button.querySelector('strong')?.textContent || '',
    description: button.dataset.description || ''
  }));
  if (scenes.some(scene => !scene.video || !scene.poster)) return;

  const title = document.getElementById('scene-title');
  const description = document.getElementById('scene-description');
  const counter = document.getElementById('scene-counter');
  const announcement = document.getElementById('scene-announcement');
  const motionPreference = window.matchMedia('(prefers-reduced-motion: reduce)');
  const connection = navigator.connection;
  const failures = new Set();
  const absoluteURL = url => new URL(url, document.baseURI).href;
  const decks = videos.map(video => {
    const source = video.getAttribute('src') || video.querySelector('source')?.getAttribute('src');
    video.muted = true;
    video.playsInline = true;
    video.loop = false;
    video.setAttribute('aria-hidden', 'true');
    return {
      video,
      source: source ? absoluteURL(source) : '',
      index: source ? scenes.findIndex(scene => absoluteURL(scene.video) === absoluteURL(source)) : -1
    };
  });

  let selected = Math.max(0, buttons.findIndex(button => button.getAttribute('aria-pressed') === 'true'));
  let active = decks.find(deck => deck.index === selected) || decks[0];
  let manualPause = false;
  let preferenceOverride = false;
  let autoplayBlocked = false;
  let sceneFailed = false;
  let pending = null;
  let generation = 0;
  let fadeTimer;
  const initialBounds = background.getBoundingClientRect();
  let visible = initialBounds.bottom > 0 && initialBounds.top < window.innerHeight;

  const staticPreference = () => motionPreference.matches || Boolean(connection?.saveData);
  const wantsPlayback = () => !manualPause && (!staticPreference() || preferenceOverride);
  const canPlay = () => wantsPlayback() && visible && !document.hidden && !autoplayBlocked && !sceneFailed;
  const currentRequest = request => pending === request && request.generation === generation && request.index === selected;
  const hasFrame = deck => deck.index === selected && deck.video.readyState >= 2 && !deck.video.error;

  function updateControl() {
    const playing = wantsPlayback() && !autoplayBlocked && !sceneFailed;
    const label = sceneFailed ? 'Retry video' : playing ? 'Pause video' : 'Play video';
    control.hidden = false;
    control.setAttribute('aria-label', sceneFailed ? `Retry ${scenes[selected].title} video` : playing ? 'Pause scene videos' : 'Play scene videos');
    const text = control.querySelector('span');
    const icon = control.querySelector('path');
    if (text) text.textContent = label;
    if (icon) icon.setAttribute('d', playing ? 'M4 3H6V13H4Z M10 3H12V13H10Z' : 'M5 3L13 8L5 13Z');
    hero.classList.toggle('is-video-paused', !canPlay());
    hero.classList.toggle('is-scene-loading', Boolean(pending));
  }

  function renderScene(manual) {
    const scene = scenes[selected];
    background.style.backgroundImage = `url(${JSON.stringify(scene.poster)})`;
    if (title) title.textContent = scene.title;
    if (description) description.textContent = scene.description;
    if (counter) counter.textContent = `${String(selected + 1).padStart(2, '0')} / ${String(scenes.length).padStart(2, '0')}`;
    buttons.forEach((button, index) => {
      button.setAttribute('aria-pressed', String(index === selected));
      button.style.setProperty('--scene-progress', '0%');
    });
    if (manual && announcement) announcement.textContent = `${scene.title}. ${scene.description}`;
  }

  function unload(deck) {
    deck.video.pause();
    deck.video.removeAttribute('src');
    deck.video.querySelectorAll('source').forEach(source => source.removeAttribute('src'));
    deck.video.preload = 'none';
    deck.source = '';
    deck.index = -1;
    deck.video.load();
  }

  function configure(deck, index, preload) {
    const video = deck.video;
    const source = absoluteURL(scenes[index].video);
    video.poster = scenes[index].poster;
    video.preload = preload;
    if (deck.source === source && !video.error) {
      deck.index = index;
      return;
    }
    video.pause();
    video.querySelectorAll('source').forEach(element => element.removeAttribute('src'));
    deck.source = source;
    deck.index = index;
    video.src = source;
    video.load();
  }

  function cancelRequest() {
    generation += 1;
    if (!pending) return;
    const request = pending;
    pending = null;
    clearTimeout(request.timeout);
    clearTimeout(request.frameTimeout);
    request.deck.video.removeEventListener('loadeddata', request.frameReady);
    if (request.frameId !== undefined && request.deck.video.cancelVideoFrameCallback) {
      request.deck.video.cancelVideoFrameCallback(request.frameId);
    }
    request.deck.video.pause();
  }

  function nextIndex() {
    for (let offset = 1; offset <= scenes.length; offset += 1) {
      const index = (selected + offset) % scenes.length;
      if (!failures.has(index)) return index;
    }
    return -1;
  }

  function preloadNext() {
    if (!canPlay() || connection?.saveData || pending) return;
    const index = nextIndex();
    if (index < 0 || index === selected) return;
    const standby = decks.find(deck => deck !== active);
    standby.video.classList.remove('is-active');
    configure(standby, index, 'metadata');
  }

  function failScene(request, mediaFailure) {
    if (request && !currentRequest(request)) return;
    const failedDeck = request?.deck || active;
    cancelRequest();
    clearTimeout(fadeTimer);
    decks.forEach(deck => deck.video.pause());
    if (mediaFailure) {
      failures.add(selected);
      sceneFailed = true;
      unload(failedDeck);
    } else {
      autoplayBlocked = true;
    }
    hero.classList.add('is-poster-only');
    updateControl();
  }

  function reveal(request) {
    if (!currentRequest(request)) return;
    if (!canPlay()) {
      cancelRequest();
      synchronize();
      return;
    }
    const incoming = request.deck;
    const outgoing = active;
    clearTimeout(request.timeout);
    clearTimeout(request.frameTimeout);
    incoming.video.removeEventListener('loadeddata', request.frameReady);
    if (request.frameId !== undefined && incoming.video.cancelVideoFrameCallback) {
      incoming.video.cancelVideoFrameCallback(request.frameId);
    }
    pending = null;
    active = incoming;
    failures.delete(selected);
    incoming.video.classList.add('is-active');
    if (outgoing !== incoming) outgoing.video.classList.remove('is-active');
    hero.classList.remove('is-poster-only');
    updateControl();
    clearTimeout(fadeTimer);
    if (outgoing !== incoming) {
      // The outgoing decoder remains alive until its opacity transition finishes.
      fadeTimer = setTimeout(() => {
        if (active === incoming) {
          outgoing.video.pause();
          preloadNext();
        }
      }, 900);
    } else {
      preloadNext();
    }
  }

  function startScene() {
    if (pending || !canPlay()) return;
    clearTimeout(fadeTimer);
    decks.forEach(deck => {
      if (deck !== active) {
        deck.video.classList.remove('is-active');
        deck.video.pause();
      }
    });
    const deck = active.index === selected ? active : decks.find(item => item !== active);
    const request = {deck, index: selected, generation, frameId: undefined, frameTimeout: undefined, frameReady: null};
    pending = request;
    request.timeout = setTimeout(() => failScene(request, true), 20000);
    request.frameReady = () => {
      if (!currentRequest(request) || deck.video.readyState < 2) return;
      // A decoded first frame is sufficient when a browser lacks frame callbacks.
      if (!deck.video.requestVideoFrameCallback) reveal(request);
    };
    deck.video.addEventListener('loadeddata', request.frameReady);
    configure(deck, selected, 'auto');
    if (deck.video.ended) deck.video.currentTime = 0;
    updateControl();

    let playResult;
    try {
      playResult = deck.video.play();
    } catch (error) {
      failScene(request, error.name !== 'NotAllowedError');
      return;
    }
    Promise.resolve(playResult).then(() => {
      if (!currentRequest(request)) return;
      if (!canPlay()) {
        cancelRequest();
        synchronize();
        return;
      }
      if (deck.video.requestVideoFrameCallback) {
        request.frameId = deck.video.requestVideoFrameCallback(() => reveal(request));
        // Some implementations suppress callbacks in unusual compositor states.
        request.frameTimeout = setTimeout(() => {
          if (deck.video.readyState >= 2) reveal(request);
        }, 350);
      } else if (deck.video.readyState >= 2) {
        reveal(request);
      }
    }).catch(error => {
      if (!currentRequest(request)) return;
      failScene(request, error.name !== 'NotAllowedError' && error.name !== 'AbortError');
    });
  }

  function synchronize() {
    if (!canPlay()) {
      cancelRequest();
      clearTimeout(fadeTimer);
      decks.forEach(deck => deck.video.pause());
      const preferPoster = (staticPreference() && !preferenceOverride) || sceneFailed || autoplayBlocked || !hasFrame(active);
      hero.classList.toggle('is-poster-only', preferPoster);
      if (staticPreference() && !preferenceOverride) decks.forEach(unload);
      else if (connection?.saveData) decks.filter(deck => deck !== active).forEach(unload);
      updateControl();
      return;
    }
    if (pending) return;
    if (!hasFrame(active)) {
      startScene();
      return;
    }
    hero.classList.remove('is-poster-only');
    if (active.video.ended) active.video.currentTime = 0;
    const currentDeck = active;
    const currentGeneration = generation;
    const playResult = currentDeck.video.play();
    if (playResult?.catch) playResult.catch(error => {
      if (active !== currentDeck || generation !== currentGeneration || !canPlay()) return;
      failScene(null, error.name !== 'NotAllowedError' && error.name !== 'AbortError');
    });
    updateControl();
    preloadNext();
  }

  function selectScene(index, manual = false, retry = false) {
    if (index < 0 || index >= scenes.length) return;
    if (index === selected && !retry && !sceneFailed) {
      if (manual && announcement) announcement.textContent = `${scenes[index].title}. ${scenes[index].description}`;
      return;
    }
    cancelRequest();
    clearTimeout(fadeTimer);
    selected = index;
    sceneFailed = false;
    if (manual) {
      autoplayBlocked = false;
      failures.delete(index);
    }
    renderScene(manual);
    // Keep the outgoing image during playback; a paused selection uses its poster.
    if (!canPlay()) hero.classList.add('is-poster-only');
    synchronize();
  }

  buttons.forEach((button, index) => {
    button.addEventListener('click', () => selectScene(index, true));
    button.addEventListener('keydown', event => {
      let target;
      if (event.key === 'ArrowRight' || event.key === 'ArrowDown') target = (index + 1) % scenes.length;
      if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') target = (index - 1 + scenes.length) % scenes.length;
      if (event.key === 'Home') target = 0;
      if (event.key === 'End') target = scenes.length - 1;
      if (target === undefined) return;
      event.preventDefault();
      buttons[target].focus();
      selectScene(target, true);
    });
  });

  control.addEventListener('click', () => {
    if (wantsPlayback() && !autoplayBlocked && !sceneFailed) {
      manualPause = true;
      synchronize();
      return;
    }
    manualPause = false;
    preferenceOverride = staticPreference();
    autoplayBlocked = false;
    if (sceneFailed) selectScene(selected, true, true);
    else synchronize();
  });

  decks.forEach(deck => {
    deck.video.addEventListener('ended', () => {
      if (deck !== active || deck.index !== selected || pending || !canPlay()) return;
      const next = nextIndex();
      if (next >= 0) selectScene(next, false, next === selected);
    });
    deck.video.addEventListener('timeupdate', () => {
      if (deck !== active || deck.index !== selected || pending) return;
      const progress = Number.isFinite(deck.video.duration) && deck.video.duration > 0
        ? Math.min(100, Math.max(0, deck.video.currentTime / deck.video.duration * 100)) : 0;
      buttons[selected].style.setProperty('--scene-progress', `${progress.toFixed(2)}%`);
    });
    deck.video.addEventListener('error', () => {
      if (pending?.deck === deck) failScene(pending, true);
      else if (deck === active && deck.index === selected) failScene(null, true);
      else if (deck.index >= 0) failures.add(deck.index);
    });
    deck.video.querySelectorAll('source').forEach(source => source.addEventListener('error', () => {
      if (source.getAttribute('src')) {
        if (pending?.deck === deck) failScene(pending, true);
        else if (deck === active && deck.index === selected) failScene(null, true);
      }
    }));
  });

  function preferenceChanged() {
    preferenceOverride = false;
    autoplayBlocked = false;
    synchronize();
  }
  if (motionPreference.addEventListener) motionPreference.addEventListener('change', preferenceChanged);
  else motionPreference.addListener(preferenceChanged);
  connection?.addEventListener?.('change', preferenceChanged);
  document.addEventListener('visibilitychange', synchronize);
  window.addEventListener('pagehide', () => {
    cancelRequest();
    clearTimeout(fadeTimer);
    decks.forEach(deck => deck.video.pause());
  });
  window.addEventListener('pageshow', synchronize);
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(entries => {
      visible = entries[0].isIntersecting;
      synchronize();
    }, {threshold: 0.08}).observe(background);
  }

  renderScene(false);
  hero.classList.add('scenes-ready');
  synchronize();
})();
