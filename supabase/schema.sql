-- Her Namibia — run this in the Supabase SQL Editor.
-- Uses text columns only. No Postgres enums.

-- ---------------------------------------------------------------------------
-- Helpers
-- ---------------------------------------------------------------------------
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ---------------------------------------------------------------------------
-- Tables
-- ---------------------------------------------------------------------------
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text,
  first_name text,
  last_name text,
  full_name text,
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  role text not null default 'admin',
  created_at timestamptz not null default now(),
  unique (user_id, role)
);

create or replace function public.has_role(_role text, _user_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.user_roles
    where role = _role
      and user_id = _user_id
  );
$$;

create table if not exists public.work_updates (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text not null,
  image_urls jsonb not null default '[]'::jsonb,
  work_date date not null default current_date,
  sector text,
  status text not null default 'draft',
  created_by uuid references auth.users (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.resources (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text not null,
  resource_type text not null default 'Feature',
  sector text,
  file_url text,
  external_url text,
  author text,
  publication_date date not null default current_date,
  status text not null default 'draft',
  created_by uuid references auth.users (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.news (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  summary text,
  content text not null,
  news_date date not null default current_date,
  sector text,
  category text,
  image_urls jsonb not null default '[]'::jsonb,
  external_link text,
  status text not null default 'draft',
  created_by uuid references auth.users (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.employee_emails (
  id uuid primary key default gen_random_uuid(),
  employee_name text not null,
  email_address text not null unique,
  department text,
  position text,
  status text not null default 'active',
  created_by uuid references auth.users (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.admin_invitations (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  full_name text,
  invited_by uuid references auth.users (id) on delete set null,
  status text not null default 'pending',
  notes text,
  expires_at timestamptz not null default (now() + interval '14 days'),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists work_updates_status_idx on public.work_updates (status);
create index if not exists work_updates_work_date_idx on public.work_updates (work_date desc);
create index if not exists resources_status_idx on public.resources (status);
create index if not exists news_status_idx on public.news (status);
create index if not exists news_category_idx on public.news (category);
create index if not exists news_news_date_idx on public.news (news_date desc);
create index if not exists user_roles_user_id_idx on public.user_roles (user_id);
create index if not exists admin_invitations_email_idx on public.admin_invitations (email);

drop trigger if exists set_profiles_updated_at on public.profiles;
create trigger set_profiles_updated_at
before update on public.profiles
for each row execute function public.set_updated_at();

drop trigger if exists set_work_updates_updated_at on public.work_updates;
create trigger set_work_updates_updated_at
before update on public.work_updates
for each row execute function public.set_updated_at();

drop trigger if exists set_resources_updated_at on public.resources;
create trigger set_resources_updated_at
before update on public.resources
for each row execute function public.set_updated_at();

drop trigger if exists set_news_updated_at on public.news;
create trigger set_news_updated_at
before update on public.news
for each row execute function public.set_updated_at();

drop trigger if exists set_employee_emails_updated_at on public.employee_emails;
create trigger set_employee_emails_updated_at
before update on public.employee_emails
for each row execute function public.set_updated_at();

drop trigger if exists set_admin_invitations_updated_at on public.admin_invitations;
create trigger set_admin_invitations_updated_at
before update on public.admin_invitations
for each row execute function public.set_updated_at();

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, first_name, last_name, full_name)
  values (
    new.id,
    new.email,
    new.raw_user_meta_data ->> 'first_name',
    new.raw_user_meta_data ->> 'last_name',
    coalesce(new.raw_user_meta_data ->> 'full_name', new.email)
  )
  on conflict (id) do update
    set email = excluded.email,
        first_name = coalesce(excluded.first_name, public.profiles.first_name),
        last_name = coalesce(excluded.last_name, public.profiles.last_name),
        full_name = coalesce(excluded.full_name, public.profiles.full_name);
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

-- ---------------------------------------------------------------------------
-- Row Level Security
-- ---------------------------------------------------------------------------
alter table public.profiles enable row level security;
alter table public.user_roles enable row level security;
alter table public.work_updates enable row level security;
alter table public.resources enable row level security;
alter table public.news enable row level security;
alter table public.employee_emails enable row level security;
alter table public.admin_invitations enable row level security;

drop policy if exists "Public can read profiles" on public.profiles;
create policy "Public can read profiles"
on public.profiles for select
using (true);

drop policy if exists "Users can update own profile" on public.profiles;
create policy "Users can update own profile"
on public.profiles for update
to authenticated
using (id = auth.uid())
with check (id = auth.uid());

drop policy if exists "Users can insert own profile" on public.profiles;
create policy "Users can insert own profile"
on public.profiles for insert
to authenticated
with check (id = auth.uid() or public.has_role('admin', auth.uid()));

drop policy if exists "Admins can manage profiles" on public.profiles;
create policy "Admins can manage profiles"
on public.profiles for all
to authenticated
using (public.has_role('admin', auth.uid()))
with check (public.has_role('admin', auth.uid()));

drop policy if exists "Users can read own roles" on public.user_roles;
create policy "Users can read own roles"
on public.user_roles for select
to authenticated
using (user_id = auth.uid() or public.has_role('admin', auth.uid()));

drop policy if exists "Admins can manage roles" on public.user_roles;
create policy "Admins can manage roles"
on public.user_roles for all
to authenticated
using (public.has_role('admin', auth.uid()))
with check (public.has_role('admin', auth.uid()));

drop policy if exists "Anyone can read published articles" on public.work_updates;
create policy "Anyone can read published articles"
on public.work_updates for select
using (status = 'published' or public.has_role('admin', auth.uid()));

drop policy if exists "Admins can manage articles" on public.work_updates;
create policy "Admins can manage articles"
on public.work_updates for all
to authenticated
using (public.has_role('admin', auth.uid()))
with check (public.has_role('admin', auth.uid()));

drop policy if exists "Anyone can read published resources" on public.resources;
create policy "Anyone can read published resources"
on public.resources for select
using (status = 'published' or public.has_role('admin', auth.uid()));

drop policy if exists "Admins can manage resources" on public.resources;
create policy "Admins can manage resources"
on public.resources for all
to authenticated
using (public.has_role('admin', auth.uid()))
with check (public.has_role('admin', auth.uid()));

drop policy if exists "Anyone can read published news" on public.news;
create policy "Anyone can read published news"
on public.news for select
using (status = 'published' or public.has_role('admin', auth.uid()));

drop policy if exists "Admins can manage news" on public.news;
create policy "Admins can manage news"
on public.news for all
to authenticated
using (public.has_role('admin', auth.uid()))
with check (public.has_role('admin', auth.uid()));

drop policy if exists "Admins can manage contact emails" on public.employee_emails;
create policy "Admins can manage contact emails"
on public.employee_emails for all
to authenticated
using (public.has_role('admin', auth.uid()))
with check (public.has_role('admin', auth.uid()));

drop policy if exists "Users can read own invitation" on public.admin_invitations;
create policy "Users can read own invitation"
on public.admin_invitations for select
to authenticated
using (
  email = (auth.jwt() ->> 'email')
  or public.has_role('admin', auth.uid())
);

drop policy if exists "Admins can manage invitations" on public.admin_invitations;
create policy "Admins can manage invitations"
on public.admin_invitations for all
to authenticated
using (public.has_role('admin', auth.uid()))
with check (public.has_role('admin', auth.uid()));

-- ---------------------------------------------------------------------------
-- Storage
-- ---------------------------------------------------------------------------
insert into storage.buckets (id, name, public)
values
  ('work-images', 'work-images', true),
  ('resource-files', 'resource-files', true)
on conflict (id) do update
set public = excluded.public;

drop policy if exists "Public can read work images" on storage.objects;
create policy "Public can read work images"
on storage.objects for select
using (bucket_id = 'work-images');

drop policy if exists "Admins can upload work images" on storage.objects;
create policy "Admins can upload work images"
on storage.objects for insert
to authenticated
with check (bucket_id = 'work-images' and public.has_role('admin', auth.uid()));

drop policy if exists "Admins can update work images" on storage.objects;
create policy "Admins can update work images"
on storage.objects for update
to authenticated
using (bucket_id = 'work-images' and public.has_role('admin', auth.uid()));

drop policy if exists "Admins can delete work images" on storage.objects;
create policy "Admins can delete work images"
on storage.objects for delete
to authenticated
using (bucket_id = 'work-images' and public.has_role('admin', auth.uid()));

drop policy if exists "Public can read resource files" on storage.objects;
create policy "Public can read resource files"
on storage.objects for select
using (bucket_id = 'resource-files');

drop policy if exists "Admins can upload resource files" on storage.objects;
create policy "Admins can upload resource files"
on storage.objects for insert
to authenticated
with check (bucket_id = 'resource-files' and public.has_role('admin', auth.uid()));

drop policy if exists "Admins can update resource files" on storage.objects;
create policy "Admins can update resource files"
on storage.objects for update
to authenticated
using (bucket_id = 'resource-files' and public.has_role('admin', auth.uid()));

drop policy if exists "Admins can delete resource files" on storage.objects;
create policy "Admins can delete resource files"
on storage.objects for delete
to authenticated
using (bucket_id = 'resource-files' and public.has_role('admin', auth.uid()));

-- ---------------------------------------------------------------------------
-- First admin
-- Create the user under Authentication > Users, then replace the UUID below.
-- ---------------------------------------------------------------------------
-- insert into public.user_roles (user_id, role)
-- values ('00000000-0000-0000-0000-000000000000', 'admin')
-- on conflict (user_id, role) do nothing;
