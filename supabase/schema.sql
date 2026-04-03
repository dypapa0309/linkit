create table if not exists public.profiles (
  user_id uuid primary key references auth.users (id) on delete cascade,
  username text not null unique,
  name text not null default '',
  bio text not null default '',
  avatar_url text not null default '',
  cta_text text not null default '',
  cta_link text not null default '',
  trust_review_count integer not null default 0,
  trust_response_time text not null default '',
  trust_reuse_rate text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.profiles
drop column if exists email;

alter table public.profiles
add column if not exists plan text not null default 'free';

create table if not exists public.link_items (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  title text not null,
  link text not null,
  "order" integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create or replace function public.handle_profile_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create or replace function public.handle_link_item_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create or replace function public.enforce_free_link_limit()
returns trigger
language plpgsql
as $$
declare
  current_plan text;
  current_count integer;
begin
  select plan into current_plan
  from public.profiles
  where user_id = new.user_id;

  if coalesce(current_plan, 'free') = 'free' then
    select count(*) into current_count
    from public.link_items
    where user_id = new.user_id;

    if current_count >= 3 then
      raise exception '무료 플랜은 링크를 3개까지 추가할 수 있어요.'
        using errcode = 'P0001';
    end if;
  end if;

  return new;
end;
$$;

drop trigger if exists profiles_set_updated_at on public.profiles;

create trigger profiles_set_updated_at
before update on public.profiles
for each row
execute function public.handle_profile_updated_at();

drop trigger if exists link_items_set_updated_at on public.link_items;

create trigger link_items_set_updated_at
before update on public.link_items
for each row
execute function public.handle_link_item_updated_at();

drop trigger if exists link_items_enforce_free_limit on public.link_items;

create trigger link_items_enforce_free_limit
before insert on public.link_items
for each row
execute function public.enforce_free_link_limit();

alter table public.profiles enable row level security;
alter table public.link_items enable row level security;

drop policy if exists "Profiles are viewable by everyone" on public.profiles;
create policy "Profiles are viewable by everyone"
on public.profiles
for select
using (true);

drop policy if exists "Users can insert their own profile" on public.profiles;
create policy "Users can insert their own profile"
on public.profiles
for insert
with check (auth.uid() = user_id);

drop policy if exists "Users can update their own profile" on public.profiles;
create policy "Users can update their own profile"
on public.profiles
for update
using (auth.uid() = user_id);

drop policy if exists "Link items are viewable by everyone" on public.link_items;
create policy "Link items are viewable by everyone"
on public.link_items
for select
using (true);

drop policy if exists "Users can insert their own link items" on public.link_items;
create policy "Users can insert their own link items"
on public.link_items
for insert
with check (auth.uid() = user_id);

drop policy if exists "Users can update their own link items" on public.link_items;
create policy "Users can update their own link items"
on public.link_items
for update
using (auth.uid() = user_id);

drop policy if exists "Users can delete their own link items" on public.link_items;
create policy "Users can delete their own link items"
on public.link_items
for delete
using (auth.uid() = user_id);
