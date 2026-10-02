# PRISM website redesign

A five-page responsive website using PRISM's logo, blue palette and existing content, with editorial spacing and typography inspired by the R1 reference. The homepage uses a full-width healthcare video background with fixed, readable copy and an interactive process diagram.

Editable Figma design: https://www.figma.com/design/F3DuetUfNQbTMlbVvOeFmu

## Pages

- `/`: healthcare-video hero with scrolling headlines, interactive process, approach, solutions and common questions
- `/products/`: eight modules and an interactive platform lifecycle
- `/services/`: six services and an engagement process
- `/about/`: provider perspective, values and specialties
- `/contact/`: inquiry form, direct email and next steps

## Editing

Content and shared HTML are authored in `generate.py`. Run `python generate.py` to regenerate the pages. Styling is in `dist/styles.css` and `dist/refinement.css`; behavior is in `dist/site.js`. Assets and open-source fonts are local.

## Run and deploy

The zero-dependency Node static server requires Node 22 or later. Run `npm start`, then open http://localhost:4173/. The server uses Railway's `PORT` environment variable when supplied, serves the five pages and custom 404, and supports conditional caching and byte-range requests for video.

`Dockerfile` packages the server and `dist` files using Node 22 Alpine and runs as the unprivileged `node` user. The Railway service uses this Dockerfile, starts `node server.mjs` and checks `/health` with a 60-second timeout. `/health` returns a JSON status response. No package installation or application build is required to run the supplied site.

For the existing GitHub repository, this app lives in `redesign/`. The Railway service root is `/redesign`; deployment settings are configured directly on the service. The watch path is `/redesign/**`. The original application source remains available in the repository.

## Design rationale

- Fixed white hero copy sits over a restrained navy gradient on the healthcare film, keeping the core message and consultation action easy to scan.
- Five connected icon stages—intake and eligibility, open negotiation, federal IDR, recovery and reconciliation, and audit-ready records—keep bold labels visible while each selection opens its detail below.
- The opening text starts with “No Surprise Billing” and scrolls to “Fully Managed IDR Lifecycle”. Text and video have independent pause controls; reduced-motion mode displays both text phrases without animation.

## Reference and assets

- Content reference: https://prism.inc/ and its products, services, about and contact pages
- Design reference: https://www.r1rcm.com/
- Logo: original supplied PRISM transparent PNG
- Hero: original AI-generated healthcare collaboration video, Kling 3.0 Pro via Fal; 1920 × 1080, 24 fps, 8.04 seconds, silent. The web copy is compressed to about 0.82 MB and has a local still poster.
- Doctor portrait: existing PRISM site imagery, https://images.pexels.com/photos/19438562/pexels-photo-19438562.jpeg
- Typefaces: DM Sans and Libre Caslon Display, distributed through Google Fonts

## Review and launch notes

The contact form validates the required fields and prepares a `mailto:` email to `info@prism.inc` in the visitor's email application. Sending requires the visitor to complete the email; there is no form backend or automatic delivery.

The doctor photograph is illustrative stock imagery. This redesign omits the original site's anonymous win-rate testimonial and unverified certification language. Published privacy, terms and compliance URLs were not available in the source and should be supplied before a production launch. This review deployment is excluded from indexing through robots.txt, page metadata and an HTTP header. Update these and the canonical origin when launching on the client domain.

Browser UI checks, source links, HTTP routes and byte-range behavior have been verified. Source checks also covered navigation targets, fragment links, tab/panel relationships, form field identifiers and JavaScript syntax. The integrated video and scrolling text have independent pause/resume controls. All five process selections and their keyboard controls were checked in the browser. The original footer logo preserves its aspect ratio. Email delivery depends on the visitor's email application.

Video provenance: `fal-ai/kling-video/v3/pro/text-to-video`, request `01a0f329-b765-77c3-af08-ed349a8aa124`. The people and setting are illustrative AI-generated imagery, not PRISM employees or facilities. Estimated generation charge at the retrieved price was USD 1.12.
