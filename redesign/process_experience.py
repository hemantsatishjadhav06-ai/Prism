"""Compact, connected claim workflow shared by Home and Platform."""
from html import escape

WORKFLOW = [
 ('Intake & Eligibility Screening','Bring claim information together, review eligibility and validate the qualifying payment amount against relevant benchmarks.','Claims Ingest|Eligibility Engine|QPA Validator',[1,2,3],'Eligibility review and payment analysis','review'),
 ('Open Negotiation','Connect negotiation documentation with the case timeline, so the next action is clear to your team.','Negotiation Workflow',[4],'Negotiation documents and a case timeline','coordinate'),
 ('Federal IDR Filing & Arbitration','Prepare the filing, supporting documents and offer strategy for the selected independent dispute resolution entity.','IDRE Submission|Deadline Sentinel',[5,7],'A filing and supporting evidence packet','coordinate'),
 ('Recovery & Reconciliation','Connect recovery reporting and payer performance with the case record, so your team can review outcomes and the next follow-up.','Recovery Analytics',[6],'Recovery reporting and follow-up visibility','recover'),
 ('Audit-Ready Document Vault','Keep documents, timestamps and actions together in a connected case record, organized from the start.','Audit Trail|Deadline Sentinel',[8,7],'A traceable history of the case','shared'),
]
GROUPS = [
 ('review','Review','Claim & payment context',0,[('Claims Ingest',1),('Eligibility Engine',2),('QPA Validator',3)]),
 ('coordinate','Coordinate','Negotiation & filing',1,[('Negotiation Workflow',4),('IDRE Submission',5)]),
 ('recover','Recover','Outcomes & follow-up',3,[('Recovery Analytics',6)]),
]
ICONS = {
 'review':'<rect x="5" y="4" width="14" height="18" rx="2"/><path d="M9 4V2h6v2M8 11h8M8 15h5"/>',
 'coordinate':'<rect x="2" y="3" width="8" height="7" rx="1.5"/><rect x="14" y="14" width="8" height="7" rx="1.5"/><path d="M6 10v7h8M18 14V7h-4M12 5l2 2-2 2"/>',
 'recover':'<path d="M4 4v16h17M8 15l4-4 4 2 5-7M17 6h4v4"/>',
}

def process_section():
 stages=[]
 for i,(name,copy,labels,anchors,outcome,group) in enumerate(WORKFLOW):
  links=''.join(f'<a href="/products/#module-{a}">{escape(label)}<span aria-hidden="true">↗</span></a>' for label,a in zip(labels.split('|'),anchors))
  stages.append(f'''<div class="px-stage{' is-active' if i==0 else ''}"><h3><button class="px-stage-toggle" type="button" id="px-stage-{i}" aria-expanded="{str(i==0).lower()}" aria-disabled="{str(i==0).lower()}" aria-controls="px-panel-{i}" data-px-stage="{i}" data-px-group="{group}"><span class="px-stage-number" aria-hidden="true">0{i+1}</span><span>{escape(name)}</span><span class="px-stage-sign" aria-hidden="true">{'−' if i==0 else '+'}</span></button></h3><div class="px-panel" id="px-panel-{i}" role="region" aria-labelledby="px-stage-{i}"{' hidden' if i else ''}><p>{escape(copy)}</p><div class="px-outcome"><span>The output</span><strong>{escape(outcome)}</strong></div><div class="px-module-links" aria-label="Software for {escape(name,quote=True)}">{links}</div></div></div>''')
 cards=[]
 for name,title,subtitle,index,modules in GROUPS:
  links=''.join(f'<a href="/products/#module-{a}">{escape(label)}</a>' for label,a in modules)
  icon=f'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">{ICONS[name]}</svg>'
  cards.append(f'''<div class="px-station px-station-{name}{' is-active' if index==0 else ''}" data-px-station="{name}"><div class="px-station-inner"><button type="button" class="px-station-select" data-px-select="{index}" aria-label="{title}: explore {escape(WORKFLOW[index][0],quote=True)}" aria-pressed="{str(index==0).lower()}">{icon}<span>{title}</span><span class="px-port" aria-hidden="true"></span></button><p>{subtitle}</p><div class="px-station-links">{links}</div></div></div>''')
 return '''<section class="section px-section" id="process" data-process-experience><div class="container"><div class="section-head px-heading"><div class="eyebrow">The PRISM process</div><div><h2>Every step. Connected.</h2><p>Explore five stages of a claim, supported by one connected platform and specialist team.</p></div></div><div class="px-control-room" data-px-group="review"><div class="px-story"><div class="px-accordion">'''+''.join(stages)+'''</div></div><div class="px-architecture"><div class="px-diagram-header"><div><span class="px-diagram-kicker">One connected workflow</span><p>From review to recovery.</p></div><button class="px-motion" type="button" aria-pressed="false" hidden><span aria-hidden="true">Ⅱ</span><span class="px-motion-text">Pause motion</span></button></div><div class="px-diagram"><div class="px-base-plane" aria-hidden="true"></div><svg class="px-connections" viewBox="0 0 600 350" preserveAspectRatio="none" fill="none" aria-hidden="true"><path class="px-backbone" d="M 104 211 V 257 Q 104 270 118 270 H 493 Q 505 270 505 257 V 238 M 305 166 V 270 M 305 270 V 320"/><path class="px-route" data-px-route="review" d="M104 211 V257 Q104 270 118 270 H305 V320"/><path class="px-route" data-px-route="coordinate" d="M305 166 V320"/><path class="px-route" data-px-route="recover" d="M505 238 V257 Q505 270 491 270 H305 V320"/><path class="px-route px-route-shared" data-px-route="shared" d="M104 211 V257 Q104 270 118 270 H493 Q505 270 505 257 V238 M305 166 V320"/><path class="px-flow" d="M104 211 V257 Q104 270 118 270 H305 V320"/><circle cx="305" cy="270" r="4" class="px-junction"/></svg>'''+''.join(cards)+'''<div class="px-common-rail" data-px-shared><span class="px-rail-icon" aria-hidden="true">⌘</span><div><span class="px-rail-label">Connected at every stage</span><div><a href="/products/#module-7">Deadline Sentinel</a><span aria-hidden="true"> / </span><a href="/products/#module-8">Audit Trail</a></div></div></div></div><div class="px-diagram-note"><span class="px-note-dot" aria-hidden="true"></span><p>Documents, deadlines and history stay with the case.</p></div></div><span class="px-screen-reader" role="status" aria-live="polite" aria-atomic="true" data-px-status></span></div></div></section>'''
