import { createClient } from '@supabase/supabase-js';

// Get Supabase credentials from environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

// Validate that environment variables are set
if (!supabaseUrl || !supabaseAnonKey) {
  console.error(
    '⚠️ Missing Supabase environment variables!\n' +
    'Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your environment variables.\n' +
    'For local development, create a .env.local file.\n' +
    'For production (Netlify), set these in your site settings under Environment Variables.'
  );
  
  // Don't throw - allow app to load but Supabase operations will fail gracefully
  // This prevents white screen of death in production
}

// Create Supabase client (will work even with empty strings, but operations will fail)
// This allows the app to load and show error messages to users
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

