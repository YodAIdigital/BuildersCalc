# Tech Context — Central Otago Custom Cabins

Related files:
- Sales page: cabins-cromwell-queenstown.html
- Calculator hub: BuildersTool.html
- ShadCN notes: ShadCN-context.md

## Stack Overview
- Markup: Semantic HTML5
- Styling: Tailwind CSS via CDN (no build step)
- Fonts: Inter via Google Fonts
- Scripts: Vanilla JS for mobile nav toggle, form status, dynamic year
- Hosting: Any static host (open via filesystem or simple HTTP server)
- Assets: Placeholder images from Unsplash (to be replaced with real photos)

## Dependencies
- Tailwind CDN
  - Pros: zero config, fast iteration
  - Cons: runtime JIT adds small overhead; requires network
- Google Fonts (Inter)
  - Pros: high legibility, modern look
  - Cons: external request

## Browser Support
- Modern evergreen browsers (Chrome, Edge, Firefox, Safari)
- Graceful degradation for older browsers (no critical polyfills required)
- Mobile-first layout; tel: links expected to open dialer on mobile

## Accessibility
- Landmarks: header / main / footer used consistently
- Navigation:
  - Sticky header
  - Mobile toggle button with aria-controls and aria-expanded
  - Hash anchors with scroll-margin-top for correct in-view alignment
- Forms:
  - Labels bound to inputs
  - Required attributes + basic HTML5 validation
  - aria-live region for post-submit status
  - Honeypot field to reduce spam
- FAQ: native details/summary elements for built-in keyboard support

## Performance Considerations
- Minimal JavaScript; no frameworks
- Images:
  - Responsive grid
  - loading="lazy" on gallery images
- CSS:
  - Tailwind via CDN avoids bundling; consider prebuild in future if needed
- Caching: rely on host/browser cache for CDN assets

## Security
- No backend submission; form is client-side only (simulated success)
- Future integration: connect to serverless or third-party forms with CSRF considerations, spam filtering, and rate limiting

## Local Development
- Open the page directly in a browser:
  - cabins-cromwell-queenstown.html
  - Or start a simple HTTP server (optional)
- Navigate from the calculator hub:
  - BuildersTool.html includes a link to the sales page in the header

## Deployment
- Upload static files to host (e.g., Netlify, Vercel, S3/CloudFront, GitHub Pages)
- Update og:url and any canonical references to production URL
- Ensure HTTPS for tel: usage and general best practices

## ShadCN/MagicUI Alignment
- While this project is static HTML, the UI mirrors shadcn/ui component patterns:
  - Navbar (navigation-menu + sheet in React)
  - Button variants (primary/secondary)
  - Card (testimonials)
  - Accordion (FAQ)
  - Input/Textarea with labels and focus rings
- Migration path: Next.js + shadcn/ui, mapping Tailwind classes to component props/variants as documented in ShadCN-context.md

## Constraints
- CDN dependency for Tailwind and fonts
- No persistence for contact form (by design)
- Placeholder imagery; real assets pending

## File Map
- cabins-cromwell-queenstown.html — sales landing page
- BuildersTool.html — existing calculator hub, now linking to sales page
- ShadCN-context.md — component equivalence and migration notes

## Future Enhancements
- Replace placeholders with real photos/testimonials
- Integrate a form backend (Formspree/Netlify/serverless)
- Add analytics (privacy-aware)
- Consider a build step for Tailwind to optimize CSS, if site grows