from pathlib import Path
from html import escape
import json
import os
from hashlib import sha256

ROOT = Path(__file__).parent
DIST = ROOT / 'dist'
ORIGIN = os.environ.get('SITE_ORIGIN', 'https://prism.inc').rstrip('/')

def asset_url(name):
    version = sha256((DIST / name).read_bytes()).hexdigest()[:12]
    return f'/{name}?v={version}'

NAV = [('Platform', '/products/'), ('Services', '/services/'), ('About PRISM', '/about/')]

def header(path):
    links = ''.join(f'<a class="nav-link" href="{url}"' + (' aria-current="page"' if path == url else '') + f'>{name}</a>' for name, url in NAV)
    return f'''<a class="skip-link" href="#main">Skip to content</a>
    <header class="site-header"><a class="brand" href="/" aria-label="PRISM home"><img src="/assets/prism-logo-small.png" alt="PRISM" width="690" height="128"></a>
    <button class="menu-toggle" aria-label="Toggle navigation" aria-expanded="false" aria-controls="primary-navigation"><span>Menu</span><span class="menu-icon" aria-hidden="true"><i></i><i></i></span></button>
    <nav class="primary-nav" id="primary-navigation" aria-label="Main navigation">{links}<a class="btn header-cta" href="/contact/">Let’s talk recovery</a></nav></header>'''

def footer():
    return '''<footer class="site-footer"><div class="container"><div class="footer-main">
    <div><a class="footer-brand" href="/" aria-label="PRISM home"><img src="/assets/prism-logo-small.png" alt="PRISM" width="690" height="128" loading="lazy"></a><p>Payment Resolution &amp; IDR System Management.<br>Precision in the process. Focus on the provider.</p></div>
    <div><h3>Explore PRISM</h3><nav class="footer-links" aria-label="Footer navigation"><a href="/">Home</a><a href="/products/">Platform</a><a href="/services/">Services</a><a href="/about/">About PRISM</a><a href="/contact/">Contact</a></nav></div>
    <div><h3>Start a conversation</h3><div class="footer-links"><a href="mailto:info@prism.inc">info@prism.inc</a><span>United States</span><a href="/contact/">Request a consultation</a></div></div>
    </div><div class="footer-bottom"><span>© 2026 PRISM Inc. All rights reserved.</span><span>Payment Resolution &amp; IDR System Management</span></div></div></footer>'''

def cta(title='Bring clarity to<br>your next claim.', copy='Connect with PRISM to explore the right mix of technology and IDR expertise for your practice.', label='Request a consultation'):
    return f'''<section class="cta-section light"><div class="container"><div class="eyebrow">A clearer way forward</div><div class="cta-grid"><h2>{title}</h2><div><p>{copy}</p><a class="btn btn-white" href="/contact/">{label}</a></div></div></div></section>'''

def page_hero(label, title, copy, action='', action_label=''):
    btn = f'<a class="btn" href="{action}">{action_label}</a>' if action else ''
    return f'''<section class="page-hero"><div class="container"><div class="breadcrumb"><a href="/">Home</a><span aria-hidden="true">/</span><span>{label}</span></div><div class="intro-grid"><div><div class="eyebrow">{label}</div><h1>{title}</h1></div><div class="lead"><p>{copy}</p>{btn}</div></div></div></section>'''

WORKFLOW = [
    ('Review the claim', 'Start with a supported case.', 'Bring claim information together, review eligibility and validate the qualifying payment amount against relevant benchmarks.', 'Claims Ingest|Eligibility Engine|QPA Validator', [1,2,3], 'Eligibility review and payment analysis'),
    ('Open negotiation', 'Prepare the next conversation.', 'Connect negotiation documentation with the case timeline, so the next action is clear to your team.', 'Negotiation Workflow', [4], 'Negotiation documents and a case timeline'),
    ('IDR submission', 'Bring the case together.', 'Assemble the filing and the supporting information for the independent dispute resolution process.', 'IDRE Submission', [5], 'A filing and supporting information packet'),
    ('Deadlines', 'Keep the next action in view.', 'Follow case deadlines across the workflow and identify the items that need attention.', 'Deadline Sentinel', [7], 'Deadline visibility across every stage'),
    ('Case record', 'Keep the evidence connected.', 'Maintain the documents, timestamps and actions behind each case in a connected record.', 'Audit Trail', [8], 'A traceable history of the case'),
    ('Recovery visibility', 'Understand the wider picture.', 'Review outcomes, payer performance and recovery trends alongside the dispute pipeline.', 'Recovery Analytics', [6], 'A clearer view of recovery performance'),
]

CUBE = '''<svg class="stage-cube" width="180" height="175" viewBox="0 0 180 175" fill="none" aria-hidden="true"><path class="cube-top" d="M90 11L163 53L90 96L17 53Z"/><path class="cube-front" d="M17 53L90 96V163L17 121Z"/><path class="cube-side" d="M90 96L163 53V121L90 163Z"/><path class="cube-inset" d="M90 48L125 68L90 89L55 68Z M55 68V97L90 118L125 97V68 M90 89V118"/></svg>'''

def workflow():
    tabs = ''.join(f'<button class="process-stage" role="tab" id="tab-{i}" aria-controls="panel-{i}" aria-selected="{str(i == 0).lower()}" tabindex="{0 if i == 0 else -1}"><span class="stage-index">0{i+1} / {label}</span>{CUBE}<span class="stage-title">{WORKFLOW[i][0]}</span></button>' for i,label in enumerate(['REVIEW','NEGOTIATE','SUBMIT']))
    support = ''.join(f'<button class="foundation-item" role="tab" id="tab-{i}" aria-controls="panel-{i}" aria-selected="false" tabindex="-1"><span class="foundation-dot" aria-hidden="true"></span>{WORKFLOW[i][0]}</button>' for i in range(3,6))
    panels = ''
    for i,(name,title,copy,modules,anchors,outcome) in enumerate(WORKFLOW):
        chips = ''.join(f'<a href="/products/#module-{anchor}">{label}</a>' for label,anchor in zip(modules.split('|'),anchors))
        panels += f'<div class="process-panel" role="tabpanel" id="panel-{i}" aria-labelledby="tab-{i}" tabindex="0"' + (' hidden' if i else '') + f'><span class="process-kicker">'+ (f'STAGE 0{i+1}' if i<3 else 'SUPPORTS EVERY STAGE') + f'</span><h3>{title}</h3><p>{copy}</p><div class="process-modules">{chips}</div><div class="process-output"><span>The output</span><p>{outcome}</p></div><a class="text-link" href="/contact/?interest=Platform%20demo">Walk through the platform</a></div>'
    return f'''<div class="process-explorer"><div class="process-diagram" role="tablist" aria-label="Explore PRISM stages and shared capabilities"><div class="process-stages">{tabs}</div><div class="process-foundation"><div class="foundation-heading">A shared foundation across the lifecycle</div><div class="foundation-items">{support}</div></div><p class="diagram-help">Select a stage or capability to explore.</p></div><div class="process-details">{panels}</div></div>'''

def process_section():
    return '<section class="section process-section" id="process"><div class="container"><div class="section-head"><div class="eyebrow">The PRISM process</div><div><h2>Connected work.<br>Clear next steps.</h2><p>Software connected with PRISM specialists, from the first claim review to recovery reporting.</p></div></div>' + workflow() + '</div></section>'

HOME = '''<section class="hero hero-video-hero">
<div class="hero-background"><video id="hero-video" muted loop playsinline preload="metadata" poster="/assets/prism-hero-poster.webp" aria-label="Quiet healthcare team collaboration"><source src="/assets/prism-hero-kling.mp4" type="video/mp4"></video></div>
<div class="container hero-main"><div class="hero-copy"><div class="eyebrow">Payment Resolution &amp; IDR System Management</div><h1>Clarity for<br>every claim.</h1><p class="hero-description">Out-of-network payment resolution.<br>One connected platform. Expert IDR support.<br>More focus on the care you provide.</p><div class="btn-group"><a class="btn btn-white" href="/contact/">Request a consultation</a><a class="btn" href="/products/">Explore the platform</a></div><p class="hero-proof">Technology and white-glove expertise, together.</p></div></div>
<button class="video-control" type="button" aria-controls="hero-video" aria-label="Play hero video"><svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true"><path d="M5 3L13 8L5 13Z" fill="currentColor"/></svg><span>Play video</span></button>
<div class="hero-base"><span>Precision throughout the IDR lifecycle.</span><a href="#process">Explore our process</a></div></section>''' + process_section() + '''
<section class="section" id="approach"><div class="container"><div class="section-head"><div class="eyebrow">The PRISM approach</div><div><h2>Complex claims.<br>Clearer thinking.</h2><p>Connect the calculations, the documentation and the people behind every dispute.</p></div></div>
<div class="statement-row"><div class="statement-label"><span>( 01 )</span><span>Precision</span></div><div><h3>Start with a defensible calculation.</h3><p>QPA validation and strategic offer modeling help turn an underpayment into a well-supported case.</p></div></div>
<div class="statement-row"><div class="statement-label"><span>( 02 )</span><span>Connection</span></div><div><h3>Bring the entire process together.</h3><p>One platform connects eligibility, negotiation, submissions and reporting.</p></div></div>
<div class="statement-row"><div class="statement-label"><span>( 03 )</span><span>Partnership</span></div><div><h3>Put provider priorities first.</h3><p>White-glove consulting brings hands-on expertise to your revenue cycle workflow.</p></div></div></div></section>
<section class="section section-white"><div class="container"><div class="section-head"><div class="eyebrow">Solutions for your practice</div><div><h2>The right support.<br>At every stage.</h2></div></div><div class="solution-grid">
<a class="solution-card solution-technology" href="/products/"><div><p class="card-category">01 / TECHNOLOGY</p><h3>The PRISM<br>IDR platform.</h3><div class="module-visual"><span>Review</span><span>Negotiate</span><span>Submit</span><small>One connected workspace</small></div></div><div><p>Connect the entire dispute lifecycle in one workspace.</p><div class="card-action"><span>Explore the platform</span><b aria-hidden="true">01</b></div></div></a>
<a class="solution-card" href="/services/"><img src="/assets/care-team.jpg" loading="lazy" alt="" width="1200" height="1800"><div><p class="card-category">02 / EXPERTISE</p><h3>White-glove<br>IDR services.</h3></div><div><p>Specialist support for calculations, negotiations and federal disputes.</p><div class="card-action"><span>Discover our services</span><b aria-hidden="true">02</b></div></div></a>
<a class="solution-card solutions-light" href="/services/#partnership"><div><p class="card-category">03 / PARTNERSHIP</p><h3>Your team.<br>Our expertise.</h3><p class="card-symbol" aria-hidden="true">Together.</p></div><div><p>Outsourced operations and advisory support that fit your practice.</p><div class="card-action"><span>Find your engagement</span><b aria-hidden="true">03</b></div></div></a></div>
<div class="audiences"><p>Supporting providers across specialties</p><div class="audience-list"><span>Emergency medicine</span><span>Anesthesiology</span><span>Radiology</span><span>Hospitalists</span><span>Pathology</span></div></div></div></section>
<section class="section"><div class="container faq-layout"><div><div class="eyebrow">Common questions</div><h2>A little more<br>clarity.</h2><a class="text-link" href="/contact/">Talk to an IDR specialist</a></div><div class="accordion">
<details><summary>What does PRISM do?</summary><p>PRISM combines IDR software and consulting to support out-of-network reimbursement recovery under the No Surprises Act.</p></details>
<details><summary>Can I use the platform and services together?</summary><p>PRISM offers both proprietary software and consulting. A consultation helps determine the right engagement for your workflow.</p></details>
<details><summary>Which providers do you work with?</summary><p>PRISM supports physician groups and healthcare organizations. Explore our About page for the specialties and settings we serve.</p></details>
<details><summary>How do we get started?</summary><p>Contact PRISM for a discovery conversation. A BAA is signed before any sample EOB analysis; please keep medical information out of the inquiry form.</p></details></div></div></section>''' + cta()

MODULES = [
    ('Claims Ingest','Bring EOBs and remittances into the workflow with SFTP and X12 835 parsing.'),
    ('Eligibility Engine','Classify claims by NSA, state law, ERISA or out-of-scope status.'),
    ('QPA Validator','Compare payment amounts with FAIR Health, geographic and historical rate benchmarks.'),
    ('Negotiation Workflow','Prepare Open Negotiation letters and manage the negotiation timeline.'),
    ('IDRE Submission','Assemble filings and supporting information for the selected dispute entity.'),
    ('Recovery Analytics','Review win rates, payer performance and recovery trends.'),
    ('Deadline Sentinel','Track case deadlines and route items that need attention.'),
    ('Audit Trail','Keep the documents, timestamps and actions behind each case together.'),
]
PRODUCTS = page_hero('Platform','Every dispute.<br>One source<br>of clarity.','The PRISM IDR Platform connects eight integrated modules for No Surprises Act dispute management.','/contact/?interest=Platform%20demo','Book a platform demo')
PRODUCTS += '<section class="section section-white"><div class="container"><div class="section-head"><div class="eyebrow">Eight integrated modules</div><div><h2>Built around the<br>work you do.</h2></div></div><div class="module-grid">'
PRODUCTS += ''.join(f'<article class="module-card" id="module-{i+1}"><span class="module-number">0{i+1}</span><div><h3>{name}</h3><p>{copy}</p></div></article>' for i,(name,copy) in enumerate(MODULES))
PRODUCTS += '</div></div></section>' + process_section() + cta('See the platform.<br>Explore the possibilities.','Book a 45-minute working demo with PRISM’s IDR strategists.','Schedule a demo')

SERVICES_DATA = [
    ('IDR Calculation','QPA review and offer modeling informed by specialty, geography and case mix.'),
    ('Open Negotiation Management','Preparation of negotiation documentation, payer coordination and timeline management.'),
    ('Federal IDR Representation','Support with entity selection, dispute filings and supporting case materials.'),
    ('Appeals & Underpayment Recovery','Review underpaid claims and develop the appropriate recovery approach.'),
    ('Outsourced IDR Operations','Hand over day-to-day dispute administration with visibility into your case pipeline.'),
    ('Training & Advisory','Help your team build the knowledge and workflows to manage IDR more confidently.'),
]
SERVICES = page_hero('Services','The expertise<br>behind your<br>next resolution.','White-glove IDR consulting, built around the needs of your practice. From a targeted calculation to outsourced operations.','/contact/','Find your engagement')
SERVICES += '<section class="section section-white"><div class="container service-layout"><div class="intro"><div class="eyebrow">Specialist support</div><h2>Focused on<br>your recovery.</h2><p>Choose the support your team needs at each stage of the dispute lifecycle.</p></div><div class="accordion service-list">'
SERVICES += ''.join(f'<details id="service-{i+1}"' + (' open' if i==0 else '') + f'><summary><span class="service-num">0{i+1}</span><span class="service-title">{name}</span></summary><p>{copy}</p></details>' for i,(name,copy) in enumerate(SERVICES_DATA))
SERVICES += '</div></div></section><section class="section platform-section" id="partnership"><div class="container"><div class="section-head"><div class="eyebrow">How we work together</div><div><h2>A deliberate process.<br>A shared direction.</h2></div></div><div class="steps">'
SERVICES += ''.join(f'<article class="step"><div class="step-number">0{i+1}</div><h3>{name}</h3><p>{copy}</p></article>' for i,(name,copy) in enumerate([('Discovery','Understand your claims, workflow and recovery priorities.'),('Strategy','Develop an approach tailored to your practice and case mix.'),('Execution','Put the calculations, negotiations and filings into motion.'),('Reporting','Keep the dispute pipeline and recovery performance in view.')]))
SERVICES += '</div></div></section>' + cta('The right expertise.<br>For your practice.','Discuss your backlog, operational needs and engagement options with PRISM.')

ABOUT = page_hero('About PRISM','Precision<br>with a provider<br>perspective.','PRISM stands for Payment Resolution & IDR System Management. Our focus: helping healthcare providers navigate complex out-of-network reimbursement.')
ABOUT += '''<section class="section section-white"><div class="container human-section"><img class="human-photo" src="/assets/care-team.jpg" alt="Healthcare professional in a clinic" width="1200" height="1800" loading="lazy"><div><div class="eyebrow">Why PRISM</div><h2>More focus<br>on care.<br>More clarity<br>in recovery.</h2><p>We bring software and specialist expertise together so providers can approach IDR with a structured process.</p><p>Our perspective connects healthcare, regulatory, actuarial and revenue cycle experience.</p><a class="text-link" href="/services/">Meet our approach to IDR</a></div></div></section>
<section class="section"><div class="container"><div class="section-head"><div class="eyebrow">What guides us</div><div><h2>Clear principles.<br>Consistent practice.</h2></div></div><div class="values-grid">'''
ABOUT += ''.join(f'<article class="value"><p class="value-no">( 0{i+1} )</p><h3>{name}</h3><p>{copy}</p></article>' for i,(name,copy) in enumerate([('Provider first','Keep provider priorities at the center of the process.'),('Defensible math','Build the case on careful calculations and supporting evidence.'),('Aligned incentives','Connect engagement structure with recovery objectives.'),('Operational rigor','Give each case a clear workflow and accountable next step.')]))
ABOUT += '</div></div></section><section class="section platform-section"><div class="container"><div class="section-head"><div class="eyebrow">Who we serve</div><div><h2>Across specialties.<br>Across care settings.</h2></div></div><div class="provider-grid">'
ABOUT += ''.join(f'<div>{name}</div>' for name in ['Emergency physicians','Anesthesiologists','Radiologists','Hospitalists','Pathologists','Hospitals','Surgery centers','Freestanding ERs','Air ambulance providers'])
ABOUT += '</div></div></section>' + cta('Let’s build<br>a clearer path.','Tell us about your practice and the reimbursement challenges you want to solve.')

CONTACT = page_hero('Contact','Let’s talk<br>recovery.','Tell us about your practice and where you need support. Start with a conversation, and we’ll find the right next step together.')
CONTACT += '''<section class="section section-white"><div class="container contact-layout"><div class="contact-info"><div class="eyebrow">Reach PRISM directly</div><h2>A conversation<br>starts here.</h2><a class="contact-mail" href="mailto:info@prism.inc">info@prism.inc</a><p class="location">United States</p><div class="contact-steps"><h3>What happens next</h3><ol><li>PRISM reviews your inquiry.</li><li>A 30-minute discovery call with an IDR specialist.</li><li>A BAA before any sample EOB analysis.</li><li>A recovery diagnostic and recommended engagement.</li></ol></div></div>
<div><p class="form-top">Tell us a little about your practice · Required fields marked *</p><form id="inquiry-form"><div class="form-grid">
<div class="field"><label for="name">Full name *</label><input id="name" name="name" type="text" autocomplete="name" required maxlength="120" placeholder="Your name"></div>
<div class="field"><label for="email">Work email *</label><input id="email" name="email" type="email" autocomplete="email" required maxlength="200" placeholder="you@practice.com"></div>
<div class="field"><label for="company">Company / practice</label><input id="company" name="company" autocomplete="organization" maxlength="200" placeholder="Practice name"></div>
<div class="field"><label for="phone">Phone</label><input id="phone" name="phone" type="tel" autocomplete="tel" maxlength="40" placeholder="Your phone number"></div>
<div class="field full"><label for="interest">Service of interest</label><select id="interest" name="interest"><option value="">Select a service</option><option>Platform demo</option><option>IDR Calculation</option><option>Open Negotiation Management</option><option>Federal IDR Representation</option><option>Appeals & Underpayment Recovery</option><option>Outsourced IDR Operations</option><option>Training & Advisory</option><option>General inquiry</option></select></div>
<div class="field full"><label for="message">How can we help? *</label><textarea id="message" name="message" required maxlength="3000" placeholder="Tell us about your workflow and recovery priorities."></textarea></div></div>
<p class="form-note">Please do not include patient details, medical information or other protected health information.</p><div class="form-submit"><button class="btn" type="submit">Prepare your inquiry</button><span>Opens your email application with your inquiry ready to send.</span></div>
<div class="form-status" id="form-status" role="status" hidden>Your inquiry is ready. Complete sending in your email application. <a id="email-fallback" href="mailto:info@prism.inc">Open the prepared email again</a> or email info@prism.inc directly.</div></form><p class="email-help">Your inquiry is sent only when you send the email from your email application.</p></div></div></section>'''

PAGES = [('/', 'Out-of-network claims, resolved with precision', 'PRISM combines proprietary IDR software and consulting to help healthcare providers navigate out-of-network reimbursement recovery.', HOME), ('/products/', 'The PRISM IDR Platform', 'Explore eight connected modules for claims ingestion, eligibility, negotiation, submission and recovery analytics.', PRODUCTS), ('/services/', 'Expert IDR consulting and services', 'Explore PRISM support for calculations, negotiation, federal disputes, outsourced operations and advisory.', SERVICES), ('/about/', 'About PRISM', 'Payment Resolution & IDR System Management. Technology and specialist expertise with a provider perspective.', ABOUT), ('/contact/', 'Contact PRISM', 'Connect with PRISM at info@prism.inc to discuss your IDR workflow and recovery priorities.', CONTACT)]

for path, title, description, content in PAGES:
    out = DIST / path.strip('/') / 'index.html'
    out.parent.mkdir(parents=True, exist_ok=True)
    doc = f'''<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex, nofollow"><meta name="theme-color" content="#07355b"><title>{escape(title)} | PRISM</title><meta name="description" content="{escape(description, quote=True)}"><link rel="canonical" href="{ORIGIN}{path}"><link rel="icon" type="image/svg+xml" href="/favicon.svg"><meta property="og:title" content="{escape(title, quote=True)} | PRISM"><meta property="og:description" content="{escape(description, quote=True)}"><meta property="og:type" content="website"><meta property="og:url" content="{ORIGIN}{path}"><link rel="stylesheet" href="{asset_url("styles.css")}"><link rel="stylesheet" href="{asset_url("refinement.css")}"><script src="{asset_url("site.js")}" defer></script></head><body>{header(path)}<main id="main">{content}</main>{footer()}</body></html>'''
    out.write_text(doc)

error = '''<section class="page-hero"><div class="container"><div class="eyebrow">Page not found</div><h1>Let’s find<br>a clearer path.</h1><p class="lead" style="margin-top:32px">This page is unavailable. Explore PRISM’s platform and services from the homepage.</p><a class="btn" href="/" style="margin-top:32px">Return to PRISM</a></div></section>'''
(DIST / '404.html').write_text(f'<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex, nofollow"><title>Page not found | PRISM</title><link rel="icon" href="/favicon.svg"><link rel="stylesheet" href="{asset_url("styles.css")}"><link rel="stylesheet" href="{asset_url("refinement.css")}"><script src="{asset_url("site.js")}" defer></script></head><body>{header("404")}<main id="main">{error}</main>{footer()}</body></html>')
(DIST / 'robots.txt').write_text('User-agent: *\nDisallow: /\n')
print(f'Generated {len(PAGES)} PRISM pages plus a custom 404.')
