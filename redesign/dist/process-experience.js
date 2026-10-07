/* This tab list opts out of site.js through the data-process-tabs selector. */
(() => {
  document.querySelectorAll('[data-process-experience]').forEach(section => {
    const explorer = section.querySelector('.px-explorer');
    const list = section.querySelector('[data-process-tabs]');
    const tabs = [...list.querySelectorAll('[role="tab"]')];
    const panels = tabs.map(tab => section.querySelector(`#${tab.getAttribute('aria-controls')}`));
    const next = section.querySelector('[data-px-next]');
    const count = section.querySelector('.px-stage-count');
    const stage = section.querySelector('[data-px-stage]');
    const motion = section.querySelector('.px-motion');
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
    const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)');
    const narrow = window.matchMedia('(max-width: 760px)');
    let active = 0;
    let manuallyPaused = false;
    let inView = true;
    let frame = 0;

    function select(index, moveFocus = false) {
      active = (index + tabs.length) % tabs.length;
      tabs.forEach((tab, i) => {
        tab.setAttribute('aria-selected', String(i === active));
        tab.tabIndex = i === active ? 0 : -1;
        panels[i].hidden = i !== active;
      });
      explorer.dataset.pxActive = String(active);
      count.innerHTML = `${String(active + 1).padStart(2, '0')} <span>/ ${String(tabs.length).padStart(2, '0')}</span>`;
      next.querySelector('span').textContent = active === tabs.length - 1 ? 'Back to start' : 'Next stage';
      next.setAttribute('aria-label', `${active === tabs.length - 1 ? 'Back to' : 'Show'} ${tabs[(active + 1) % tabs.length].querySelector('.px-node-label').textContent}`);
      if (moveFocus) tabs[active].focus({preventScroll: true});
    }
    tabs.forEach((tab, index) => {
      tab.addEventListener('click', () => select(index));
      tab.addEventListener('keydown', event => {
        if (event.altKey || event.ctrlKey || event.metaKey || event.shiftKey) return;
        let target;
        if (event.key === 'ArrowRight' || event.key === 'ArrowDown') target = index + 1;
        if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') target = index - 1;
        if (event.key === 'Home') target = 0;
        if (event.key === 'End') target = tabs.length - 1;
        if (target === undefined) return;
        event.preventDefault();
        select(target, true);
      });
    });
    next.addEventListener('click', () => select(active + 1));
    next.hidden = false;

    function resetTilt() {
      cancelAnimationFrame(frame);
      frame = 0;
      explorer.style.setProperty('--px-rotate-x', '0deg');
      explorer.style.setProperty('--px-rotate-y', '0deg');
    }
    function updateMotion() {
      const paused = manuallyPaused || reduced.matches || !inView || document.hidden;
      explorer.dataset.pxMotion = paused ? 'paused' : 'running';
      motion.hidden = reduced.matches || narrow.matches;
      list.setAttribute('aria-orientation', narrow.matches ? 'vertical' : 'horizontal');
      motion.setAttribute('aria-pressed', String(manuallyPaused));
      motion.querySelector('.px-motion-label').textContent = manuallyPaused ? 'Resume motion' : 'Pause motion';
      motion.querySelector('.px-motion-symbol').textContent = manuallyPaused ? '▷' : 'Ⅱ';
      if (paused || !finePointer.matches || narrow.matches) resetTilt();
    }
    motion.addEventListener('click', () => { manuallyPaused = !manuallyPaused; updateMotion(); });
    stage.addEventListener('pointermove', event => {
      if (explorer.dataset.pxMotion === 'paused' || !finePointer.matches || narrow.matches) return;
      cancelAnimationFrame(frame);
      const x = event.clientX;
      const y = event.clientY;
      frame = requestAnimationFrame(() => {
        const box = stage.getBoundingClientRect();
        const rotateY = ((x - box.left) / box.width - .5) * 4;
        const rotateX = -((y - box.top) / box.height - .5) * 3;
        explorer.style.setProperty('--px-rotate-x', `${rotateX.toFixed(2)}deg`);
        explorer.style.setProperty('--px-rotate-y', `${rotateY.toFixed(2)}deg`);
        frame = 0;
      });
    }, {passive: true});
    stage.addEventListener('pointerleave', resetTilt);
    document.addEventListener('visibilitychange', updateMotion);
    reduced.addEventListener('change', updateMotion);
    finePointer.addEventListener('change', updateMotion);
    narrow.addEventListener('change', updateMotion);
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(entries => { inView = entries[0].isIntersecting; updateMotion(); }, {threshold: .05}).observe(stage);
    }
    select(0);
    updateMotion();
  });
})();
