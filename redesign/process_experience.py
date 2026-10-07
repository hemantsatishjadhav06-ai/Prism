"""The connected process explorer. Kept separate from page generation."""
from html import escape


WORKFLOW = [
    ('Intake & Eligibility Screening', 'Start with a supported case.', 'Bring claim information together, review eligibility and validate the qualifying payment amount against relevant benchmarks.', 'Claims Ingest|Eligibility Engine|QPA Validator', [1, 2, 3], 'Eligibility review and payment analysis'),
    ('Open Negotiation', 'Prepare the next conversation.', 'Connect negotiation documentation with the case timeline, so the next action is clear to your team.', 'Negotiation Workflow', [4], 'Negotiation documents and a case timeline'),
    ('Federal IDR Filing & Arbitration', 'Bring the evidence together.', 'Prepare the filing, supporting documents and offer strategy for the selected independent dispute resolution entity.', 'IDRE Submission|Deadline Sentinel', [5, 7], 'A filing and supporting evidence packet'),
    ('Recovery & Reconciliation', 'Keep recovery in view.', 'Connect recovery reporting and payer performance with the case record, so your team can review outcomes and the next follow-up.', 'Recovery Analytics', [6], 'Recovery reporting and follow-up visibility'),
    ('Audit-Ready Document Vault', 'Keep the evidence connected.', 'Maintain the documents, timestamps and actions behind each case in a connected record.', 'Audit Trail|Deadline Sentinel', [8, 7], 'A traceable history of the case'),
]

ICONS = [
    '<rect x="12" y="10" width="24" height="31" rx="3"/><path d="M19 10V7a5 5 0 0 1 10 0v3 M17 26l5 5 10-11"/>',
    '<path d="M34 25c3-2 5-6 5-10C39 8 32 3 24 3S9 8 9 15c0 3 1 5 3 7l-3 8 9-3c5 2 11 1 16-2Z M20 33c4 5 11 6 16 4l7 3-2-7c2-2 3-5 3-7 0-3-2-6-5-8"/>',
    '<path d="m27 8 13 13 M22 13l13 13 M24 11l5-5 13 13-5 5 M20 15l5 5-13 13-5-5z M24 34h18v7H24z"/>',
    '<rect x="4" y="11" width="40" height="27" rx="3"/><circle cx="24" cy="24" r="7"/><path d="M4 19a9 9 0 0 0 9-8 M35 11a9 9 0 0 0 9 8 M4 30a9 9 0 0 1 9 8 M35 38a9 9 0 0 1 9-8"/>',
    '<rect x="7" y="8" width="34" height="34" rx="4"/><circle cx="24" cy="25" r="8"/><path d="M24 21v8 M20 25h8 M14 8V4h20v4"/>',
]


def process_section():
    tabs = []
    panels = []
    for i, (name, title, copy, modules, anchors, outcome) in enumerate(WORKFLOW):
        selected = i == 0
        tabs.append(f'''<button type="button" class="px-node" role="tab" id="px-tab-{i}" aria-controls="px-panel-{i}" aria-selected="{str(selected).lower()}" tabindex="{0 if selected else -1}" data-px-index="{i}">
          <span class="px-node-pad" aria-hidden="true"></span><span class="px-node-cube" aria-hidden="true"><svg width="48" height="48" viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">{ICONS[i]}</svg></span>
          <span class="px-node-number" aria-hidden="true">0{i + 1}</span><span class="px-node-label">{escape(name)}</span><span class="px-node-dot" aria-hidden="true"></span></button>''')
        chips = ''.join(f'<a href="/products/#module-{anchor}">{escape(label)}<span aria-hidden="true">↗</span></a>' for label, anchor in zip(modules.split('|'), anchors))
        panels.append(f'''<div class="px-panel" id="px-panel-{i}" role="tabpanel" aria-labelledby="px-tab-{i}" tabindex="0"{' hidden' if not selected else ''}>
          <div class="px-detail-heading"><span class="px-step-kicker">STEP 0{i + 1} <span aria-hidden="true">/</span> 05</span><h3>{escape(title)}</h3><p class="px-detail-stage">{escape(name)}</p></div>
          <div class="px-detail-body"><p class="px-detail-copy">{escape(copy)}</p><div class="px-modules" aria-label="Connected platform modules">{chips}</div><div class="px-output"><span class="px-output-icon" aria-hidden="true">↳</span><div><span>The output</span><p>{escape(outcome)}</p></div></div><a class="px-demo-link" href="/contact/?interest=Platform%20demo">Walk through the platform <span aria-hidden="true">↗</span></a></div></div>''')
    return '''<section class="section px-section" id="process" data-process-experience>
      <div class="container"><div class="section-head px-heading"><div class="eyebrow">The PRISM process</div><div><h2>Connected work.<br>Clear next steps.</h2><p>Software connected with PRISM specialists, from the first claim review to recovery reporting.</p></div></div>
      <div class="px-explorer" data-px-active="0">
        <div class="px-stage-shell">
          <div class="px-stage-top"><span class="px-stage-label"><span aria-hidden="true"></span>ONE CONNECTED WORKFLOW</span><button class="px-motion" type="button" aria-pressed="false" hidden><span class="px-motion-symbol" aria-hidden="true">Ⅱ</span><span class="px-motion-label">Pause motion</span></button></div>
          <div class="px-stage" data-px-stage>
            <div class="px-space" aria-hidden="true"><div class="px-plane px-plane-base"></div><div class="px-plane px-plane-mid"></div><div class="px-plane px-plane-top"></div><div class="px-light-column"></div></div>
            <svg class="px-network" viewBox="0 0 1000 440" preserveAspectRatio="none" fill="none" aria-hidden="true">
              <path class="px-route-base" d="M100 187L300 152L500 198L700 152L900 187"/>
              <path class="px-route-secondary" d="M100 187V287L500 347L900 287V187 M300 152V275L500 315L700 275V152 M500 198V347"/>
              <path class="px-route-pulse" d="M100 187L300 152L500 198L700 152L900 187"/>
              <g class="px-focus-routes"><path data-px-route="0" d="M100 187V287L500 347"/><path data-px-route="1" d="M300 152V275L500 315V347"/><path data-px-route="2" d="M500 198V347"/><path data-px-route="3" d="M700 152V275L500 315V347"/><path data-px-route="4" d="M900 187V287L500 347"/></g>
              <circle class="px-network-end" cx="500" cy="347" r="5"/>
            </svg>
            <div class="px-tabs" role="tablist" aria-label="Explore the five steps in PRISM’s IDR lifecycle" data-process-tabs>''' + ''.join(tabs) + '''</div>
            <div class="px-foundation" aria-hidden="true"><span class="px-foundation-icon">⌘</span><span>Connected case record</span><span class="px-foundation-lights"><i></i><i></i><i></i></span></div>
            <div class="px-layer-labels" aria-hidden="true"><span>01 &nbsp; Workflow</span><span>02 &nbsp; Coordination</span><span>03 &nbsp; Case history</span></div>
          </div>
          <div class="px-stage-bottom"><p><span class="px-interaction-dot" aria-hidden="true"></span>Select a stage to follow the connections.</p><span class="px-stage-count" aria-hidden="true">01 <span>/ 05</span></span></div>
        </div>
        <div class="px-detail-shell">''' + ''.join(panels) + '''<div class="px-detail-footer"><p>Documents, deadlines and case history stay connected throughout the lifecycle.</p><button type="button" class="px-next" data-px-next hidden><span>Next stage</span><span aria-hidden="true">→</span></button></div></div>
      </div></div>
    </section>'''
