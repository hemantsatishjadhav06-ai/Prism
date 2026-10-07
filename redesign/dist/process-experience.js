/* Claim constellation: keyboard tabs and an explicitly started, pausable tour. */
(() => {
  'use strict';
  document.querySelectorAll('[data-process-experience]').forEach(section => {
    const room = section.querySelector('.px-constellation');
    const tabs = [...section.querySelectorAll('[data-px-stage]')];
    const panels = tabs.map(tab => section.querySelector(`#${tab.getAttribute('aria-controls')}`));
    const routes = [...section.querySelectorAll('[data-px-route]')];
    const flow = section.querySelector('.px-flow');
    const tour = section.querySelector('.px-tour');
    const progress = section.querySelector('.px-tour-track > span');
    const status = section.querySelector('[data-px-status]');
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
    const duration = 7500;
    let active = 0, wantsPlay = false, started = false, visible = true;
    let elapsed = 0, previousTime = null, frame = 0;

    function select(index, focus = false, announce = true) {
      active = (index + tabs.length) % tabs.length;
      tabs.forEach((tab, i) => {
        tab.setAttribute('aria-selected', String(i === active));
        tab.tabIndex = i === active ? 0 : -1;
        panels[i].hidden = i !== active;
        routes[i].classList.toggle('is-active', i === active);
      });
      room.dataset.pxActive = String(active);
      flow.setAttribute('d', routes[active].getAttribute('d'));
      elapsed = 0; progress.style.transform = 'scaleX(0)';
      if (focus) tabs[active].focus({preventScroll:true});
      if (announce) status.textContent = `Stage ${active + 1} of 5: ${tabs[active].getAttribute('aria-label')}.`;
    }
    const canRun = () => wantsPlay && visible && !document.hidden && !reduced.matches;
    function tick(time) {
      frame = 0;
      if (!canRun()) { previousTime = null; return; }
      if (previousTime !== null) elapsed += time - previousTime;
      previousTime = time;
      if (elapsed >= duration) select(active + 1);
      progress.style.transform = `scaleX(${Math.min(elapsed / duration, 1)})`;
      frame = requestAnimationFrame(tick);
    }
    function syncTour() {
      const running = canRun();
      room.dataset.pxPlaying = String(wantsPlay);
      room.dataset.pxMotion = running ? 'running' : 'paused';
      tour.setAttribute('aria-pressed', String(wantsPlay));
      tour.querySelector('[data-px-tour-label]').textContent = wantsPlay ? 'Pause journey' : started ? 'Resume journey' : 'Play the journey';
      tour.querySelector('.px-tour-icon').textContent = wantsPlay ? 'Ⅱ' : '▷';
      if (running && !frame) { previousTime = null; frame = requestAnimationFrame(tick); }
      if (!running) { cancelAnimationFrame(frame); frame = 0; previousTime = null; }
    }
    function manualSelect(index, focus = false) {
      wantsPlay = false; syncTour(); select(index, focus);
    }
    tabs.forEach((tab, index) => {
      tab.addEventListener('click', () => manualSelect(index));
      tab.addEventListener('keydown', event => {
        if (event.altKey || event.ctrlKey || event.metaKey || event.shiftKey) return;
        let target;
        if (event.key === 'ArrowRight' || event.key === 'ArrowDown') target = index + 1;
        if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') target = index - 1;
        if (event.key === 'Home') target = 0;
        if (event.key === 'End') target = tabs.length - 1;
        if (target === undefined) return;
        event.preventDefault(); manualSelect(target, true);
      });
    });
    section.querySelector('.px-prev').addEventListener('click', () => manualSelect(active - 1));
    section.querySelector('.px-next').addEventListener('click', () => manualSelect(active + 1));
    tour.addEventListener('click', () => {
      if (reduced.matches) return;
      wantsPlay = !wantsPlay; started = true; syncTour();
      status.textContent = wantsPlay ? 'Journey playing. Each stage stays in view for several seconds. Use Pause journey to stop.' : 'Journey paused.';
    });
    section.addEventListener('focusin', event => {
      if (wantsPlay && event.target.closest('.px-panel')) { wantsPlay = false; syncTour(); }
    });
    document.addEventListener('visibilitychange', syncTour);
    reduced.addEventListener('change', () => { if (reduced.matches) wantsPlay = false; syncTour(); });
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(entries => { visible = entries[0].isIntersecting; syncTour(); }, {threshold:.12}).observe(room);
    }
    select(0, false, false); syncTour();
  });
})();
