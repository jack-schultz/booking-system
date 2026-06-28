import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

const hasCustomConfig =
    import.meta.env.VITE_SUPABASE_URL && import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!hasCustomConfig) {
    console.warn(
        'Using default Supabase project config. Copy .env.example to .env to override.'
    );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
