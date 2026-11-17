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
