# TundaGo MVP (GitHub + Vercel + Neon)

This starter includes a mobile-friendly fruit storefront, product listing, cart, customer/delivery form, order API, Neon schema, and token-protected admin order list/status updates.

## Important status
- Payment integration is **not connected**. `api/payment.js` intentionally returns 501. Do not accept or tell customers to pay based on this demo.
- This is an MVP starter, not production-ready. Admin token authentication is a simple shared token; before real use, replace it with proper authentication, rate limits, validation, CSRF protections where relevant, and audit logging.
- Product images are externally hosted image URLs; replace with URLs you have rights to use.

## 1) Neon setup
1. Create a Neon database.
2. Open SQL Editor and run `database/schema.sql`.
3. Copy the Neon connection string.

## 2) GitHub
Upload these files/folders to a repository root (or push the folder).
## 3) Vercel
Import the GitHub repository. Framework preset: Other. Root directory: `.`.
Set environment variables:
- `DATABASE_URL` = Neon connection string
- `ADMIN_TOKEN` = long random token
- `WEBPUSH_API_URL`, `WEBPUSH_API_KEY`, `WEBPUSH_SECRET` remain empty until API docs are reviewed
Deploy.
## URLs
- Store: `/`
- Admin: `/admin.html`
## Admin
Open `/admin.html`, enter the same `ADMIN_TOKEN`, then Load orders. Status can be changed. Do not set `paid` unless payment is verified independently.
