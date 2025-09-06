# ShadCN Component Context — Central Otago Custom Cabins

Page implemented: [cabins-cromwell-queenstown.html](cabins-cromwell-queenstown.html)
Link added from: [BuildersTool.html](BuildersTool.html)

This project is plain HTML + Tailwind via CDN, so we mapped ShadCN/MagicUI components to Tailwind equivalents that mirror their API and UX patterns. If the project migrates to React/Next.js, these notes guide a drop-in replacement using shadcn/ui.

## Component Equivalents Used

- Navbar
  - ShadCN analogs: navigation-menu + sheet/drawer for mobile
  - Implementation: sticky header, focus-ring, mobile toggle state with aria-expanded, landmark semantics.

- Button
  - ShadCN analog: button
  - Implementation: Tailwind-styled anchors/buttons with consistent sizes, weights, focus-ring, hover states. Primary = amber-600, Secondary = white/10 (hero) or slate-100.

- Card (Testimonials)
  - ShadCN analog: card
  - Implementation: rounded-xl, border, shadow-sm, padding for content blocks.

- Accordion (FAQs)
  - ShadCN analog: accordion
  - Implementation: semantic details/summary with focusable summary, disclosure icon rotation, divided container.

- Input / Textarea (Contact form)
  - ShadCN analogs: input, textarea, label
  - Implementation: labeled fields, rounded-md, border, focus:ring-amber-600. HTML5 validation attributes; pattern on phone.

- Footer
  - ShadCN analog: footer/layout primitives
  - Implementation: border-t container with utility links (Back to top, tel).

- Alert/Status
  - ShadCN analog: alert
  - Implementation: screen-reader status region (aria-live) toggled on successful submit.

## Design Tokens and Styling

- Typography: Inter (400–800)
- Color system: slate as base, amber as brand accent for “warm, friendly” tone
  - Primaries: bg-amber-600 hover:bg-amber-700, ring-amber-600
  - Neutrals: slate-50/100/200/600/800/900
- Shadows/borders: subtle elevation for cards and images
- Radius: rounded-md for controls, rounded-xl for cards/images

## Accessibility

- Header: sticky nav with mobile toggle button (aria-controls, aria-expanded)
- Keyboard support: visible focus rings on actionable elements
- Landmarks: header/main/footer; anchor skip via #home target
- Images: descriptive alt text for all gallery images
- Forms: labels bound to inputs, HTML5 validation, aria-live feedback, honeypot field to reduce spam

## Structured Data / SEO

- Meta: title, description, theme-color, Open Graph tags
- JSON-LD: LocalBusiness with telephone and service area
- Canonical URL placeholder: update og:url when deploying

## Migration Notes (to shadcn/ui in React/Next.js)

- Replace Tailwind-only buttons with <Button /> (primary/secondary variants)
- Swap FAQs details/summary for <Accordion /> items
- Use <Card /> for testimonials
- Wrap nav links with NavigationMenu primitives and Sheet/Drawer for mobile
- Inputs/Textarea with shadcn/ui inputs; preserve labels and validation
- Consider <Toast /> or <Alert /> for submit status

## Files Touched

- Sales page created: [cabins-cromwell-queenstown.html](cabins-cromwell-queenstown.html)
- Link added from calculator hub: [BuildersTool.html](BuildersTool.html)
