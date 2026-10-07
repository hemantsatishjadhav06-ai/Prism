/* Stage tabs opt out of the shared site.js controller. No external dependencies. */
(() => {
  'use strict';
  const SVG = 'http://www.w3.org/2000/svg';
  document.querySelectorAll('[data-process-experience]').forEach(section => {
    const room = section.querySelector('.px-control-room');
    const tabs = [...section.querySelectorAll('[data-px-phase]')];
    const panels = tabs.map(tab => section.querySelector(`#${tab.getAttribute('aria-controls')}`));
    const moduleButtons = [...section.querySelectorAll('[data-px-module]')];
    const views = [...section.querySelectorAll('button[data-px-view]')];
    const next = section.querySelector('.px-next');
    const motionButton = section.querySelector('.px-motion');
    const status = section.querySelector('[data-px-status]');
    const network = section.querySelector('[data-px-network]');
    const dossier = section.querySelector('[data-px-dossier]');
    const wireSvg = section.querySelector('.px-wires');
    const wireGroup = section.querySelector('.px-wire-lines');
    const packetGroup = section.querySelector('.px-wire-packets');
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
    let active = 0, inspected = 1, view = 'stage', manuallyPaused = false, visible = true, layoutFrame = 0;
    const activeModules = () => tabs[active].dataset.pxModules.split(',').map(Number);
    const modulesForStage = index => tabs[index].dataset.pxModules.split(',').map(Number);
    const wires = moduleButtons.map(button => {
      const path = document.createElementNS(SVG, 'path');
      path.classList.add('px-wire');
      const packet = document.createElementNS(SVG, 'path');
      packet.classList.add('px-packet');
      if (Number(button.dataset.pxModule) > 6) { path.classList.add('is-shared'); packet.classList.add('is-shared'); }
      packet.style.animationDelay = `${-Number(button.dataset.pxModule) * .43}s`;
      wireGroup.append(path); packetGroup.append(packet);
      return {button, path, packet};
    });
    function drawConnections() {
      layoutFrame = 0;
      const bounds = network.getBoundingClientRect();
      if (!bounds.width || !bounds.height) return;
      wireSvg.setAttribute('viewBox', `0 0 ${bounds.width} ${bounds.height}`);
      const card = dossier.getBoundingClientRect();
      const startX = card.left + card.width / 2 - bounds.left;
      const startY = card.bottom - bounds.top + 4;
      wires.forEach(({button, path, packet}, index) => {
        if (button.hidden) return;
        const target = button.getBoundingClientRect();
        const endX = target.left + target.width / 2 - bounds.left;
        const endY = target.top - bounds.top - 3;
        let data;
        if (Number(button.dataset.pxModule) > 6) {
          // Shared modules route around the primary cards and remain visible.
          const sideX = Number(button.dataset.pxModule) === 7 ? 3 : bounds.width - 3;
          const bendY = startY + 17;
          data = `M ${startX} ${startY} V ${bendY} H ${sideX} V ${endY - 12} H ${endX} V ${endY}`;
        } else {
          const bendY = startY + 20 + (index % 3) * 7;
          data = `M ${startX} ${startY} V ${bendY} H ${endX} V ${endY}`;
        }
        path.setAttribute('d', data); packet.setAttribute('d', data);
      });
    }
    function queueLayout() { cancelAnimationFrame(layoutFrame); layoutFrame = requestAnimationFrame(drawConnections); }
    function renderConnections() {
      const connected = activeModules();
      wires.forEach(({button, path, packet}) => {
        const id = Number(button.dataset.pxModule);
        const show = view === 'all' || connected.includes(id);
        button.hidden = !show;
        button.setAttribute('aria-pressed', String(id === inspected));
        [path, packet].forEach(element => {
          element.toggleAttribute('hidden', !show);
          element.classList.toggle('is-inspected', id === inspected);
        });
      });
      const primaryCount = view === 'all' ? 6 : connected.filter(id => id < 7).length;
      const grid = section.querySelector('.px-module-grid');
      grid.dataset.count = String(primaryCount);
      grid.hidden = primaryCount === 0;
      section.querySelector('.px-module-caption').hidden = primaryCount === 0;
      section.querySelector('[data-px-connection-count]').textContent = view === 'all' ? '6 stage modules + 2 shared' : `${primaryCount} ${primaryCount === 1 ? 'stage module' : 'stage modules'} + 2 shared`;
      section.querySelector('[data-px-legend]').textContent = view === 'all' ? 'Stage-specific work' : 'Connected to this stage';
      queueLayout();
    }
    function renderInspector() {
      const button = moduleButtons.find(item => Number(item.dataset.pxModule) === inspected);
      const name = button.querySelector('strong').textContent;
      const stageNames = button.dataset.pxStages.split(',').map(index => tabs[Number(index)].dataset.pxShort);
      section.querySelector('[data-px-module-title]').textContent = name;
      section.querySelector('[data-px-module-copy]').textContent = button.dataset.pxDescription;
      section.querySelector('[data-px-module-used]').textContent = inspected > 6 ? 'Shared support: every stage of the lifecycle' : `Supports: ${stageNames.join(' · ')}`;
      const link = section.querySelector('[data-px-module-link]');
      link.href = `/products/#module-${inspected}`;
      link.setAttribute('aria-label', `Explore ${name}`);
    }
    function selectStage(index, focus = false, announce = true) {
      active = (index + tabs.length) % tabs.length;
      inspected = modulesForStage(active)[0];
      tabs.forEach((tab, i) => {
        const selected = active === i;
        tab.setAttribute('aria-selected', String(selected)); tab.tabIndex = selected ? 0 : -1;
        tab.querySelector('.px-phase-state').firstChild.textContent = selected ? 'In focus' : 'Explore stage';
        panels[i].hidden = !selected;
      });
      room.dataset.pxActive = String(active);
      section.querySelector('[data-px-case-focus]').textContent = tabs[active].dataset.pxCaseNote;
      next.firstChild.textContent = active === tabs.length - 1 ? 'Back to start ' : 'Next stage ';
      next.setAttribute('aria-label', `Show ${tabs[(active + 1) % tabs.length].querySelector('.px-phase-name').textContent}`);
      renderConnections(); renderInspector();
      if (announce) status.textContent = `Stage ${active + 1}: ${tabs[active].querySelector('.px-phase-name').textContent}. The supporting modules and case record are updated.`;
      if (focus) tabs[active].focus({preventScroll: true});
    }
    tabs.forEach((tab, index) => {
      tab.addEventListener('click', () => selectStage(index));
      tab.addEventListener('keydown', event => {
        if (event.altKey || event.ctrlKey || event.metaKey || event.shiftKey) return;
        let target;
        if (event.key === 'ArrowRight' || event.key === 'ArrowDown') target = index + 1;
        if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') target = index - 1;
        if (event.key === 'Home') target = 0;
        if (event.key === 'End') target = tabs.length - 1;
        if (target === undefined) return;
        event.preventDefault(); selectStage(target, true);
      });
    });
    moduleButtons.forEach(button => button.addEventListener('click', () => {
      const id = Number(button.dataset.pxModule);
      const stages = button.dataset.pxStages.split(',').map(Number);
      if (!stages.includes(active)) selectStage(stages[0], false, false);
      inspected = id;
      renderConnections(); renderInspector();
      status.textContent = `${button.querySelector('strong').textContent}. ${button.dataset.pxDescription}${id > 6 ? ' Shared by every stage.' : ` Stage in focus: ${tabs[active].dataset.pxShort}.`}`;
    }));
    views.forEach(button => button.addEventListener('click', () => {
      view = button.dataset.pxView; room.dataset.pxView = view;
      views.forEach(item => item.setAttribute('aria-pressed', String(item === button)));
      renderConnections();
      status.textContent = view === 'all' ? 'Whole system: six stage modules and two shared modules connect to the case record.' : 'This stage: its supporting modules and the two shared modules are shown.';
    }));
    next.addEventListener('click', () => selectStage(active + 1)); next.hidden = false;
    function updateMotion() {
      room.dataset.pxMotion = manuallyPaused || reduced.matches || !visible || document.hidden ? 'paused' : 'running';
      motionButton.hidden = reduced.matches;
      motionButton.setAttribute('aria-pressed', String(manuallyPaused));
      motionButton.querySelector('.px-motion-text').textContent = manuallyPaused ? 'Resume motion' : 'Pause motion';
      motionButton.querySelector('span').textContent = manuallyPaused ? '▷' : 'Ⅱ';
    }
    motionButton.addEventListener('click', () => { manuallyPaused = !manuallyPaused; updateMotion(); });
    document.addEventListener('visibilitychange', updateMotion); reduced.addEventListener('change', updateMotion);
    window.addEventListener('resize', queueLayout, {passive:true});
    if ('ResizeObserver' in window) new ResizeObserver(queueLayout).observe(network);
    if ('IntersectionObserver' in window) new IntersectionObserver(entries => { visible = entries[0].isIntersecting; updateMotion(); }, {threshold:.05}).observe(network);
    document.fonts?.ready.then(queueLayout);
    selectStage(0, false, false); updateMotion();
  });
})();
