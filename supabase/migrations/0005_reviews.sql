-- ============================================================================
-- Breteame · Migración 0005
-- Reseñas de clientes: tabla reviews + trigger que recalcula el rating.
-- ============================================================================

create table if not exists public.reviews (
  id               uuid primary key default gen_random_uuid(),
  professional_id  uuid not null references public.professionals(id) on delete cascade,
  client_id        uuid references auth.users(id) on delete set null, -- null en reseñas seed/históricas
  reviewer_name    text not null,  -- denormalizado (igual que contacts.client_name)
  rating           int  not null check (rating between 1 and 5),
  comment          text,
  created_at       timestamptz not null default now()
);

create index if not exists reviews_professional_id_idx on public.reviews (professional_id);

-- Un cliente solo puede dejar una reseña por profesional; los nulls del seed no cuentan.
create unique index if not exists reviews_one_per_client
  on public.reviews (professional_id, client_id)
  where client_id is not null;

-- ============================================================================
-- Trigger: recalcula professionals.rating después de cada insert o delete
-- en reviews. El update no se considera (reseñas son inmutables en este MVP).
-- ============================================================================
create or replace function public.recalcular_rating_profesional()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  pro_id       uuid;
  nuevo_rating numeric;
begin
  pro_id := coalesce(new.professional_id, old.professional_id);

  select round(avg(rating)::numeric, 1)
    into nuevo_rating
    from public.reviews
   where professional_id = pro_id;

  update public.professionals
     set rating = coalesce(nuevo_rating, 0)
   where id = pro_id;

  return null;
end;
$$;

drop trigger if exists reviews_actualizar_rating on public.reviews;
create trigger reviews_actualizar_rating
  after insert or delete on public.reviews
  for each row execute function public.recalcular_rating_profesional();

-- ============================================================================
-- Row Level Security
-- ============================================================================
alter table public.reviews enable row level security;

-- Todos pueden leer las reseñas (anon + authenticated).
create policy "reviews_select_public" on public.reviews
  for select using (true);

-- Solo clientes autenticados que hayan contactado al profesional pueden reseñar.
create policy "reviews_insert_cliente" on public.reviews
  for insert with check (
    client_id = auth.uid()
    and exists (
      select 1 from public.contacts c
       where c.client_id       = auth.uid()
         and c.professional_id = professional_id
    )
  );

-- ============================================================================
-- Grants
-- ============================================================================
grant select on public.reviews to anon, authenticated;
grant insert on public.reviews to authenticated;
