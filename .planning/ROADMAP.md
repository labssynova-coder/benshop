# Roadmap — Ikherbane Chaussettes Website

## Milestone 1: MVP Showcase Website ✅ COMPLETE

### Phase 1: Foundation & Design System ✅
**Goal:** Set up project structure, CSS design system, and base layout
**Delivers:** R5 (partial)
**Commit:** 34a7d2b

- Initialize HTML/CSS/JS project structure ✅
- Create CSS design system (colors, typography, spacing, components) ✅
- Build responsive navbar (dark theme, logo, links, search/cart icons) ✅
- Set up base page layout shell (header, main, footer) ✅

### Phase 2: Homepage — Hero & Marquee ✅
**Goal:** Build the hero section and scrolling marquee
**Delivers:** R1, R2
**Commit:** 34a7d2b

- Create full-width hero section with sock product imagery ✅
- Build scrolling marquee banner with brand tagline ✅
- Generate hero images using AI (socks product photography style) ⚠️ (placeholder)
- Animate marquee with CSS ✅

### Phase 3: Homepage — Categories & Products ✅
**Goal:** Build the category grid and product listing sections
**Delivers:** R3, R4
**Commit:** 34a7d2b

- Create "Shop by Collection" category grid (Homme, Femme, Enfants, Autres) ✅
- Style category cards (rounded, with icons/imagery) ✅
- Build product listing grid with cards (image, name, price) ✅
- Generate product images and category icons ⚠️ (placeholder)

### Phase 4: Homepage — Trust Badges & Footer ✅
**Goal:** Complete the homepage with trust badges and footer
**Delivers:** R6, R7
**Commit:** 34a7d2b

- Build 3-column trust badge section with icons ✅
- Create dark footer with brand logo, tagline, contact info ✅
- Add social media links and policy links ✅
- Finalize homepage scroll experience ✅

### Phase 5: Catalog & Contact Pages ✅
**Goal:** Build secondary pages for catalog and contact
**Delivers:** R8, R9
**Commit:** 34a7d2b

- Create catalog page with category filter tabs ✅
- Build product grid for catalog page ✅
- Create contact page with embedded map, phone numbers ✅
- Add contact form (visual, non-functional) ✅

### Phase 6: Polish & Responsive ✅
**Goal:** Final responsive tuning, animations, cross-browser testing
**Delivers:** R10, R14
**Commit:** 6ed4ed0

- Full responsive audit (mobile, tablet, desktop) ✅
- Add hover effects, transitions, micro-animations ✅
- Cross-browser testing ✅
- Performance optimization ✅
- Final visual QA against Carbonix reference ✅

### Phase 7: Search Functionality ✅
**Goal:** Add product search with overlay UI
**Delivers:** R11
**Commit:** 9f08662

- Build search overlay modal triggered by navbar search icon ✅
- Implement client-side fuzzy search across product data ✅
- Display search results with product cards ✅
- Handle no results state ✅
- Keyboard shortcut (Ctrl+K / Cmd+K) ✅
- Close on Escape / click outside ✅

### Phase 8: Account & Login System ✅
**Goal:** Add user authentication UI with localStorage persistence
**Delivers:** R16 (new)
**Commit:** 9f08662

- Build login/register modal with form validation ✅
- Create account dropdown menu (orders, profile, logout) ✅
- Persist auth state in localStorage ✅
- Show logged-in user indicator in navbar ✅
- Account page with order history view ⚠️ (basic)

### Phase 9: Cart & Order System ✅
**Goal:** Add-to-cart functionality with order submission
**Delivers:** R12, R17 (new)
**Commit:** 9f08662

- Add "Ajouter au panier" buttons on product cards ✅
- Build slide-out cart drawer with product list ✅
- Cart item quantity controls (+/-) ✅
- Cart total calculation ✅
- Order checkout form (name, phone, address, wilaya) ✅
- Order submission via WhatsApp/email to admin ✅
- Cart badge counter in navbar (live update) ✅
- Cart persistence in localStorage ✅

### Phase 10: Product Detail Page ✅
**Goal:** Build individual product view with routing
**Delivers:** R13
**Commit:** 9df2bb0

- Create `product.html` layout ✅
- Update `script.js` to render product details via URL `?id=` parameter ✅
- Link `.product-card` clicks to `product.html` ✅
- Add product image viewer, description, and large "Add to Cart" button ✅

### Mobile Polish ✅
**Goal:** App-like mobile experience
**Commit:** efd6be5, 6ed4ed0

- Bottom navigation bar ✅
- Touch swipe gestures for cart drawer ✅
- Touch swipe gestures for nav menu ✅
- Haptic feedback on add-to-cart ✅

---
## Milestone 2: Production Hardening (Planned)

- Real product photography/images
- Actual WhatsApp number verification
- Contact form backend (emailJS or similar)
- Analytics integration
- SEO optimization
- Performance audit

## Backlog

- R15: Multilingual support (French/Arabic/English)
- Real payment integration (CIB/Dahabiya or COD optimization)
- User order tracking
- Inventory management
- Admin dashboard

---
*Last updated: 2026-04-03 — Milestone 1 COMPLETE*
