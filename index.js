import { supabase } from './supabaseClient.js';
import { wireDemoModeButton } from './auth/demoMode.js';
import { wireLandingThemeToggles } from './ui/landingTheme.js';

wireLandingThemeToggles();
wireDemoModeButton(supabase);
