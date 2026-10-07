# PRISM website redesign

A five-page responsive website using PRISM's logo, blue palette and existing content, with editorial spacing and typography inspired by the R1 reference. V4 keeps the full-background healthcare films, replaces the editorial photography with eleven distinct images, and expands the explanations of PRISM's software, services and connected IDR work.

Editable Figma design: https://www.figma.com/design/F3DuetUfNQbTMlbVvOeFmu

## Pages

- `/`: four background films with facility details, specialty selection, expanded full-film viewing and scrolling headlines; connected process explorer, three capability explanations, approach, photographic solution cards, specialty gallery and common questions
- `/products/`: a distinct case-review photograph, eight detailed modules, an illustrative claim journey and the connected lifecycle explorer
- `/services/`: separate operations and provider-advisor photographs, six detailed services, provider/specialist handoffs and an engagement process
- `/about/`: distinct layered clinical-leader and coordinator photographs, provider perspective, operating principles, values and specialties
- `/contact/`: consultation imagery, inquiry form, direct email and next steps

## Editing

Content and shared HTML are authored in `generate.py`, with four focused helpers:

- `hero_experience.py`: `hero_section()` and the four films' asset paths, facility names, descriptions and pointers.
- `process_experience.py`: `process_section()` and the five connected stages, detail panels and platform links.
- `imagery_experience.py`: `enrich_pages()` adds eleven dedicated V4 photographs across the five pages. Its `PHOTO_ASSETS` manifest and generation assertions prevent duplicate photo use and prevent hero posters from appearing as editorial photographs.
- `content_experience.py`: `enrich_content()` adds capability explanations, expanded module/service details, an illustrative claim journey, provider/specialist handoffs and operating principles. Apply this after `enrich_pages()`.

Run `python -X utf8 generate.py` to regenerate the pages. Shared styling is in `dist/styles.css` and `dist/refinement.css`; shared behavior is in `dist/site.js`. Homepage film styling and playback are in `dist/hero-scenes.css` and `dist/hero-scenes.js`. The process explorer uses `dist/process-experience.css` and `dist/process-experience.js`; editorial imagery uses `dist/imagery.css`, followed by `dist/content-experience.css` for the expanded content. Assets and open-source fonts are local. Page generation adds content hashes to stylesheet and script URLs.

## Run and deploy

The zero-dependency Node static server requires Node 22 or later. Run `npm start`, then open http://localhost:4173/. The server uses Railway's `PORT` environment variable when supplied, serves the five pages and custom 404, and supports conditional caching and byte-range requests for video.

`Dockerfile` packages the server and `dist` files using Node 22 Alpine and runs as the unprivileged `node` user. The Railway service uses this Dockerfile, starts `node server.mjs` and checks `/health` with a 60-second timeout. `/health` returns a JSON status response. No package installation or application build is required to run the supplied site.

For the existing GitHub repository, this app lives in `redesign/`. The Railway service root is `/redesign`; deployment settings are configured directly on the service. The watch path is `/redesign/**`. The original application source remains available in the repository.

## Design rationale

- The hero uses edge-to-edge background video on desktop and mobile. A navy reading gradient keeps the headline, introductory copy and consultation actions legible while leaving the clinical setting visible. The normal hero uses `object-fit: cover`, with a scene-specific focal position.
- A compact facility caption sits beside the main message on desktop and beneath it on smaller screens. “Explore this setting” opens four descriptive pointers. Numbered selectors move between Emergency facilities, Anesthesia, Radiology and Claims operations; the active selector also indicates playback progress.
- “View full film” removes the reading gradient and uses `object-fit: contain` to reveal the complete frame. Facility information, scene choices and playback controls remain available outside the film. It first requests browser fullscreen, uses native iOS video fullscreen where available, and otherwise opens an accessible in-page expanded viewer. The fallback isolates other page content, contains keyboard focus, and restores focus and scrolling on exit or Escape.
- Two video decks crossfade after a decoded incoming frame. Only the active scene and next scene metadata are requested. Playback stops offscreen and in background tabs; reduced-motion and save-data visitors see posters unless they explicitly choose Play. Pausing is preserved when choosing a different scene.
- The claim control room connects five stages to a layered shared case dossier. Each stage explains the input, specialist action and output. Visitors can inspect a supporting module or switch to the whole system; module inspection also reveals its relevant stage. Six primary modules use stage-specific routes, while Deadline Sentinel and Audit Trail remain connected through a distinct dashed rail at every stage. A foundation explains documents, deadlines and audit history. Keyboard controls, narrow-screen layouts, motion pause and reduced-motion behavior keep the explanation accessible.
- Eleven unique V4 photographs add clinical, workplace, collaboration and specialty context throughout the five pages. Each photograph appears exactly once; none comes from a hero film or its poster. About uses a clinical-leader image and a separate coordinator inset. The homepage specialty gallery shows triage coordination, an anesthesia workstation and radiology interpretation, extending the clinical story beyond the film scenes. Images have explicit dimensions, descriptive alternative text where informative, and lazy loading. Photograph crops retain the people and context on desktop and mobile.
- The fuller copy explains the inputs, work and next steps behind eligibility, negotiation, submission, recovery and audit preparation. The supplied PRISM graphic informs the three capabilities: Smart NSA Eligibility Engine, automated IDR workflow and audit preparation. The site describes audit preparation as part of ongoing documentation; it does not invent a guaranteed preparation time or reimbursement outcome. The R1 reference informs clarity and information depth, while the PRISM explanation uses its own structure and terminology.
- The opening text starts with “No Surprise Billing” and scrolls to “Fully Managed IDR Lifecycle”. Text and video have independent pause controls; reduced-motion mode displays both text phrases without animation.

## Reference and assets

- Content reference: https://prism.inc/ and its products, services, about and contact pages
- Design reference: https://www.r1rcm.com/
- Additional PRISM content reference: the user-supplied `WhatsApp Image 2026-10-02 at 4.17.22 PM.jpeg`, describing fully managed Independent Dispute Resolution services for the No Surprises Act and the three capabilities above.
- Logo: original supplied PRISM transparent PNG
- V3 film production: five new Cinema Studio 4.0 generations through Higgsfield form four active films, using GPT Image 2 reference frames for visual consistency. The emergency film concatenates two new V3 sequences; no footage from earlier revisions is reused. PRISM lettering and logos are excluded from every film. Fictional facility names are paired with their own medical emblems; PRISM branding remains part of the website interface.
- Emergency: `dist/assets/prism-emergency-v3.mp4` and matching `.webp` poster. Two new shots establish Community Emergency Center through a drone view of the facility and medical transport helicopter, then move into registration and the care setting.
- Anesthesia: `dist/assets/prism-anesthesia-v3.mp4` and matching `.webp` poster. A wide Ambulatory Surgery Center scene presents the coordinated shoulder-procedure team, including the orthopedic surgeon and anesthesiologist, with realistic camera movement.
- Radiology: `dist/assets/prism-radiology-v3.mp4` and matching `.webp` poster. ACME RADIOLOGY is introduced through reception and MRI, CT and X-ray settings.
- Claims operations: `dist/assets/prism-claims-office-v3.mp4` and matching `.webp` poster. A large enterprise workplace includes many employees and multiple areas of coordinated claims work, with no PRISM branding inside the footage.
- V4 editorial assets are eleven separate Higgsfield-generated images, all supplied locally as 1600px-wide WebPs. The 3:2 compositions are 1600 × 1066; the 16:9 compositions are 1600 × 900. `media-provenance-v4.json` records their generation and output details. Each filename below appears once across the five pages:
  - Home: `prism-home-specialists-v4.webp`, `prism-home-partnership-v4.webp`, `prism-specialty-emergency-v4.webp`, `prism-specialty-anesthesia-v4.webp`, `prism-specialty-radiology-v4.webp`
  - Platform: `prism-platform-case-review-v4.webp`
  - Services: `prism-services-operations-v4.webp`, `prism-services-provider-v4.webp`
  - About: `prism-about-clinical-v4.webp`, `prism-about-coordination-v4.webp`
  - Contact: `prism-contact-consultation-v4.webp`
- All four final V3 films are present and probe-verified as silent 1920 × 1080 H.264/yuv420p at 24 fps, with faststart streaming optimization. Matching WebP posters derive from the corresponding generated stills. `media-provenance-v3.json` records generation IDs, source-to-output relationships, exact media properties, file hashes and validation status.

| Final film | Duration | Bytes |
| --- | ---: | ---: |
| `prism-emergency-v3.mp4` | 12.083333 s | 5,225,664 |
| `prism-anesthesia-v3.mp4` | 8.041667 s | 2,594,104 |
| `prism-radiology-v3.mp4` | 12.041667 s | 2,543,358 |
| `prism-claims-office-v3.mp4` | 10.041667 s | 4,519,269 |

- Historical provenance: `media-provenance.json` records the original clip edit history, and `media-provenance-v2.json` records the V2 generations and compositions. Those documents describe earlier revisions, not the active V3 media specification. Earlier media may remain in the asset directory for recovery and are not referenced by the V3 hero.
- The supplied `ACH-ER-Tour.mp4` is a visual reference for facility storytelling and is not incorporated into the V3 films.
- Typefaces: DM Sans and Libre Caslon Display, distributed through Google Fonts

## Review and launch notes

The contact form validates the required fields and prepares a `mailto:` email to `info@prism.inc` in the visitor's email application. Sending requires the visitor to complete the email; there is no form backend or automatic delivery.

The care, workplace and consultation imagery is illustrative. This redesign omits the original site's anonymous win-rate testimonial and unverified certification language. Published privacy, terms and compliance URLs were not available in the source and should be supplied before a production launch. This review deployment is excluded from indexing through robots.txt, page metadata and an HTTP header. Update these and the canonical origin when launching on the client domain.

V3 static checks passed JavaScript syntax validation and Python/HTML generation checks for four ordered scenes, four pointers per scene, unique element IDs, valid control references and one selected scene. Final film contact sheets were visually reviewed with no PRISM lettering observed. Local browser checks passed playback of all four clips, manual pause preservation while changing scenes, full-frame expanded viewing and exit. Mobile checks at 390px passed autoplay, background-video sizing and horizontal-overflow checks. Local byte-range requests returned 206 for all four videos. The iOS native fullscreen fallback has not been device-tested.

V4 imagery checks confirm eleven unique photographs and hashes with page counts of 5, 1, 2, 2 and 1. The imagery helper validates the expected filename set and rejects repeated or legacy photographs during page generation. Local review at 1440px and 390px confirmed photographs load at their stated dimensions and remain within the page width across all five pages. Integrated checks passed unique IDs, ARIA relationships, assets and current cache hashes. Control-room checks passed stage filtering, all eight modules in Whole system, module-to-stage selection, persistent shared modules, keyboard navigation, motion pause and mobile layout without horizontal overflow. The new content explains the brochure's Smart NSA Eligibility Engine, automated IDR workflow and Zero-Day Audit Preparation; the last describes organizing documentation from the first review. Live verification is recorded after deployment.

The people and settings are illustrative generated imagery, not documentary footage of PRISM employees or facilities. The active V3 background films use fictional healthcare facility identities. V4 editorial photographs are separate productions and do not reuse film frames. Previous photographs and films remain historical recovery assets. Email delivery continues to depend on the visitor's email application.
