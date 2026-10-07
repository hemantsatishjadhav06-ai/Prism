"""Editorial imagery enhancements shared across PRISM's five public pages.

Call once on the base page strings, before building PAGES.  All photographs
are illustrative; navigation and the existing enquiry form remain unchanged.
"""


def _replace_once(content, needle, replacement, page):
    count = content.count(needle)
    if count != 1:
        raise ValueError(f'{page}: expected one imagery insertion point, found {count}')
    return content.replace(needle, replacement, 1)


def _photo(name, alt, width=1600, height=900, css=''):
    class_attr = f' class="{css}"' if css else ''
    return (f'<img{class_attr} src="/assets/{name}.webp" alt="{alt}" '
            f'width="{width}" height="{height}" loading="lazy" decoding="async">')


def _editorial_feature(kind, asset, alt, eyebrow, heading, description, tags):
    tag_markup = ''.join(f'<span>{tag}</span>' for tag in tags)
    return f'''<section class="editorial-section editorial-{kind}" aria-labelledby="{kind}-editorial-title"><div class="container">
    <div class="editorial-feature"><figure class="editorial-photo">{_photo(asset, alt)}<figcaption>Illustrative work setting</figcaption></figure>
    <div class="editorial-copy"><span class="editorial-index" aria-hidden="true">01 / CONNECTED WORK</span><div class="eyebrow">{eyebrow}</div><h2 id="{kind}-editorial-title">{heading}</h2><p>{description}</p><div class="editorial-tags">{tag_markup}</div></div></div>
    </div></section>'''


def _specialty_gallery():
    settings = (
        ('01', 'prism-emergency-v3', 'Community emergency center with a rooftop medical helicopter', 'Emergency medicine', 'From arrival to the care team.'),
        ('02', 'prism-anesthesia-v3', 'Surgical team and anesthesia equipment in an operating room', 'Anesthesiology', 'Coordinated care in the surgical setting.'),
        ('03', 'prism-radiology-v3', 'Modern radiology facility and imaging care setting', 'Radiology', 'The people and technology behind imaging.'),
    )
    cards = ''.join(f'''<article class="specialty-photo-card"><div class="specialty-photo">{_photo(asset, alt)}<span class="specialty-index" aria-hidden="true">{number}</span></div><div class="specialty-copy"><h3>{title}</h3><p>{description}</p></div></article>''' for number, asset, alt, title, description in settings)
    return f'''<div class="specialty-gallery" aria-labelledby="specialty-gallery-title"><div class="specialty-gallery-heading"><div><span class="editorial-overline">Connected to your care setting</span><h3 id="specialty-gallery-title">Different specialties. A shared need for clarity.</h3></div><a class="text-link" href="/about/#care-settings">Who we support <span aria-hidden="true">↗</span></a></div><div class="specialty-photo-grid">{cards}</div><div class="specialty-gallery-foot"><p>Also supporting hospitalists, pathologists and other healthcare organizations.</p><span>Illustrative facility imagery</span></div></div>'''


def enrich_pages(home, products, services, about, contact):
    """Return all five pages with the new, responsive editorial image system."""
    home = _replace_once(
        home,
        '<img src="/assets/care-team.jpg" loading="lazy" alt="" width="1200" height="1800">',
        _photo('prism-care-team-v3', '', 1500, 1000, 'solution-care-photo'),
        'Home expertise card',
    )
    home = _replace_once(
        home,
        '<a class="solution-card solutions-light" href="/services/#partnership"><div><p class="card-category">03 / PARTNERSHIP</p><h3>Your team.<br>Our expertise.</h3><p class="card-symbol" aria-hidden="true">Together.</p></div>',
        '<a class="solution-card solution-partnership" href="/services/#partnership">'
        + _photo('prism-partnership-v3', '', 1500, 1000)
        + '<div><p class="card-category">03 / PARTNERSHIP</p><h3>Your team.<br>Our expertise.</h3></div>',
        'Home partnership card',
    )
    home = _replace_once(
        home,
        '<div class="audiences"><p>Supporting providers across specialties</p><div class="audience-list"><span>Emergency medicine</span><span>Anesthesiology</span><span>Radiology</span><span>Hospitalists</span><span>Pathology</span></div></div>',
        _specialty_gallery(),
        'Home specialties',
    )

    product_anchor = '<section class="section section-white"><div class="container"><div class="section-head"><div class="eyebrow">Eight integrated modules</div>'
    products = _replace_once(
        products,
        product_anchor,
        _editorial_feature(
            'platform', 'prism-platform-v3',
            'Two analysts reviewing work together at a modern workstation',
            'Technology with a human perspective',
            'Clarity in the<br>flow of work.',
            'Bring the case, the documents and the next action into one connected workflow.',
            ('Case context', 'Shared documents', 'Clear next steps'),
        ) + product_anchor,
        'Platform feature',
    )

    services_anchor = '<section class="section section-white"><div class="container service-layout">'
    services = _replace_once(
        services,
        services_anchor,
        _editorial_feature(
            'operations', 'prism-operations-v3',
            'A large team working across connected areas of a modern claims operations office',
            'Expertise in motion',
            'People. Process.<br>Shared focus.',
            'Connect the work of calculations, documentation, negotiation and case coordination.',
            ('Specialist support', 'Case coordination', 'Operational visibility'),
        ) + services_anchor,
        'Services operations feature',
    )
    services = _replace_once(
        services,
        '<p>Choose the support your team needs at each stage of the dispute lifecycle.</p></div><div class="accordion service-list">',
        '<p>Choose the support your team needs at each stage of the dispute lifecycle.</p>'
        + '<figure class="service-editorial-photo">'
        + _photo('prism-care-team-v3', 'Healthcare colleagues in a bright clinical corridor', 1500, 1000)
        + '<figcaption>With the provider perspective in view.<span>Illustrative care setting</span></figcaption></figure></div><div class="accordion service-list">',
        'Services clinical image',
    )

    about = _replace_once(
        about,
        '<img class="human-photo" src="/assets/care-team.jpg" alt="Healthcare professional in a clinic" width="1200" height="1800" loading="lazy">',
        '<div class="human-photo-stack"><figure class="human-photo-main">'
        + _photo('prism-care-team-v3', 'Healthcare colleagues discussing care in a clinical corridor', 1500, 1000)
        + '</figure><figure class="human-photo-inset">'
        + _photo('prism-operations-v3', 'Teams collaborating in an open claims operations office')
        + '<figcaption>The work behind the care</figcaption></figure><span class="human-photo-note">Illustrative care and work settings</span></div>',
        'About layered imagery',
    )
    about = _replace_once(
        about,
        '<section class="section platform-section"><div class="container"><div class="section-head"><div class="eyebrow">Who we serve</div>',
        '<section class="section platform-section" id="care-settings"><div class="container"><div class="section-head"><div class="eyebrow">Who we serve</div>',
        'About care settings link',
    )

    contact = _replace_once(
        contact,
        '<li>A recovery diagnostic and recommended engagement.</li></ol></div></div>',
        '<li>A recovery diagnostic and recommended engagement.</li></ol></div>'
        + '<figure class="contact-editorial-photo">'
        + _photo('prism-partnership-v3', 'A healthcare leader and advisors in a collaborative consultation', 1500, 1000)
        + '<figcaption><strong>Your priorities. A shared direction.</strong><span>Illustrative consultation setting</span></figcaption></figure></div>',
        'Contact consultation image',
    )
    result = (home, products, services, about, contact)
    if any('/assets/care-team.jpg' in page for page in result):
        raise ValueError('A legacy care-team photograph remains in a page')
    return result
