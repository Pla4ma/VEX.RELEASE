ALTER TABLE public.wallets
DROP CONSTRAINT IF EXISTS wallets_user_id_fkey;

ALTER TABLE public.wallets
ADD CONSTRAINT wallets_user_id_fkey
FOREIGN KEY (user_id)
REFERENCES auth.users(id)
ON DELETE CASCADE;
