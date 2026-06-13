-- Offre de lancement agents : 50 premiers = Pro offert 3 mois ; email VIP = Premium à vie
alter table agents_validation
  add column if not exists offre_lancement_rang  integer,
  add column if not exists offre_lancement_type  text,      -- 'lancement_pro_3mois' | 'vip_premium_avie' | 'lancement_expire'
  add column if not exists forfait_expire_le      timestamptz,
  add column if not exists rappel_forfait_envoye  boolean default false;

-- Unicité du rang (1..50) pour éviter deux agents au même rang en cas de course
create unique index if not exists uniq_offre_lancement_rang
  on agents_validation (offre_lancement_rang)
  where offre_lancement_rang is not null;
