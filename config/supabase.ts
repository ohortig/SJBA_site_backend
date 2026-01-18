import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { logger } from '../logger.js';

let supabase: SupabaseClient | null = null;

export const initializeSupabase = (): SupabaseClient => {
  if (!process.env.SUPABASE_URL) {
    const error = new Error('SUPABASE_URL is required but not provided');
    logger.error({
      message: 'Missing Supabase configuration',
      error: error.message
    });
    throw error;
  }

  if (!process.env.SUPABASE_ANON_KEY) {
    const error = new Error('SUPABASE_ANON_KEY is required but not provided');
    logger.error({
      message: 'Missing Supabase configuration',
      error: error.message
    });
    throw error;
  }

  try {
    supabase = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_ANON_KEY,
      {
        auth: {
          persistSession: false // Server-side doesn't need session persistence
        },
        global: {
          fetch: (input: string | URL | Request, init?: RequestInit): Promise<Response> => {
            // Add timeout for serverless environments
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout for serverless

            return fetch(input, {
              ...init,
              signal: controller.signal
            }).finally(() => clearTimeout(timeoutId));
          }
        }
      }
    );

    logger.info({
      message: 'Supabase client initialized successfully',
      url: process.env.SUPABASE_URL ? `${process.env.SUPABASE_URL.substring(0, 20)}...` : 'undefined'
    });
    return supabase;
  } catch (error) {
    const err = error as Error;
    logger.error({
      message: 'Failed to initialize Supabase client',
      error: err.message
    });
    throw error;
  }
};

export const getSupabase = (): SupabaseClient => {
  if (!supabase) {
    return initializeSupabase();
  }
  return supabase;
};

// Test the connection
export const testConnection = async (): Promise<boolean> => {
  try {
    const client = getSupabase();

    const { error } = await client
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
    const err = error as Error & { name: string };
    // Check if it's a network/timeout error vs configuration error
    if (err.name === 'AbortError' || err.message.includes('fetch failed') || err.message.includes('timeout')) {
      logger.warn({
        message: 'Supabase connection test failed due to network/timeout',
        error: err.message,
        errorType: err.name
      });
    } else {
      logger.error({
        message: 'Supabase connection test failed',
        error: err.message,
        errorType: err.name
      });
    }
    throw error;
  }
};
