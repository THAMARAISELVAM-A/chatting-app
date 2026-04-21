/**
 * Safe environment variable access for browser
 * Uses Vite's import.meta.env or falls back to window.ENV for SSR compatibility
 */
export const browserEnv = {
  VITE_SUPABASE_URL: import.meta?.env?.VITE_SUPABASE_URL || '',
  VITE_SUPABASE_PROJECT_ID: import.meta?.env?.VITE_SUPABASE_PROJECT_ID || '',
  VITE_SUPABASE_PUBLISHABLE_KEY: import.meta?.env?.VITE_SUPABASE_PUBLISHABLE_KEY || '',
};
