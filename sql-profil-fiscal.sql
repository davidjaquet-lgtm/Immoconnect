-- IMMOCONNECT — Profil fiscal acheteur (TMI + régime) pour rendement net après impôt & matching
alter table public.projets_acheteurs add column if not exists tmi integer;
alter table public.projets_acheteurs add column if not exists regime_fiscal text;
