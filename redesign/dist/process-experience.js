/* An isolated accordion: one narrative, three work areas, a shared record. */
(() => {
  'use strict';
  document.querySelectorAll('[data-process-experience]').forEach(section => {
    const room = section.querySelector('.px-control-room');
    const buttons = [...section.querySelectorAll('[data-px-stage]')];
    const panels = buttons.map(button => section.querySelector(`#${button.getAttribute('aria-controls')}`));
    const stations = [...section.querySelectorAll('[data-px-station]')];
    const groupButtons = [...section.querySelectorAll('[data-px-select]')];
    const status = section.querySelector('[data-px-status]');
    const flow = section.querySelector('.px-flow');
    const motion = section.querySelector('.px-motion');
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
    let manuallyPaused = false, visible = true;

    function select(index, announce = true) {
      const group = buttons[index].dataset.pxGroup;
      room.dataset.pxGroup = group;
      buttons.forEach((button, i) => {
        const selected = index === i;
        button.setAttribute('aria-expanded', String(selected));
        button.setAttribute('aria-disabled', String(selected));
        button.closest('.px-stage').classList.toggle('is-active', selected);
        button.querySelector('.px-stage-sign').textContent = selected ? '−' : '+';
        panels[i].hidden = !selected;
      });
      stations.forEach(station => {
        const selected = station.dataset.pxStation === group;
        station.classList.toggle('is-active', selected);
        station.querySelector('button').setAttribute('aria-pressed', String(selected));
      });
      flow.setAttribute('d', section.querySelector(`[data-px-route="${group}"]`).getAttribute('d'));
      if (announce) {
        const label = buttons[index].querySelector('span:nth-child(2)').textContent;
        status.textContent = `${label}. ${group === 'shared' ? 'The shared record supports every stage.' : `${group[0].toUpperCase() + group.slice(1)} is highlighted. Deadlines and audit history remain connected.`}`;
      }
    }

    buttons.forEach((button, index) => {
      button.addEventListener('click', () => { if (button.getAttribute('aria-expanded') !== 'true') select(index); });
      button.addEventListener('keydown', event => {
        if (event.altKey || event.ctrlKey || event.metaKey || event.shiftKey) return;
        let target;
        if (event.key === 'ArrowDown') target = (index + 1) % buttons.length;
        if (event.key === 'ArrowUp') target = (index + buttons.length - 1) % buttons.length;
        if (event.key === 'Home') target = 0;
        if (event.key === 'End') target = buttons.length - 1;
        if (target === undefined) return;
        event.preventDefault();
        buttons[target].focus({preventScroll: true});
      });
    });
    groupButtons.forEach(button => button.addEventListener('click', () => select(Number(button.dataset.pxSelect))));

    function updateMotion() {
      room.dataset.pxMotion = manuallyPaused || reduced.matches || !visible || document.hidden ? 'paused' : 'running';
      motion.hidden = reduced.matches;
      motion.setAttribute('aria-pressed', String(manuallyPaused));
      motion.querySelector('.px-motion-text').textContent = manuallyPaused ? 'Resume motion' : 'Pause motion';
      motion.querySelector('span').textContent = manuallyPaused ? '▷' : 'Ⅱ';
    }
    motion.addEventListener('click', () => { manuallyPaused = !manuallyPaused; updateMotion(); });
    document.addEventListener('visibilitychange', updateMotion);
    reduced.addEventListener('change', updateMotion);
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(entries => { visible = entries[0].isIntersecting; updateMotion(); }, {threshold:.05}).observe(room);
    }
    select(0, false); updateMotion();
  });
})();
