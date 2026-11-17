-- Zante Beauty · Supabase schema
-- Paste into Supabase > SQL Editor > New query, then Run. Safe to run once on a new project.
--
-- Part 1 is live now: customer reviews (the website's "Write a review" form).
-- Part 2 is ready for when checkout goes live: drops (production batches), orders, and order status history.
-- Row Level Security (RLS) means the public website key can only do what is allowed below.

------------------------------------------------------------------
-- PART 1 · REVIEWS
------------------------------------------------------------------
create table if not exists public.reviews (
  id          uuid primary key default gen_random_uuid(),
  created_at  timestamptz not null default now(),
  rating      smallint not null check (rating between 1 and 5),
  product     text not null check (product in ('halfwig', 'upart')),
  length_in   smallint check (length_in in (10, 12, 14, 16, 18, 20, 22)),
  body        text not null check (char_length(body) between 10 and 600),
  order_ref   text check (char_length(order_ref) <= 40),     -- private: used only to verify the client
  city        text check (char_length(city) <= 40),
  consent     boolean not null check (consent),              -- client agreed to publication without her name
  status      text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
  approved_at timestamptz
);

alter table public.reviews enable row level security;

-- Anyone on the website may submit a review, but it always starts as pending.
create policy "public can submit pending reviews" on public.reviews
  for insert to anon
  with check (status = 'pending' and approved_at is null);

-- Anyone may read approved reviews only.
create policy "public can read approved reviews" on public.reviews
  for select to anon
  using (status = 'approved');

-- The website never needs order_ref, so hide that column from the public key.
revoke select on public.reviews from anon;
grant select (id, created_at, rating, product, length_in, body, city, status) on public.reviews to anon;
grant insert (rating, product, length_in, body, order_ref, city, consent) on public.reviews to anon;

-- To approve: Supabase > Table Editor > reviews > set status to 'approved'.

------------------------------------------------------------------
-- PART 2 · DROPS AND ORDERS (back office, no public access)
------------------------------------------------------------------
-- One row per production batch. Customer-facing name and internal reference stay separate.
create table if not exists public.drops (
  ref          text primary key,                 -- internal: ZB-2026-12-01 (first Monday) / ZB-2026-12-02 (third Monday)
  name         text not null,                    -- public: The First Drop – December 2026
  closes_at    timestamptz not null,             -- first or third Monday of the month, 18:00 SAST
  supplier_ref text,                             -- supplier order reference for this batch
  status       text not null default 'open' check (status in ('open', 'closed', 'in_production', 'shipping', 'arrived', 'complete'))
);

create table if not exists public.orders (
  id               uuid primary key default gen_random_uuid(),
  created_at       timestamptz not null default now(),
  drop_ref         text not null references public.drops(ref),
  seq              int not null,                 -- 1, 2, 3 … within the drop
  order_ref        text generated always as (drop_ref || '_' || lpad(seq::text, 2, '0')) stored,  -- ZB-2026-12-01_07
  customer_name    text not null,
  phone            text not null,
  email            text,
  delivery_method  text check (delivery_method in ('postnet', 'aramex')),
  delivery_address text,
  product          text not null check (product in ('halfwig', 'upart')),
  length_in        smallint not null check (length_in in (10, 12, 14, 16, 18, 20, 22)),
  quantity         smallint not null default 1 check (quantity > 0),
  unit_price       numeric(10, 2) not null,
  delivery_fee     numeric(10, 2) not null default 0,
  total_paid       numeric(10, 2) not null default 0,
  payment_ref      text,
  payment_status   text not null default 'unpaid' check (payment_status in ('unpaid', 'paid', 'refunded')),
  supplier_cost    numeric(10, 2),
  status           text not null default 'order_secured' check (status in (
                     'order_secured', 'production_underway', 'on_its_way', 'arrived_at_zante',
                     'ready_for_dispatch', 'dispatched')),
  courier          text,
  tracking_number  text,
  dispatched_on    date,
  unique (drop_ref, seq)
);

-- Every status change is logged, so customer updates (WhatsApp or email) can be sent from it.
create table if not exists public.order_events (
  id         bigint generated always as identity primary key,
  order_id   uuid not null references public.orders(id) on delete cascade,
  status     text not null,
  note       text,
  created_at timestamptz not null default now(),
  notified   boolean not null default false
);

create or replace function public.log_order_status() returns trigger language plpgsql as $$
begin
  if tg_op = 'INSERT' or new.status is distinct from old.status then
    insert into public.order_events (order_id, status) values (new.id, new.status);
  end if;
  return new;
end $$;

drop trigger if exists orders_status_log on public.orders;
create trigger orders_status_log after insert or update of status on public.orders
  for each row execute function public.log_order_status();

alter table public.drops enable row level security;
alter table public.orders enable row level security;
alter table public.order_events enable row level security;
-- No anon policies on purpose: only Zante (signed in to Supabase) can see orders.

-- Supplier order sheet for one drop: Table Editor > this view > filter drop_ref > Export to CSV.
create or replace view public.supplier_sheet with (security_invoker = true) as
  select drop_ref, product, length_in, sum(quantity) as units, sum(coalesce(supplier_cost, 0) * quantity) as supplier_cost
  from public.orders where payment_status = 'paid'
  group by drop_ref, product, length_in
  order by drop_ref, product, length_in;
