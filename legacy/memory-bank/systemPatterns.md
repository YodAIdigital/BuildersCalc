# System Patterns — Central Otago Custom Cabins

Related files:
- Sales page: [cabins-cromwell-queenstown.html](../cabins-cromwell-queenstown.html)
- Calculator hub: [BuildersTool.html](../BuildersTool.html)
- ShadCN notes: [ShadCN-context.md](../ShadCN-context.md)

## Architecture
- Static multi-page site (no build step)
- Pages: marketing landing and calculator tool
- Styling with Tailwind via CDN; Inter font via Google Fonts
- Vanilla JS for lightweight behaviors (mobile nav, form status, dynamic year)

## Key Technical Decisions
- Keep deploy simple: static hosting-friendly
- Use semantic HTML landmarks (header, main, footer)
- Use details/summary for accessible FAQ
- Add JSON-LD LocalBusiness for rich snippets
- Prefer tel: links for instant contact on mobile
- Scroll-smooth + scroll-margin-top to align hash navigation under sticky header

## Component Relationships
- Header navbar anchors link to sections in [cabins-cromwell-queenstown.html](../cabins-cromwell-queenstown.html)
- Mobile menu toggled via button with aria-expanded and controlled panel
- Contact form signals success via aria-live, no backend
- Footer shows current year via small script
- From [BuildersTool.html](../BuildersTool.html) a header link opens the sales page

## Critical Implementation Paths
- Primary CTA: anchors to #contact
- Secondary CTA: tel:0211801218
- SEO surface: title, description, Open Graph, JSON-LD
- Performance: lazy-load gallery images; minimal JS; no large libraries

## Accessibility Patterns
- Focus-visible rings on buttons/links
- Proper labels for all form fields
- details/summary provide built-in keyboard support
- aria-live polite region for post-submit status
- Descriptive alt text on images

## SEO and Social
- og:title/description/image/url populated
- theme-color for mobile browser UI
- Ensure og:url updated on deploy

## Extensibility
- Swap placeholder images/testimonials for real content
- Wire contact form to email/API (Formspree/Netlify/serverless)
- Potential migration path to React/Next with shadcn/ui components
- Extract styles to CSS and consider Tailwind config if build step introduced

## Risks/Constraints
- CDN dependency for Tailwind and fonts
- No persistence for form submissions
- Unsplash placeholders until real assets are provided

## Testing Notes
- Validate anchor navigation on mobile/desktop
- Test tel: on iOS/Android
- Check form validation states and aria-live messaging
- Verify images lazy-load and maintain layout
