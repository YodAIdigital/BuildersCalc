# Active Context — Central Otago Custom Cabins

## Current Focus
- Deliver a clean, modern, single-page sales site highlighting custom cabins for Cromwell & Queenstown.
- Ensure warm, friendly tone with accessible UI and clear CTAs (quote + call Zeke).

## Recent Changes
- New sales page created: [cabins-cromwell-queenstown.html](../cabins-cromwell-queenstown.html)
  - Sections: Hero, About, Gallery, Testimonials, FAQs, Contact
  - Sticky nav with anchor links + mobile menu
  - Contact form (name, email, phone, message), basic validation, honeypot, aria-live success, tel link
  - SEO: title, description, OG tags, JSON-LD LocalBusiness (service area + phone)
- Link added from calculator hub header: [BuildersTool.html](../BuildersTool.html)
  - Adds visible anchor to open the sales page from existing tool
- ShadCN mapping notes recorded: [ShadCN-context.md](../ShadCN-context.md)
- Memory Bank initialized:
  - [projectbrief.md](./projectbrief.md)
  - [productContext.md](./productContext.md)

## Next Steps
- Optional: Wire contact form to an email/API endpoint (Formspree/Netlify/serverless)
- Replace placeholder images with real project photos
- Add real client testimonials
- If React migration is desired, map current Tailwind UI to shadcn/ui components

## Active Decisions
- Tech stack: static HTML + Tailwind via CDN (no build/tooling required)
- Accessibility:
  - details/summary for FAQ (native keyboard + semantics)
  - Focus rings on interactive elements
  - aria-live polite status for form feedback
- Tone/brand:
  - Amber accent (warmth), slate neutrals, Inter font
  - Friendly, concise copy tailored to Central Otago audience

## Implementation Patterns
- Navigation:
  - Sticky header; mobile drawer via simple toggle button with aria-expanded
  - Section anchors with scroll-margin to avoid header overlap
- Form:
  - HTML5 required fields, phone pattern, honeypot field, client-side success simulation
- Content blocks:
  - Card-like testimonials, responsive gallery with alt text, concise FAQ items

## Constraints/Risks
- No backend currently; form submit is simulated
- CDN dependencies (Tailwind + fonts) require network
- Real imagery/testimonials pending

## Status Summary
- Sales page live in repo and linked from hub
- Documentation captured in ShadCN-context and Memory Bank
- Ready for stakeholder review and content updates