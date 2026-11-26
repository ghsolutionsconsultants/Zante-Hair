-- Zante Beauty: orders paid by card through Yoco.
-- Run once in the Supabase SQL editor. Only the Edge Function (service role) can read or write this table:
-- row level security is on and there are no public policies, so the website's public key cannot see orders.

create table if not exists public.orders (
  id               uuid primary key,
  ref              text unique not null,            -- our reference, e.g. ZB-7K3QX9PMAB
  created_at       timestamptz not null default now(),
  updated_at       timestamptz,
  status           text not null default 'new',     -- new, pending, paid, cancelled, expired, failed, not_started
  items            jsonb not null,                  -- [{ id, name, len, qty, price }]
  delivery         jsonb not null,                  -- { id, name, fee, time }
  customer         jsonb not null,                  -- { name, phone, address, mapUrl }
  amount_cents     integer not null check (amount_cents >= 200),
  drop_name        text,
  yoco_checkout_id text unique,
  yoco_payment_id  text,
  yoco_status      text,
  redirect_url     text,
  processing_mode  text,                            -- 'test' or 'live'
  receipt_sent_at  timestamptz                      -- when the receipt email went out
);

-- for a table made with an earlier version of this file
alter table public.orders add column if not exists receipt_sent_at timestamptz;

alter table public.orders enable row level security;

create index if not exists orders_created_at_idx on public.orders (created_at desc);
create index if not exists orders_status_idx on public.orders (status);
