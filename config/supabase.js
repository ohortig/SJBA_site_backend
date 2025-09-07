import { createClient } from '@supabase/supabase-js';
import { logger } from '../logger.js';

let supabase = null;

export const initializeSupabase = () => {
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
          fetch: (...args) => {
            // Add timeout for serverless environments
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout for serverless
            
            return fetch(args[0], {
              ...args[1],
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
    // Check if it's a network/timeout error vs configuration error
    if (error.name === 'AbortError' || error.message.includes('fetch failed') || error.message.includes('timeout')) {
      logger.warn({
        message: 'Supabase connection test failed due to network/timeout',
        error: error.message,
        errorType: error.name
      });
    } else {
      logger.error({
        message: 'Supabase connection test failed',
        error: error.message,
        errorType: error.name
      });
    }
    throw error;
  }
};
