import { createClient } from '@supabase/supabase-js';

// Hardcoded Supabase credentials for Electron app
// These are public anon keys, safe to include in the client
const SUPABASE_URL = 'https://nmvsqkhgmywekkqygauc.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5tdnNxa2hnbXl3ZWtrcXlnYXVjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ5NTEwOTYsImV4cCI6MjA4MDUyNzA5Nn0.wIrY9qMq2WBUZot5aWKtXhDR6dAkMJ1aXYXnFop4GXQ';

// Use environment variables if available (for web dev), otherwise use hardcoded values
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'Missing Supabase environment variables. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your .env file.'
  );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export function isSupabaseConfigured(): boolean {
  // Always return true since we have hardcoded fallback values
  return true;
}

