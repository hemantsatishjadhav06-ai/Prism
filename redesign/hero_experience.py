"""Full-bleed care setting films and their accessible navigation."""
from html import escape


HERO_SCENES = [
    ("prism-emergency-v3", "Emergency facilities", "Community Emergency Center",
     "From the first arrival to a coordinated emergency response.",
     "Arrival & registration|Emergency care team|Treatment & diagnostics|Air medical transport",
     "Arrival to treatment", "62% center"),
    ("prism-anesthesia-v3", "Anesthesia", "Ambulatory Surgery Center",
     "Specialist teams working together throughout the surgical setting.",
     "Shoulder procedure|Orthopedic Surgeon|Anesthesiologist|Anesthesia monitoring",
     "Inside the surgery center", "64% center"),
    ("prism-radiology-v3", "Radiology", "ACME RADIOLOGY",
     "People, precision and technology behind every imaging encounter.",
     "Patient check-in|MRI imaging|CT imaging|X-ray imaging",
     "MRI · CT · X-ray", "61% center"),
    ("prism-claims-office-v3", "Claims operations", "Claims operations",
     "Connected teams supporting the work behind each claim.",
     "Claim review|Supporting documents|Case coordination|IDR workflow",
     "People and operations", "62% center"),
]


def hero_scene_buttons():
    buttons = []
    for index, (asset, label, title, description, points, subtitle, position) in enumerate(HERO_SCENES):
        buttons.append(
            f'<button type="button" class="scene-button" aria-pressed="{str(index == 0).lower()}" '
            f'aria-controls="hero-player" data-video="/assets/{asset}.mp4" '
            f'data-poster="/assets/{asset}.webp" data-title="{escape(title, quote=True)}" '
            f'data-description="{escape(description, quote=True)}" data-points="{escape(points, quote=True)}" '
            f'data-position="{position}"><span class="scene-number">0{index + 1}</span>'
            f'<span class="scene-button-copy"><strong>{escape(label)}</strong>'
            f'<small>{escape(subtitle)}</small></span><span class="scene-indicator" aria-hidden="true"></span></button>'
        )
    return "".join(buttons)


def hero_section():
    return '''<section class="hero hero-video-hero hero-specialties" aria-label="Care settings supported by PRISM">
<div class="hero-player" id="hero-player" role="region" aria-label="Explore the care setting films">
<div class="hero-background" style="background-image:url('/assets/prism-emergency-v3.webp')"><video id="hero-video" class="hero-scene-video is-active" muted playsinline preload="none" poster="/assets/prism-emergency-v3.webp" aria-hidden="true"><source src="/assets/prism-emergency-v3.mp4" type="video/mp4"></video><video id="hero-video-next" class="hero-scene-video" muted playsinline preload="none" aria-hidden="true"></video></div>
<div class="container hero-main"><div class="hero-copy"><div class="eyebrow">Payment Resolution &amp; IDR System Management</div><h1 aria-label="No Surprise Billing. Fully Managed IDR Lifecycle."><span class="headline-rotator" id="hero-headlines" aria-hidden="true"><span class="headline-slide is-active">No Surprise<br>Billing</span><span class="headline-slide">Fully Managed<br>IDR Lifecycle</span></span></h1><noscript><style>.headline-rotator{min-height:0;overflow:visible}.headline-slide{position:static;opacity:1;transform:none}.headline-slide+ .headline-slide{font-size:.55em;margin-top:.3em}</style></noscript><p class="hero-description">Out-of-network payment resolution.<br>One connected platform. Expert IDR support.<br>More focus on the care you provide.</p><div class="btn-group"><a class="btn btn-white" href="/contact/">Request a consultation</a><a class="btn" href="/products/">Explore the platform</a></div><p class="hero-proof">Technology and white-glove expertise, together.</p></div>
<div class="scene-detail-panel"><div class="scene-detail-heading"><div class="scene-caption-meta"><span class="scene-kicker">Care in focus</span><span id="scene-counter">01 / 04</span></div><h2 id="scene-title">Community Emergency Center</h2><p id="scene-description">From the first arrival to a coordinated emergency response.</p></div><details class="scene-context"><summary>Explore this setting<svg width="12" height="12" viewBox="0 0 12 12" aria-hidden="true"><path d="M2 4L6 8L10 4" fill="none" stroke="currentColor" stroke-width="1.5"/></svg></summary><ul class="scene-points" id="scene-points" aria-label="In this setting"><li>Arrival &amp; registration</li><li>Emergency care team</li><li>Treatment &amp; diagnostics</li><li>Air medical transport</li></ul></details></div></div>
<div class="container hero-dock"><div class="scene-toolbar"><p class="hero-signoff">Behind every encounter, a claim.<br><span>Behind every claim, PRISM.</span></p><div class="hero-playback"><button class="headline-control" type="button" aria-controls="hero-headlines" aria-label="Pause scrolling text" hidden><span class="headline-control-symbol" aria-hidden="true">Ⅱ</span><span>Pause text</span></button><button class="video-control" type="button" aria-controls="hero-video hero-video-next" aria-label="Play scene videos"><svg width="14" height="14" viewBox="0 0 16 16" aria-hidden="true"><path d="M5 3L13 8L5 13Z" fill="currentColor"/></svg><span>Play video</span></button><button class="fullscreen-control" type="button" aria-controls="hero-player" aria-label="View full film in fullscreen" hidden><svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.4" aria-hidden="true"><path d="M6 2H2V6M10 2H14V6M14 10V14H10M6 14H2V10"/></svg><span>View full film</span></button></div></div>
<div class="scene-navigation" role="group" aria-label="Choose a care setting">''' + hero_scene_buttons() + '''</div><span id="scene-announcement" class="visually-hidden" aria-live="polite"></span></div>
<div class="hero-base"><span>Technology and specialists. Connected to your care.</span><span class="scene-illustration-note">Illustrative facility scenes</span><a href="#process">Explore our process</a></div></div></section>'''
