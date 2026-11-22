# TundaGo (GitHub + Vercel + Neon)

Duka la matunda: bidhaa, cart (inahifadhiwa), oda, stock inapungua kiotomatiki, kufuatilia oda, na admin (oda + bidhaa).

## Vercel Environment Variables
`DATABASE_URL`, `ADMIN_TOKEN` (lazima). Hiari: `DELIVERY_FEE`, `PAYMENT_NUMBER`, `PAYMENT_NAME`, `PAYMENT_NETWORK`, `SHOP_PHONE`.
Tables zinatengenezwa zenyewe kwenye request ya kwanza.

## Malipo
- **Cash**: admin anaweka "imelipwa" (au inakuwa hivyo oda ikikamilika).
- **Simu (manual)**: mteja anatuma pesa kwa `PAYMENT_NUMBER` na kuweka transaction ID; wewe unahakiki kwenye simu yako kisha bonyeza "Weka imelipwa".
- Gateway ya moja kwa moja (`api/payment.js`) haijaunganishwa bado.

URLs: `/` duka, `/admin.html` admin.
