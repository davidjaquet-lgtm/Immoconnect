-- Sécurisation des exclusivités : traçabilité + idempotence du paiement Stripe
alter table exclusivites_contact
  add column if not exists stripe_session_id text;
create unique index if not exists idx_exclu_stripe_session
  on exclusivites_contact (stripe_session_id) where stripe_session_id is not null;
