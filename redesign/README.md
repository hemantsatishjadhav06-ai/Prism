# PRISM website redesign

A five-page responsive website using PRISM's logo, blue palette and existing content, with editorial spacing and typography inspired by the R1 reference. The homepage pairs the core message with a dedicated healthcare film player and an interactive process diagram.

Editable Figma design: https://www.figma.com/design/F3DuetUfNQbTMlbVvOeFmu

## Pages

- `/`: four-scene cinema player with facility details, specialty selection, full-film viewing and scrolling headlines; interactive process, approach, solutions and common questions
- `/products/`: eight modules and an interactive platform lifecycle
- `/services/`: six services and an engagement process
- `/about/`: provider perspective, values and specialties
- `/contact/`: inquiry form, direct email and next steps

## Editing

Content and shared HTML are authored in `generate.py`. Run `python -X utf8 generate.py` to regenerate the pages. Shared styling is in `dist/styles.css` and `dist/refinement.css`; shared behavior is in `dist/site.js`. Homepage film styling and playback are in `dist/hero-scenes.css` and `dist/hero-scenes.js`. Assets and open-source fonts are local.

## Run and deploy

The zero-dependency Node static server requires Node 22 or later. Run `npm start`, then open http://localhost:4173/. The server uses Railway's `PORT` environment variable when supplied, serves the five pages and custom 404, and supports conditional caching and byte-range requests for video.

`Dockerfile` packages the server and `dist` files using Node 22 Alpine and runs as the unprivileged `node` user. The Railway service uses this Dockerfile, starts `node server.mjs` and checks `/health` with a 60-second timeout. `/health` returns a JSON status response. No package installation or application build is required to run the supplied site.

For the existing GitHub repository, this app lives in `redesign/`. The Railway service root is `/redesign`; deployment settings are configured directly on the service. The watch path is `/redesign/**`. The original application source remains available in the repository.

## Design rationale

- A navy hero uses an approximately 36/64 split between the introductory copy and the cinema player on desktop. The headline, consultation actions and explanatory copy sit beside the footage. The layout stacks on smaller screens.
- The media stage preserves the complete 16:9 frame with `object-fit: contain`, including on mobile. The page does not overlay its headline, controls or facility information on the video. This keeps facility signs and composed role labels visible.
- A stable panel beneath the film shows the facility name and four short descriptive pointers. Four numbered selectors move between Emergency facilities, Anesthesia, Radiology and the PRISM back office. The small “Illustrative facility scenes” caption identifies the nature of the imagery.
- “View full film” expands the player while retaining the facility information, scene choices and playback control. It first requests browser fullscreen, uses native iOS video fullscreen where available, and otherwise opens an accessible in-page expanded viewer. The fallback isolates other page content, contains keyboard focus, and restores focus and scrolling on exit or Escape.
- Two video decks crossfade after a decoded incoming frame. Only the active scene and next scene metadata are requested. Playback stops offscreen and in background tabs; reduced-motion and save-data visitors see posters unless they explicitly choose Play. Pausing is preserved when choosing a different scene.
- Five connected icon stages—intake and eligibility, open negotiation, federal IDR, recovery and reconciliation, and audit-ready records—keep bold labels visible while each selection opens its detail below.
- The opening text starts with “No Surprise Billing” and scrolls to “Fully Managed IDR Lifecycle”. Text and video have independent pause controls; reduced-motion mode displays both text phrases without animation.

## Reference and assets

- Content reference: https://prism.inc/ and its products, services, about and contact pages
- Design reference: https://www.r1rcm.com/
- Logo: original supplied PRISM transparent PNG
- V2 film production: new GPT Image 2 start frames feed Cinema Studio 4.0 image-to-video generations in Higgsfield. Native Higgsedit composition adds the exact facility titles, role labels and PRISM artwork independently of generated text. The new footage is combined with relevant original clips; the existing PRISM claims-office film is retained.
- Completed V2 emergency film: `dist/assets/prism-emergency-v2.mp4`, 14 seconds, 4,662,511 bytes. “Community Emergency Center” introduces a two-floor emergency facility with a medical-plus sign and medical helicopter, followed by the existing emergency-care footage. The information panel lists Arrival & registration, Emergency care team, Treatment & diagnostics, and Air medical transport.
- Completed V2 anesthesia film: `dist/assets/prism-anesthesia-v2.mp4`, 13 seconds, 3,763,678 bytes. “Ambulatory Surgery Center” introduces a non-graphic shoulder procedure, with the exact role labels “Orthopedic Surgeon” and “Anesthesiologist”. The first 5.5 seconds of the new source are retimed at 0.6875× speed to fill 8 seconds and keep the anesthesiologist visible, followed by 3 seconds of original monitoring footage and a 2-second outro. Fixed role leader lines point to the correct sleeves throughout the label duration. The panel also calls out Anesthesia monitoring.
- Completed V2 radiology film: `dist/assets/prism-radiology-v2.mp4`, 15.75 seconds, 3,032,938 bytes. “ACME RADIOLOGY” establishes the facility before the existing MRI, CT and X-ray sequence. The panel lists Patient check-in, MRI imaging, CT imaging, and X-ray imaging.
- Retained PRISM office film: `dist/assets/prism-claims-office.mp4`, 8 seconds, with the original PRISM logo composited onto the wall sign. The panel lists Claim review, Supporting documents, Case coordination, and IDR workflow.
- The completed V2 films have been probe-verified as silent 1920 × 1080 H.264, yuv420p, at 24 fps, with faststart streaming optimization and matching WebP posters. The durations and file sizes above are verified final render values. Generation IDs, source relationships and validation status are in `media-provenance-v2.json`; `media-provenance.json` preserves the original clip edit history.
- The supplied `ACH-ER-Tour.mp4` is a visual reference only. Its footage is not incorporated into the V2 films.
- Doctor portrait: existing PRISM site imagery, https://images.pexels.com/photos/19438562/pexels-photo-19438562.jpeg
- Typefaces: DM Sans and Libre Caslon Display, distributed through Google Fonts

## Review and launch notes

The contact form validates the required fields and prepares a `mailto:` email to `info@prism.inc` in the visitor's email application. Sending requires the visitor to complete the email; there is no form backend or automatic delivery.

The doctor photograph is illustrative stock imagery. This redesign omits the original site's anonymous win-rate testimonial and unverified certification language. Published privacy, terms and compliance URLs were not available in the source and should be supplied before a production launch. This review deployment is excluded from indexing through robots.txt, page metadata and an HTTP header. Update these and the canonical origin when launching on the client domain.

The V2 homepage implementation has passed JavaScript syntax checks, Python compilation and page generation, and a source check for four ordered scenes, four pointers per scene and unique element IDs. Browser checks used the retained office clip to verify playback, scene title/pointer updates, complete-frame sizing, the expanded-view fallback and Escape recovery. Responsive checks covered 390px mobile and 1024px compact desktop widths without horizontal overflow or clipped rotating headlines. Native browser fullscreen was blocked in the test environment; the iOS native fallback has not been device-tested. The completed V2 assets are present locally, native composition checks are clean, and the intro, cue and outro frames have been visually reviewed. Live-site deployment and playback validation remain pending.

The people and settings are illustrative generated imagery, not documentary footage of PRISM employees or facilities. The V2 revision includes new generated footage and retains relevant original clips. The previous collaboration film remains in the asset directory for recovery, but is not used on the homepage. Email delivery continues to depend on the visitor's email application.
