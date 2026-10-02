const menu = document.querySelector('.menu-toggle');
const navigation = document.querySelector('.primary-nav');
function closeMenu() {
  menu?.setAttribute('aria-expanded', 'false');
  navigation?.classList.remove('is-open');
}
menu?.addEventListener('click', () => {
  const open = menu.getAttribute('aria-expanded') !== 'true';
  menu.setAttribute('aria-expanded', String(open));
  navigation.classList.toggle('is-open', open);
});
document.addEventListener('keydown', event => {
  if (event.key === 'Escape' && menu?.getAttribute('aria-expanded') === 'true') {
    closeMenu(); menu.focus();
  }
});
navigation?.querySelectorAll('a').forEach(link => link.addEventListener('click', closeMenu));
document.addEventListener('click', event => {
  if (!event.target.closest('.site-header')) closeMenu();
});
const tabLists = document.querySelectorAll('[role="tablist"]');
tabLists.forEach(list => {
  const tabs = [...list.querySelectorAll('[role="tab"]')];
  function activate(tab, focus = false) {
    tabs.forEach(item => {
      const selected = item === tab;
      item.setAttribute('aria-selected', String(selected));
      item.tabIndex = selected ? 0 : -1;
      document.getElementById(item.getAttribute('aria-controls')).hidden = !selected;
    });
    if (focus) tab.focus();
  }
  tabs.forEach((tab, index) => {
    tab.addEventListener('click', () => activate(tab));
    tab.addEventListener('keydown', event => {
      let target;
      if (event.key === 'ArrowRight') target = tabs[(index + 1) % tabs.length];
      if (event.key === 'ArrowLeft') target = tabs[(index - 1 + tabs.length) % tabs.length];
      if (event.key === 'ArrowDown') target = tabs[(index + 1) % tabs.length];
      if (event.key === 'ArrowUp') target = tabs[(index - 1 + tabs.length) % tabs.length];
      if (event.key === 'Home') target = tabs[0];
      if (event.key === 'End') target = tabs[tabs.length - 1];
      if (target) { event.preventDefault(); activate(target, true); }
    });
  });
});
const heroVideo = document.getElementById('hero-video');
const videoButton = document.querySelector('.video-control');
if (heroVideo && videoButton) {
  let manuallyPaused = false;
  const autoPlay = !window.matchMedia('(prefers-reduced-motion: reduce)').matches && !navigator.connection?.saveData;
  const updateVideoButton = () => {
    const paused = heroVideo.paused;
    videoButton.setAttribute('aria-label', paused ? 'Play hero video' : 'Pause hero video');
    videoButton.querySelector('span').textContent = paused ? 'Play video' : 'Pause video';
    videoButton.querySelector('path').setAttribute('d', paused ? 'M5 3L13 8L5 13Z' : 'M4 3H6V13H4Z M10 3H12V13H10Z');
  };
  const playVideo = () => heroVideo.play().catch(updateVideoButton);
  heroVideo.addEventListener('play', updateVideoButton);
  heroVideo.addEventListener('pause', updateVideoButton);
  heroVideo.addEventListener('error', () => { videoButton.hidden = true; });
  heroVideo.querySelector('source')?.addEventListener('error', () => { videoButton.hidden = true; });
  videoButton.addEventListener('click', () => {
    if (heroVideo.paused) { manuallyPaused = false; playVideo(); }
    else { manuallyPaused = true; heroVideo.pause(); }
  });
  if ('IntersectionObserver' in window) {
    const videoObserver = new IntersectionObserver(entries => {
      const visible = entries[0].isIntersecting;
      if (!visible) heroVideo.pause();
      else if (autoPlay && !manuallyPaused) playVideo();
    }, {threshold:0.1});
    videoObserver.observe(heroVideo);
  } else if (autoPlay) playVideo();
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) heroVideo.pause();
  });
  updateVideoButton();
}
const headlines = document.getElementById('hero-headlines');
const headlineButton = document.querySelector('.headline-control');
if (headlines && headlineButton) {
  const slides = [...headlines.querySelectorAll('.headline-slide')];
  const motionPreference = window.matchMedia('(prefers-reduced-motion: reduce)');
  let current = 0, timer, manuallyPaused = false, visible = true, hovered = false, focused = false;
  const staticMode = () => motionPreference.matches || navigator.connection?.saveData;
  const updateHeadlines = () => {
    clearInterval(timer);
    const staticText = staticMode();
    headlines.classList.toggle('is-static', Boolean(staticText));
    headlineButton.hidden = Boolean(staticText);
    headlineButton.setAttribute('aria-label', manuallyPaused ? 'Resume scrolling text' : 'Pause scrolling text');
    headlineButton.querySelector('span:last-child').textContent = manuallyPaused ? 'Resume text' : 'Pause text';
    headlineButton.querySelector('.headline-control-symbol').textContent = manuallyPaused ? '▷' : 'Ⅱ';
    if (staticText || manuallyPaused || !visible || hovered || focused || document.hidden) return;
    timer = setInterval(() => {
      const next = (current + 1) % slides.length;
      slides.forEach((slide, index) => {
        slide.classList.toggle('is-active', index === next);
        slide.classList.toggle('is-past', index === current);
      });
      current = next;
    }, 6500);
  };
  headlineButton.addEventListener('click', () => { manuallyPaused = !manuallyPaused; updateHeadlines(); });
  const copy = headlines.closest('.hero-copy');
  copy.addEventListener('mouseenter', () => { hovered = true; updateHeadlines(); });
  copy.addEventListener('mouseleave', () => { hovered = false; updateHeadlines(); });
  copy.addEventListener('focusin', () => { focused = true; updateHeadlines(); });
  copy.addEventListener('focusout', event => { if (!copy.contains(event.relatedTarget)) { focused = false; updateHeadlines(); } });
  motionPreference.addEventListener('change', updateHeadlines);
  document.addEventListener('visibilitychange', updateHeadlines);
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(entries => { visible = entries[0].isIntersecting; updateHeadlines(); }, {threshold:0.1}).observe(headlines);
  }
  updateHeadlines();
}
const form = document.getElementById('inquiry-form');
const requestedInterest = new URLSearchParams(window.location.search).get('interest');
const interestSelect = document.getElementById('interest');
if (requestedInterest && interestSelect && [...interestSelect.options].some(option => option.value === requestedInterest)) {
  interestSelect.value = requestedInterest;
}
form?.addEventListener('submit', event => {
  event.preventDefault();
  if (!form.reportValidity()) return;
  const fields = new FormData(form);
  const subject = `PRISM consultation — ${fields.get('interest') || 'General inquiry'}`;
  const body = `Name: ${fields.get('name')}\nEmail: ${fields.get('email')}\nPractice: ${fields.get('company') || 'Not provided'}\nPhone: ${fields.get('phone') || 'Not provided'}\nInterest: ${fields.get('interest') || 'General inquiry'}\n\n${fields.get('message')}`;
  const mailto = `mailto:info@prism.inc?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  const fallback = document.getElementById('email-fallback');
  fallback.href = mailto;
  document.getElementById('form-status').hidden = false;
  window.location.href = mailto;
});
if ('IntersectionObserver' in window && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
  const observer = new IntersectionObserver(entries => entries.forEach(entry => {
    if (entry.isIntersecting) { entry.target.classList.add('is-visible'); observer.unobserve(entry.target); }
  }), {threshold: 0.08});
  document.querySelectorAll('.reveal').forEach(element => observer.observe(element));
}
