"""Editorial imagery enhancements shared across PRISM's five public pages.

Call once on the base page strings, before building PAGES.  All photographs
are illustrative; navigation and the existing enquiry form remain unchanged.
"""

import re


PHOTO_ASSETS = (
    'prism-home-specialists-v4',
    'prism-home-partnership-v4',
    'prism-specialty-emergency-v4',
    'prism-specialty-anesthesia-v4',
    'prism-specialty-radiology-v4',
    'prism-platform-case-review-v4',
    'prism-services-operations-v4',
    'prism-services-provider-v4',
    'prism-about-clinical-v4',
    'prism-about-coordination-v4',
    'prism-contact-consultation-v4',
)


def _replace_once(content, needle, replacement, page):
    count = content.count(needle)
    if count != 1:
        raise ValueError(f'{page}: expected one imagery insertion point, found {count}')
    return content.replace(needle, replacement, 1)


def _photo(name, alt, width=1600, height=900, css=''):
    class_attr = f' class="{css}"' if css else ''
    return (f'<img{class_attr} src="/assets/{name}.webp" alt="{alt}" '
            f'width="{width}" height="{height}" loading="lazy" decoding="async">')


def _editorial_feature(kind, asset, alt, eyebrow, heading, description, tags, caption):
    tag_markup = ''.join(f'<span>{tag}</span>' for tag in tags)
    return f'''<section class="editorial-section editorial-{kind}" aria-labelledby="{kind}-editorial-title"><div class="container">
    <div class="editorial-feature"><figure class="editorial-photo">{_photo(asset, alt)}<figcaption>{caption}</figcaption></figure>
    <div class="editorial-copy"><span class="editorial-index" aria-hidden="true">01 / CONNECTED WORK</span><div class="eyebrow">{eyebrow}</div><h2 id="{kind}-editorial-title">{heading}</h2><p>{description}</p><div class="editorial-tags">{tag_markup}</div></div></div>
    </div></section>'''


def _specialty_gallery():
    settings = (
        ('01', 'prism-specialty-emergency-v4', 'An emergency triage team coordinating care in a bright treatment room', 'Emergency medicine', 'The teams coordinating time-sensitive care.'),
        ('02', 'prism-specialty-anesthesia-v4', 'An anesthesia clinician reviewing monitoring equipment at a dedicated workstation', 'Anesthesiology', 'Precision and oversight around each procedure.'),
        ('03', 'prism-specialty-radiology-v4', 'Radiologists reviewing imaging together in a specialist reading room', 'Radiology', 'Expert interpretation behind every image.'),
    )
    cards = ''.join(f'''<article class="specialty-photo-card"><div class="specialty-photo">{_photo(asset, alt)}<span class="specialty-index" aria-hidden="true">{number}</span></div><div class="specialty-copy"><h3>{title}</h3><p>{description}</p></div></article>''' for number, asset, alt, title, description in settings)
    return f'''<div class="specialty-gallery" aria-labelledby="specialty-gallery-title"><div class="specialty-gallery-heading"><div><span class="editorial-overline">Connected to your care setting</span><h3 id="specialty-gallery-title">Different specialties. A shared need for clarity.</h3></div><a class="text-link" href="/about/#care-settings">Who we support <span aria-hidden="true">↗</span></a></div><div class="specialty-photo-grid">{cards}</div><div class="specialty-gallery-foot"><p>Also supporting hospitalists, pathologists and other healthcare organizations.</p><span>Illustrative clinical team imagery</span></div></div>'''


def enrich_pages(home, products, services, about, contact):
    """Return all five pages with the new, responsive editorial image system."""
    home = _replace_once(
        home,
        '<img src="/assets/care-team.jpg" loading="lazy" alt="" width="1200" height="1800">',
        _photo('prism-home-specialists-v4', '', 1600, 1066, 'solution-care-photo'),
        'Home expertise card',
    )
    home = _replace_once(
        home,
        '<a class="solution-card solutions-light" href="/services/#partnership"><div><p class="card-category">03 / PARTNERSHIP</p><h3>Your team.<br>Our expertise.</h3><p class="card-symbol" aria-hidden="true">Together.</p></div>',
        '<a class="solution-card solution-partnership" href="/services/#partnership">'
        + _photo('prism-home-partnership-v4', '', 1600, 1066)
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
            'platform', 'prism-platform-case-review-v4',
            'Three analysts reviewing a case together across connected workstations',
            'Technology with a human perspective',
            'Clarity in the<br>flow of work.',
            'Bring the case, the documents and the next action into one connected workflow.',
            ('Case context', 'Shared documents', 'Clear next steps'),
            'Illustrative case review setting',
        ) + product_anchor,
        'Platform feature',
    )

    services_anchor = '<section class="section section-white"><div class="container service-layout">'
    services = _replace_once(
        services,
        services_anchor,
        _editorial_feature(
            'operations', 'prism-services-operations-v4',
            'Specialists collaborating across a spacious claims operations workplace',
            'Expertise in motion',
            'People. Process.<br>Shared focus.',
            'Connect the work of calculations, documentation, negotiation and case coordination.',
            ('Specialist support', 'Case coordination', 'Operational visibility'),
            'Illustrative operations setting',
        ) + services_anchor,
        'Services operations feature',
    )
    services = _replace_once(
        services,
        '<p>Choose the support your team needs at each stage of the dispute lifecycle.</p></div><div class="accordion service-list">',
        '<p>Choose the support your team needs at each stage of the dispute lifecycle.</p>'
        + '<figure class="service-editorial-photo">'
        + _photo('prism-services-provider-v4', 'A physician and advisor reviewing information together at a clinic desk', 1600, 1066)
        + '<figcaption>With the provider perspective in view.<span>Illustrative care setting</span></figcaption></figure></div><div class="accordion service-list">',
        'Services clinical image',
    )

    about = _replace_once(
        about,
        '<img class="human-photo" src="/assets/care-team.jpg" alt="Healthcare professional in a clinic" width="1200" height="1800" loading="lazy">',
        '<div class="human-photo-stack"><figure class="human-photo-main">'
        + _photo('prism-about-clinical-v4', 'Two healthcare leaders discussing care while walking a hospital corridor', 1600, 1066)
        + '</figure><figure class="human-photo-inset">'
        + _photo('prism-about-coordination-v4', 'A claims coordinator reviewing case documents in a dedicated office pod')
        + '<figcaption>Coordination behind each case</figcaption></figure><span class="human-photo-note">Illustrative clinical and coordination settings</span></div>',
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
        + _photo('prism-contact-consultation-v4', 'Three healthcare professionals discussing their priorities around a bright meeting table', 1600, 1066)
        + '<figcaption><strong>Your priorities. A shared direction.</strong><span>Illustrative consultation setting</span></figcaption></figure></div>',
        'Contact consultation image',
    )
    result = (home, products, services, about, contact)
    if any('/assets/care-team.jpg' in page for page in result):
        raise ValueError('A legacy care-team photograph remains in a page')
    photo_sources = [
        source
        for page in result
        for source in re.findall(r'<img\b[^>]*\bsrc=[\"\']([^\"\']+)[\"\']', page)
        if source != '/assets/prism-logo-small.png'
    ]
    expected_sources = {f'/assets/{asset}.webp' for asset in PHOTO_ASSETS}
    if len(photo_sources) != len(PHOTO_ASSETS) or len(set(photo_sources)) != len(photo_sources):
        raise ValueError('Every editorial photograph must appear exactly once across the five pages')
    if set(photo_sources) != expected_sources:
        raise ValueError('Editorial imagery must use the eleven dedicated v4 photographs, never hero video frames')
    return result
