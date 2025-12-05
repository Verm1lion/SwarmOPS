import { supabase } from '../lib/supabaseClient';

const CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
const CODE_LENGTH = 6;

export async function generateJoinCode(): Promise<string> {
  let attempts = 0;
  const maxAttempts = 10;

  while (attempts < maxAttempts) {
    const code = Array.from({ length: CODE_LENGTH }, () => {
      return CHARS.charAt(Math.floor(Math.random() * CHARS.length));
    }).join('');

    // Check if code already exists
    const { error } = await supabase
      .from('projects')
      .select('id')
      .eq('join_code', code)
      .single();

    if (error && error.code === 'PGRST116') {
      // No row found - code is unique
      return code;
    }

    if (error && error.code !== 'PGRST116') {
      // Other error - throw it
      throw error;
    }

    // Code exists, try again
    attempts++;
  }

  throw new Error('Failed to generate unique join code after multiple attempts');
}

