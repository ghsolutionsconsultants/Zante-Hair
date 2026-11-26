# Zante Beauty · Supabase setup (about 10 minutes)

The website works without this, but in draft mode a submitted review stays on that one phone or laptop.
Once Supabase is connected, every review goes into one shared database, and you approve it before it shows.

## 1. Create the project
1. Sign up at supabase.com (free plan is enough) with the Zante business email.
2. Create a project called `zante-beauty`. Pick the **South Africa (Cape Town)** region if offered, otherwise the closest one.

## 2. Create the tables
1. In the project, open **SQL Editor > New query**.
2. Paste everything from `supabase/schema.sql` and press **Run**.

This creates:
- `reviews` – the website form writes here. New reviews are always `pending`.
- `drops`, `orders`, `order_events`, `supplier_sheet` – ready for when checkout goes live
  (batch names vs internal references, per-order status, supplier sheet export).

## 3. Connect the website
1. Open **Project Settings > API**.
2. Copy the **Project URL** and the **anon public** key. (The anon key is safe in a website. Never use the `service_role` key there.)
3. In `index.html`, fill in:
   ```js
   window.ZANTE_CONFIG = { supabaseUrl: 'https://xxxx.supabase.co', supabaseAnonKey: 'eyJ...' };
   ```

## 4. Approve reviews
**Table Editor > reviews** > change `status` from `pending` to `approved`. It appears on the site straight away.
Names are never collected for display. `order_ref` is private and hidden from the public key.

## Card payments with Yoco

The website never holds the Yoco secret key. A small Supabase Edge Function (`functions/yoco/index.ts`)
creates each Yoco checkout, keeps the order in the `orders` table and checks whether it is paid.

1. In Supabase, open the SQL editor and run `orders.sql`.
2. Open **Edge Functions**, create a function called `yoco`, paste in `functions/yoco/index.ts` and deploy it.
   In the function settings, turn **Verify JWT** off (Yoco and the shop call it without a Supabase login).
   With the CLI instead: `supabase functions deploy yoco --no-verify-jwt`.
3. Open **Edge Functions → Secrets** and add `YOCO_SECRET_KEY`. Start with the **test** secret key (`sk_test_...`).
4. In `tools/build.py`, fill in `ZANTE_CONFIG`: `supabaseUrl`, `supabaseAnonKey` and
   `paymentsUrl: 'https://<project-ref>.supabase.co/functions/v1/yoco'`. Rebuild and deploy the site.
   The bag then shows **Pay now by card**. With `paymentsUrl` empty, the shop stays on WhatsApp ordering.
5. Test with Yoco's test cards (Yoco app → Checkout API → How to connect → Test card details).
   After paying you land on `order.html`, which should say the payment is received. Check the `orders` table.
6. Going live: in the Yoco app, make sure `zantebeauty.co.za` and `www.zantebeauty.co.za` are under
   **Verified Domains**. Then replace `YOCO_SECRET_KEY` with a **newly generated** live secret key.
   Live payments only work when the customer reaches Yoco from the shop's own domain.
7. Payment links on WhatsApp: send `https://zantebeauty.co.za/pay.html?ref=<order ref>`, never the raw Yoco
   link. The page forwards the customer to Yoco from the shop's domain, which Yoco needs for live payments.

Notes
- Prices and delivery fees are worked out in the function (`PRODUCTS` and `SHIP`). Keep them in step with
  `assets/js/app.js` when prices change.
- A checkout counts as paid when Yoco's status is `completed` (see `PAID` in the function). If paid orders
  stay "pending", compare with Yoco's "Get checkout" API reference and adjust `PAID`.
- Aramex delivery is quoted, so it cannot be paid by card at checkout. It stays a WhatsApp order.

### Receipts by email (optional)
The bag asks every customer for first name, surname, email and cellphone, and whether to send the receipt by
email, WhatsApp or both. WhatsApp receipts are sent by the shop. To send email receipts automatically when a
card payment is confirmed (with a copy of every paid order to the shop):
1. Create a free account at resend.com and verify the domain `zantebeauty.co.za` (add the DNS records it shows).
2. Add Edge Function secrets: `RESEND_API_KEY`, and `RECEIPT_FROM` (e.g. `Zante Beauty <orders@zantebeauty.co.za>`).
   Optional: `SHOP_EMAIL` (default `zantebeauty@outlook.com`).
Without these, nothing is emailed and the order page offers "Print or save receipt".
