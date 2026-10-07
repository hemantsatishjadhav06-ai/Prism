# PRISM website redesign

A five-page responsive website using PRISM's logo, blue palette and existing content, with editorial spacing and typography inspired by the R1 reference. V3 restores a full-background healthcare film hero, introduces fresh editorial imagery throughout the site and presents the connected IDR process as a layered, interactive 3D scene.

Editable Figma design: https://www.figma.com/design/F3DuetUfNQbTMlbVvOeFmu

## Pages

- `/`: four background films with facility details, specialty selection, expanded full-film viewing and scrolling headlines; 3D process explorer, approach, photographic solution cards, specialty gallery and common questions
- `/products/`: editorial platform imagery, eight modules and the connected 3D lifecycle explorer
- `/services/`: operations and clinical imagery, six services and an engagement process
- `/about/`: layered care-team and operations imagery, provider perspective, values and specialties
- `/contact/`: consultation imagery, inquiry form, direct email and next steps

## Editing

Content and shared HTML are authored in `generate.py`, with three focused helpers:

- `hero_experience.py`: `hero_section()` and the four films' asset paths, facility names, descriptions and pointers.
- `process_experience.py`: `process_section()` and the five connected stages, detail panels and platform links.
- `imagery_experience.py`: `enrich_pages()` replaces the previous clinical photograph and adds 11 editorial image placements across the five pages.

Run `python -X utf8 generate.py` to regenerate the pages. Shared styling is in `dist/styles.css` and `dist/refinement.css`; shared behavior is in `dist/site.js`. Homepage film styling and playback are in `dist/hero-scenes.css` and `dist/hero-scenes.js`. The process explorer uses `dist/process-experience.css` and `dist/process-experience.js`; editorial imagery uses `dist/imagery.css`. Assets and open-source fonts are local. Page generation adds content hashes to stylesheet and script URLs.

## Run and deploy

The zero-dependency Node static server requires Node 22 or later. Run `npm start`, then open http://localhost:4173/. The server uses Railway's `PORT` environment variable when supplied, serves the five pages and custom 404, and supports conditional caching and byte-range requests for video.

`Dockerfile` packages the server and `dist` files using Node 22 Alpine and runs as the unprivileged `node` user. The Railway service uses this Dockerfile, starts `node server.mjs` and checks `/health` with a 60-second timeout. `/health` returns a JSON status response. No package installation or application build is required to run the supplied site.

For the existing GitHub repository, this app lives in `redesign/`. The Railway service root is `/redesign`; deployment settings are configured directly on the service. The watch path is `/redesign/**`. The original application source remains available in the repository.

## Design rationale

- The hero uses edge-to-edge background video on desktop and mobile. A navy reading gradient keeps the headline, introductory copy and consultation actions legible while leaving the clinical setting visible. The normal hero uses `object-fit: cover`, with a scene-specific focal position.
- A compact facility caption sits beside the main message on desktop and beneath it on smaller screens. “Explore this setting” opens four descriptive pointers. Numbered selectors move between Emergency facilities, Anesthesia, Radiology and Claims operations; the active selector also indicates playback progress.
- “View full film” removes the reading gradient and uses `object-fit: contain` to reveal the complete frame. Facility information, scene choices and playback controls remain available outside the film. It first requests browser fullscreen, uses native iOS video fullscreen where available, and otherwise opens an accessible in-page expanded viewer. The fallback isolates other page content, contains keyboard focus, and restores focus and scrolling on exit or Escape.
- Two video decks crossfade after a decoded incoming frame. Only the active scene and next scene metadata are requested. Playback stops offscreen and in background tabs; reduced-motion and save-data visitors see posters unless they explicitly choose Play. Pausing is preserved when choosing a different scene.
- Five raised icon stages—intake and eligibility, open negotiation, federal IDR, recovery and reconciliation, and audit-ready records—sit above three translucent planes for workflow, coordination and case history. Branching paths connect each stage to the shared case record, and the selected route is highlighted. Pointer movement adds restrained perspective on supported desktop devices; motion can be paused and respects reduced-motion preferences. Narrow screens use an accessible stacked layout. Keyboard navigation, the next-stage control and detail panels remain functional without relying on depth or animation.
- Eleven editorial image placements replace the previous clinical photograph and add clinical, workplace, collaboration and specialty context throughout the five pages. The about page uses layered photographs, while the homepage specialty gallery gives each target care setting its own image. Images have explicit dimensions and descriptive alternative text where informative, and load lazily.
- The opening text starts with “No Surprise Billing” and scrolls to “Fully Managed IDR Lifecycle”. Text and video have independent pause controls; reduced-motion mode displays both text phrases without animation.

## Reference and assets

- Content reference: https://prism.inc/ and its products, services, about and contact pages
- Design reference: https://www.r1rcm.com/
- Logo: original supplied PRISM transparent PNG
- V3 film production: five new Cinema Studio 4.0 generations through Higgsfield form four active films, using GPT Image 2 reference frames for visual consistency. The emergency film concatenates two new V3 sequences; no footage from earlier revisions is reused. PRISM lettering and logos are excluded from every film. Fictional facility names are paired with their own medical emblems; PRISM branding remains part of the website interface.
- Emergency: `dist/assets/prism-emergency-v3.mp4` and matching `.webp` poster. Two new shots establish Community Emergency Center through a drone view of the facility and medical transport helicopter, then move into registration and the care setting.
- Anesthesia: `dist/assets/prism-anesthesia-v3.mp4` and matching `.webp` poster. A wide Ambulatory Surgery Center scene presents the coordinated shoulder-procedure team, including the orthopedic surgeon and anesthesiologist, with realistic camera movement.
- Radiology: `dist/assets/prism-radiology-v3.mp4` and matching `.webp` poster. ACME RADIOLOGY is introduced through reception and MRI, CT and X-ray settings.
- Claims operations: `dist/assets/prism-claims-office-v3.mp4` and matching `.webp` poster. A large enterprise workplace includes many employees and multiple areas of coordinated claims work, with no PRISM branding inside the footage.
- Editorial assets: `prism-care-team-v3.webp`, `prism-partnership-v3.webp`, `prism-platform-v3.webp` and `prism-operations-v3.webp`, plus the three clinical film posters used in the specialty gallery. These support 11 image placements across the five pages.
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

V3 static checks passed JavaScript syntax validation and Python/HTML generation checks for four ordered scenes, four pointers per scene, unique element IDs, valid control references and one selected scene. Final film contact sheets were visually reviewed with no PRISM lettering observed. Local browser checks passed playback of all four clips, manual pause preservation while changing scenes, full-frame expanded viewing and exit. Mobile checks at 390px passed autoplay, background-video sizing and horizontal-overflow checks. Local byte-range requests returned 206 for all four videos. Live deployment and playback validation remain pending. The iOS native fullscreen fallback has not been device-tested.

The people and settings are illustrative generated imagery, not documentary footage of PRISM employees or facilities. V3 uses entirely new background films and uses fictional healthcare facility identities within them. Previous films remain historical recovery assets. Email delivery continues to depend on the visitor's email application.
