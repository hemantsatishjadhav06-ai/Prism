"""Practical PRISM explanations drawn from its supplied brochure and public pages.

Apply after imagery enrichment.  Content is authored as marketing explanation,
not legal advice, and the claim example is explicitly illustrative.
"""


def _replace_once(content, needle, replacement, label):
    count = content.count(needle)
    if count != 1:
        raise ValueError(f'{label}: expected one content insertion point, found {count}')
    return content.replace(needle, replacement, 1)


def _before_cta(content, section, label):
    marker = '<section class="cta-section light">'
    return _replace_once(content, marker, section + marker, label)


def _capabilities():
    return '''<section class="section cc-capabilities" aria-labelledby="cc-capability-title"><div class="container">
    <div class="cc-intro"><div><div class="eyebrow">Fully managed IDR</div><h2 id="cc-capability-title">The work behind<br>payment resolution.</h2></div><div><p>Independent Dispute Resolution services for the No Surprises Act, with software and specialists working together.</p><a class="text-link" href="/products/">See how the platform connects the work <span aria-hidden="true">↗</span></a></div></div>
    <div class="cc-pillar-grid">
    <article class="cc-pillar"><span class="cc-pillar-index" aria-hidden="true">01 / UNDERSTAND</span><div class="cc-pillar-symbol" aria-hidden="true"><span></span><span></span><span></span></div><h3>Smart NSA<br>eligibility.</h3><p>Bring claim facts into a structured review and identify the appropriate dispute pathway before moving forward.</p><a class="cc-arrow-link" href="/products/#module-2">Eligibility Engine <span aria-hidden="true">↗</span></a></article>
    <article class="cc-pillar"><span class="cc-pillar-index" aria-hidden="true">02 / COORDINATE</span><div class="cc-pillar-symbol cc-symbol-route" aria-hidden="true"><span></span><span></span><span></span></div><h3>Automated<br>IDR workflow.</h3><p>Connect letters, case materials and deadline visibility so each handoff has the context it needs.</p><a class="cc-arrow-link" href="/products/#module-4">Negotiation Workflow <span aria-hidden="true">↗</span></a></article>
    <article class="cc-pillar"><span class="cc-pillar-index" aria-hidden="true">03 / DOCUMENT</span><div class="cc-pillar-symbol cc-symbol-record" aria-hidden="true"><span></span><span></span><span></span></div><h3>Zero-Day<br>Audit Preparation.</h3><p>Organize supporting documents, timestamps and case activity from the first review, maintaining the record throughout the lifecycle for later audit preparation.</p><a class="cc-arrow-link" href="/products/#module-8">Audit Trail <span aria-hidden="true">↗</span></a></article>
    </div><div class="cc-bridge"><span class="cc-bridge-mark" aria-hidden="true">+</span><p><strong>Technology coordinates the workflow.</strong> Specialists guide strategy and manage the dispute work your team delegates.</p><a href="/services/">Explore managed services <span aria-hidden="true">↗</span></a></div>
    </div></section>'''


def _module_directory():
    groups = (
        ('01', 'Understand the claim', 'Bring the payment, eligibility and benchmark context together.', ((1, 'Claims Ingest'), (2, 'Eligibility Engine'), (3, 'QPA Validator'))),
        ('02', 'Move the dispute forward', 'Prepare negotiation materials and supporting submissions.', ((4, 'Negotiation Workflow'), (5, 'IDRE Submission'))),
        ('03', 'See the recovery picture', 'Follow outcomes and compare patterns across payers.', ((6, 'Recovery Analytics'),)),
        ('04', 'Keep the case connected', 'Carry deadlines and documentation across every stage.', ((7, 'Deadline Sentinel'), (8, 'Audit Trail'))),
    )
    cards = ''.join(f'''<article class="cc-module-group"><span class="cc-group-index">{number}</span><h3>{heading}</h3><p>{description}</p><nav aria-label="{heading} modules">{''.join(f'<a href="#module-{i}">{name}<span aria-hidden="true">↗</span></a>' for i, name in links)}</nav></article>''' for number, heading, description, links in groups)
    return f'<div class="cc-module-directory">{cards}</div>'


def _claim_example():
    steps = (
        ('01', 'Claim facts', 'An EOB or remittance, service information and payment details enter the workspace.'),
        ('02', 'Pathway review', 'Eligibility classification helps determine the appropriate next step.'),
        ('03', 'Case support', 'Payment comparisons and supporting documents inform the negotiation approach.'),
        ('04', 'Next action', 'Track negotiation, prepare an IDR submission where appropriate, and record the outcome.'),
    )
    items = ''.join(f'<li><span>{number}</span><div><h3>{heading}</h3><p>{copy}</p></div></li>' for number, heading, copy in steps)
    return f'''<section class="section cc-example" aria-labelledby="cc-example-title"><div class="container"><div class="cc-example-grid"><div><div class="eyebrow">An illustrative claim journey</div><h2 id="cc-example-title">From a payment question<br>to a documented next step.</h2><p class="cc-example-intro">For example, an emergency medicine group identifies a payment it wants to review. The case moves with its evidence and history.</p><p class="cc-example-note">Illustrative workflow. The applicable pathway depends on the claim; not every underpayment qualifies for federal IDR.</p></div><ol class="cc-example-steps">{items}</ol></div></div></section>'''


def _managed_handoffs():
    return '''<section class="section cc-managed" aria-labelledby="cc-managed-title"><div class="container"><div class="cc-intro"><div><div class="eyebrow">A clear division of work</div><h2 id="cc-managed-title">Your practice context.<br>Our dispute expertise.</h2></div><p>Choose a focused service or delegated operations. Agree on the scope, case ownership and reporting during discovery.</p></div>
    <div class="cc-handoff-grid"><article><span class="cc-handoff-label">YOUR TEAM PROVIDES</span><h3>The claim context.</h3><ul><li>Claim and payment records</li><li>Specialty and service context</li><li>Recovery priorities and approval contacts</li></ul></article><div class="cc-handoff-connector" aria-hidden="true"><span>Shared<br>case context</span><i>↔</i></div><article><span class="cc-handoff-label">PRISM COORDINATES</span><h3>The agreed dispute work.</h3><ul><li>Calculation and offer preparation</li><li>Payer negotiation and filing support</li><li>Case documentation and recovery reporting</li></ul></article></div>
    <details class="cc-scope-detail"><summary>What does the first conversation establish?</summary><div><p>Your service lines, payer mix and current workflow shape the proposed engagement. A signed BAA comes before sample EOB review.</p><a class="text-link" href="/contact/">Discuss your workflow <span aria-hidden="true">↗</span></a></div></details>
    </div></section>'''


def _about_principle():
    return '''<section class="section cc-purpose" aria-labelledby="cc-purpose-title"><div class="container"><div class="cc-purpose-grid"><div><div class="eyebrow">Payment Resolution &amp; IDR System Management</div><h2 id="cc-purpose-title">A complete process.<br>A provider perspective.</h2><p>PRISM brings healthcare, regulatory, actuarial and revenue cycle perspectives into the work of payment resolution.</p></div><div class="cc-purpose-notes"><article><span>01</span><div><h3>Clinical care stays with clinicians.</h3><p>We support the reimbursement work surrounding the care your teams deliver.</p></div></article><article><span>02</span><div><h3>Evidence travels with the case.</h3><p>Calculations, documents and case history give each handoff a shared starting point.</p></div></article><article><span>03</span><div><h3>Strategy meets operations.</h3><p>Specialist judgement and a connected workflow turn the next action into coordinated work.</p></div></article></div></div></div></section>'''


def enrich_content(home, products, services, about, contact):
    """Return five page strings with concise, source-backed explanations."""
    home_marker = '<section class="section" id="approach">'
    home = _replace_once(home, home_marker, _capabilities() + home_marker, 'Home capabilities')

    module_marker = '<div class="module-grid">'
    products = _replace_once(products, module_marker, _module_directory() + module_marker, 'Platform module groups')
    outputs = (
        'Claim records ready for review',
        'An eligibility classification',
        'Payment comparisons for case review',
        'Negotiation materials and case status',
        'A supporting submission packet',
        'A view of recovery patterns',
        'Visible deadlines and attention items',
        'A documented case history',
    )
    phases = ('Claim context', 'Claim context', 'Claim context', 'Dispute execution', 'Dispute execution', 'Recovery visibility', 'Case foundation', 'Case foundation')
    for i, (output, phase) in enumerate(zip(outputs, phases), 1):
        marker = f'<article class="module-card" id="module-{i}">'
        products = _replace_once(products, marker, f'<article class="module-card cc-module" id="module-{i}" data-module-group="{phase}">', f'Platform module {i}')
        start = products.index(f'id="module-{i}"')
        end = products.index('</article>', start)
        fragment = products[start:end]
        fragment = fragment.replace('<h3>', f'<span class="cc-module-phase">{phase}</span><h3>', 1)
        fragment = fragment.replace('</p></div>', f'</p><div class="cc-module-output"><span>Work moves forward as</span><strong>{output}</strong></div></div>', 1)
        products = products[:start] + fragment + products[end:]
    products = _before_cta(products, _claim_example(), 'Platform claim example')

    service_scopes = (
        ('QPA review and offer modeling informed by specialty, geography and case mix.', ('Specialty and geographic comparisons', 'QPA review and offer preparation', 'Supporting case materials')),
        ('Preparation of negotiation documentation, payer coordination and timeline management.', ('Initiation materials and payer follow-up', 'Settlement evaluation', 'Handoff to IDR where appropriate')),
        ('Support with entity selection, dispute filings and supporting case materials.', ('IDR entity selection support', 'Case information assembly', 'Offer submission and response coordination')),
        ('Review underpaid claims and develop the appropriate recovery approach.', ('ERISA appeal support', 'State dispute pathway review', 'Contractual underpayment review')),
        ('Hand over day-to-day dispute administration with visibility into your case pipeline.', ('Case coordination and administration', 'Payer-level performance visibility', 'Recovery reporting')),
        ('Help your team build the knowledge and workflows to manage IDR more confidently.', ('NSA workflow training', 'QPA review guidance', 'Practice-specific operating procedures')),
    )
    for i, (description, items) in enumerate(service_scopes, 1):
        marker = f'<p>{description}</p>'
        addition = '<ul class="cc-service-scope">' + ''.join(f'<li>{item}</li>' for item in items) + '</ul>'
        services = _replace_once(services, marker, marker + addition, f'Service {i} scope')
    partnership_marker = '<section class="section platform-section" id="partnership">'
    services = _replace_once(services, partnership_marker, _managed_handoffs() + partnership_marker, 'Services division of work')

    values_marker = '<section class="section"><div class="container"><div class="section-head"><div class="eyebrow">What guides us</div>'
    about = _replace_once(about, values_marker, _about_principle() + values_marker, 'About operating principle')
    return home, products, services, about, contact
