import { createClient } from '@supabase/supabase-js';
import { logger } from '../logger.js';

let supabase = null;

export const initializeSupabase = () => {
  if (!process.env.SUPABASE_URL) {
    throw new Error('SUPABASE_URL is required but not provided');
  }
  
  if (!process.env.SUPABASE_ANON_KEY) {
    throw new Error('SUPABASE_ANON_KEY is required but not provided');
  }

  try {
    supabase = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_ANON_KEY,
      {
        auth: {
          persistSession: false // Server-side doesn't need session persistence
        }
      }
    );

    logger.info({
      message: 'Supabase client initialized successfully'
    });
    return supabase;
  } catch (error) {
    logger.error({
      message: 'Failed to initialize Supabase client',
      error: error.message
    });
    throw error;
  }
};

export const getSupabase = () => {
  if (!supabase) {
    return initializeSupabase();
  }
  return supabase;
};

// Test the connection
export const testConnection = async () => {
  try {
    const client = getSupabase();

    const { data, error } = await client
      .from('board_members')
      .select('*')
      .limit(1);
    
    if (error && !error.message.includes('relation "board_members" does not exist')) {
      throw error;
    }
    
    logger.info({
      message: 'Supabase connection test successful'
    });
    return true;
  } catch (error) {
    logger.error({
      message: 'Supabase connection test failed',
      error: error.message
    });
    throw error;
  }
};
