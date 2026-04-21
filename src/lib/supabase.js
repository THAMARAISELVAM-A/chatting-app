import { createClient } from '@supabase/supabase-js';
import { browserEnv } from '@/utils/env';

const supabaseUrl = browserEnv.VITE_SUPABASE_URL;
const supabaseKey = browserEnv.VITE_SUPABASE_PUBLISHABLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing Supabase environment variables. Please check your .env file.');
}

export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    persistSession: false, // Anonymous sessions, no persistence
    autoRefreshToken: false,
  },
  realtime: {
    params: {
      eventsPerSecond: 10,
    },
  },
});

export default supabase;
