# Project Brief — Central Otago Custom Cabins Sales Page

Repository context:
- Existing calculator tool page: [BuildersTool.html](../../BuildersTool.html)
- New marketing/sales page to add: [cabins-cromwell-queenstown.html](../../cabins-cromwell-queenstown.html)

## Purpose
Create a clean, modern, single-page sales site for a builder crafting custom cabins in Cromwell and Queenstown, New Zealand. The site should feel warm and friendly while remaining fast, accessible, and easy to navigate.

## Primary Objectives
- Single-page layout with top navigation linking to sections:
  - Hero, About, Gallery, Testimonials, FAQs, Contact
- Prominent phone contact:
  - Zeke — 021 180 1218 (clickable tel link)
- Contact form with basic client-side validation:
  - Fields: name, email, phone, message
  - Honeypot field for basic spam resistance
- Styling/UX:
  - Clean, modern, warm visual tone
  - Sticky, accessible navbar with mobile menu
  - Responsive gallery with descriptive alt text
- Tech:
  - Tailwind via CDN (no build step)
  - No backend dependency (front-end only; simulated submit success)
  - ShadCN/MagicUI-inspired component patterns where applicable

## Deliverables
1. New page file: [cabins-cromwell-queenstown.html](../../cabins-cromwell-queenstown.html)
2. Link from the calculator hub: [BuildersTool.html](../../BuildersTool.html)
3. ShadCN mapping notes: [ShadCN-context.md](../../ShadCN-context.md)
4. Memory Bank initialization under memory-bank/:
   - projectbrief.md (this file)
   - productContext.md
   - activeContext.md
   - systemPatterns.md
   - techContext.md
   - progress.md

## Design/Tone
- Warm, Central Otago character:
  - Amber accents, slate neutrals, high-quality imagery
- Friendly and approachable copy, concise CTAs: “Get a quote”, “Call Zeke”
- Accessibility:
  - Proper landmarks, labels, focus rings
  - details/summary for FAQs (native keyboard support)
  - aria-live region for form status

## SEO/Metadata
- Title, meta description, Open Graph tags
- JSON-LD LocalBusiness with telephone and service area
- Update canonical/og:url when production URL is known

## Non-goals (Out of Scope)
- Server-side form handling and storage
- CMS integration or dynamic data sources
- Payment or e-commerce features

## Constraints/Assumptions
- Static hosting compatible (just HTML/CSS/JS)
- Placeholder images from Unsplash used initially
- Works on modern evergreen browsers + mobile

## Success Criteria
- Page loads quickly (Tailwind via CDN, minimal JS)
- Clear calls to action (scroll-to-contact and telephone)
- Mobile navigation works with accessible toggling
- Content reflects Cromwell/Queenstown service area and cabin offering

## Follow-ups (Future Enhancements)
- Hook contact form to email/API (e.g., Formspree, serverless function)
- Add real project photos/testimonials
- Migrate to React/Next.js with shadcn/ui components if needed
