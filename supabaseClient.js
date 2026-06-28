import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';

const DEFAULT_SUPABASE_URL = 'https://qknvowhqqsdtyogkgbsb.supabase.co';
const DEFAULT_SUPABASE_ANON_KEY = 'sb_publishable_EfcdZ0SGBth4VNdPzBorpA_jVybXP1I';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL ?? DEFAULT_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY ?? DEFAULT_SUPABASE_ANON_KEY;

if (!import.meta.env.VITE_SUPABASE_URL || !import.meta.env.VITE_SUPABASE_ANON_KEY) {
    console.warn(
        'Using default Supabase project config. Copy .env.example to .env to override.'
    );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
