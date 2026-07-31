import { supabase } from './supabaseClient.js';
import { wireDemoModeButton } from './auth/demoMode.js';

wireDemoModeButton(supabase);
