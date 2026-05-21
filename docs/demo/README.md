# BENSHOP — Demo Screenshots

Automated screenshots captured via [Playwright](https://playwright.dev/) using `demo.js` at the project root.

## Customer Experience

| # | Screenshot | Description |
|---|-----------|-------------|
| 1 | `01-homepage.png` | Homepage with hero banner, collections, popular products (FR) |
| 2 | `02-homepage-english.png` | Homepage switched to English |
| 3 | `03-homepage-arabic.png` | Homepage in Arabic with RTL layout |
| 4 | `04-catalog-all.png` | Full product catalog, all categories |
| 5 | `05-catalog-femme.png` | Catalog filtered to Women (Femme) category |
| 6 | `07-product-detail.png` | Product detail with multi-image gallery, stock, add-to-cart |
| 7 | `09-cart-drawer.png` | Cart drawer with added items |
| 8 | `10-cart-no-checkout.png` | Cart view when checkout is not available |
| 9 | `11-contact.png` | Contact form page |
| 10 | `12-search-modal.png` | Search modal (Ctrl+K) with live results for "sport" |

## Admin Panel

| # | Screenshot | Description |
|---|-----------|-------------|
| 11 | `13-admin-login.png` | Admin login page |
| 12 | `14-admin-dashboard.png` | Dashboard with stats, recent orders, top products |
| 13 | `15-admin-products.png` | Product management list |
| 14 | `17-admin-orders.png` | Order management with status workflow |
| 15 | `18-admin-messages.png` | Contact messages inbox |
| 16 | `19-admin-families.png` | Product family management |

## Running the Demo

```bash
# Start the server
npm start

# In another terminal, run the demo script
node demo.js
```

Requires Playwright installed (`npm install playwright`).

Screenshots are saved to `docs/demo/`.