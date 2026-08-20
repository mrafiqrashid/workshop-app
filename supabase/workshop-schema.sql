-- ════════════════════════════════════════════════════════════════
-- Food ordering schema (Module 5 revamp)
-- Run this ONCE in your Supabase project's SQL editor.
-- Safe to re-run by accident: every statement is guarded.
-- Contains NO destructive statements (no drop / truncate / delete).
-- ════════════════════════════════════════════════════════════════

-- 1) The menu — a public catalog, not owned by any one user.
create table if not exists public.menu_items (
  id           uuid primary key default gen_random_uuid(),
  name         text not null check (char_length(name) between 1 and 120),
  description  text check (description is null or char_length(description) <= 500),
  price        numeric(10,2) not null check (price >= 0),
  category     text not null default 'main',
  is_available boolean not null default true,
  created_at   timestamptz not null default now()
);

-- Speeds up "list the menu, grouped by category" — exactly what the app does.
create index if not exists menu_items_category_idx
  on public.menu_items (category, name);

alter table public.menu_items enable row level security;

-- Anyone signed in can browse the available menu. There is NO write policy
-- for regular users: the menu is managed by running SQL directly, same as
-- this file itself.
do $$
begin
  if not exists (select 1 from pg_policies
                 where schemaname = 'public' and tablename = 'menu_items'
                   and policyname = 'menu_items_select_available') then
    create policy menu_items_select_available on public.menu_items
      for select using (is_available = true);
  end if;
end $$;

-- 2) Orders — one row per checkout, owned by exactly one user.
--    user_id is the owner column: it links each row to a signed-in user.
create table if not exists public.orders (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid not null references auth.users (id) on delete cascade,
  status       text not null default 'pending'
               check (status in ('pending', 'preparing', 'ready', 'completed', 'cancelled')),
  total_amount numeric(10,2) not null check (total_amount >= 0),
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

-- Speeds up "list MY orders, newest first" — exactly what the app does.
create index if not exists orders_user_created_idx
  on public.orders (user_id, created_at desc);

-- Row Level Security: the DATABASE enforces "you only see your own orders".
-- Even a modified app or a direct API call cannot cross users.
alter table public.orders enable row level security;

do $$
begin
  if not exists (select 1 from pg_policies
                 where schemaname = 'public' and tablename = 'orders'
                   and policyname = 'orders_select_own') then
    create policy orders_select_own on public.orders
      for select using (auth.uid() = user_id);
  end if;

  if not exists (select 1 from pg_policies
                 where schemaname = 'public' and tablename = 'orders'
                   and policyname = 'orders_insert_own') then
    create policy orders_insert_own on public.orders
      for insert with check (auth.uid() = user_id);
  end if;
end $$;

-- 3) Order line items — what was ordered, and at what price at the time.
--    unit_price is a snapshot: a later menu price change never rewrites
--    past orders.
create table if not exists public.order_items (
  id           uuid primary key default gen_random_uuid(),
  order_id     uuid not null references public.orders (id) on delete cascade,
  menu_item_id uuid not null references public.menu_items (id),
  quantity     int not null check (quantity > 0),
  unit_price   numeric(10,2) not null check (unit_price >= 0)
);

create index if not exists order_items_order_idx
  on public.order_items (order_id);

alter table public.order_items enable row level security;

-- order_items has no user_id column of its own, so ownership is checked
-- THROUGH the parent order.
do $$
begin
  if not exists (select 1 from pg_policies
                 where schemaname = 'public' and tablename = 'order_items'
                   and policyname = 'order_items_select_own') then
    create policy order_items_select_own on public.order_items
      for select using (
        exists (select 1 from public.orders
                where orders.id = order_items.order_id
                  and orders.user_id = auth.uid())
      );
  end if;

  if not exists (select 1 from pg_policies
                 where schemaname = 'public' and tablename = 'order_items'
                   and policyname = 'order_items_insert_own') then
    create policy order_items_insert_own on public.order_items
      for insert with check (
        exists (select 1 from public.orders
                where orders.id = order_items.order_id
                  and orders.user_id = auth.uid())
      );
  end if;
end $$;

-- 4) Keep updated_at fresh whenever an order's status changes.
create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create or replace trigger orders_set_updated_at
  before update on public.orders
  for each row execute function public.set_updated_at();

-- 5) A few starter menu items so the app isn't empty on first run.
--    Guarded so re-running this file never creates duplicates.
insert into public.menu_items (name, description, price, category)
select * from (values
  ('Margherita Pizza', 'Tomato, mozzarella, fresh basil.', 12.50, 'main'),
  ('Caesar Salad', 'Romaine, parmesan, croutons, caesar dressing.', 8.00, 'starter'),
  ('Beef Burger', 'Beef patty, cheddar, lettuce, house sauce.', 11.00, 'main'),
  ('Iced Lemon Tea', 'Freshly brewed, served cold.', 3.50, 'drink'),
  ('Chocolate Brownie', 'Warm, served with a scoop of vanilla ice cream.', 5.50, 'dessert')
) as seed(name, description, price, category)
where not exists (select 1 from public.menu_items);
