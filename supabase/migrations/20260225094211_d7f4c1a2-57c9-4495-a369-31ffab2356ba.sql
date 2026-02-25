
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS banner_url TEXT;

UPDATE public.profiles 
SET avatar_url = '/images/BV_Avatar.png',
    banner_url = '/images/Bhavesh_Banner.png'
WHERE id = 'c2c780fe-0a51-4102-a757-3847f9c5ad26';
