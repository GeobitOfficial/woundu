-- Instrucciones de cobro por método (en lugar de un solo bloque en el perfil).

alter table public.seller_payout_methods
  add column if not exists instructions text
  check (instructions is null or char_length(instructions) <= 1000);

update public.seller_payout_methods spm
set instructions = spp.payment_instructions
from public.seller_payout_profiles spp
where spm.user_id = spp.user_id
  and spm.is_primary = true
  and spp.payment_instructions is not null
  and nullif(trim(spp.payment_instructions), '') is not null
  and (spm.instructions is null or nullif(trim(spm.instructions), '') is null);

update public.seller_payout_profiles
set payment_instructions = null
where payment_instructions is not null;
