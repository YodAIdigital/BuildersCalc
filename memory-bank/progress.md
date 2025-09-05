# Progress — Central Otago Custom Cabins

## Current Status
- Sales page created and styled with Tailwind via CDN.
- Accessible sticky nav with anchor links and mobile menu implemented.
- Contact form with basic client-side validation, honeypot, and aria-live status added.
- Phone number for Zeke included prominently and clickable (tel:0211801218).
- Gallery, Testimonials, and FAQs sections implemented with accessible patterns.
- SEO basics: title, meta description, Open Graph, JSON-LD (LocalBusiness).
- Link added from calculator hub to the new sales page.

## What Works
- Page: cabins-cromwell-queenstown.html (single-page layout)
- Link from hub: BuildersTool.html (header link to the sales page)
- ShadCN component mapping: ShadCN-context.md
- Memory Bank: projectbrief.md, productContext.md, activeContext.md, systemPatterns.md, techContext.md

## Files (key)
- Sales page: cabins-cromwell-queenstown.html
- Hub (with link): BuildersTool.html
- ShadCN notes: ShadCN-context.md
- Memory Bank:
  - projectbrief.md
  - productContext.md
  - activeContext.md
  - systemPatterns.md
  - techContext.md
  - progress.md (this file)

## Known Issues / Constraints
- Contact form currently simulates success; no backend submission.
- Placeholder images used; replace with real project photos when available.
- CDN dependencies (Tailwind, Google Fonts) require network access.

## Next Steps (Suggested)
1) Replace gallery images and testimonials with real content.
2) Connect contact form to a backend (Formspree/Netlify/serverless API).
3) Update og:url with the production URL on deployment.
4) Optional: Migrate to React/Next.js using shadcn/ui components based on ShadCN-context.md.

## QA Checklist
- [x] Mobile menu toggles and closes on link click
- [x] Anchor links scroll to the correct sections (scroll-margin offset)
- [x] Inputs use labels and required validation; phone pattern enforced
- [x] aria-live message appears after simulated submit
- [x] Tel link triggers dialer on mobile (manual device test recommended)
- [x] Images lazy-load in gallery
- [x] JSON-LD present and valid structure (LocalBusiness)

## Deployment Notes
- Works as a static site. Upload HTML files directly to host.
- After go-live, update social image (og:image) to a branded asset and set the correct og:url.
