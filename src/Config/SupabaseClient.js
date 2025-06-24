
// src/Config/SupabaseClient.js
// Configuration for the Supabase client

import { createClient } from '@supabase/supabase-js';

// Retrieve Supabase URL and Key from environment variables
// Ensure these are set in your .env file (e.g., VITE_SUPABASE_URL, VITE_SUPABASE_KEY)
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error(
    'Supabase URL and Key must be defined in environment variables'
  );
}

const supabase = createClient(supabaseUrl, supabaseKey)

export default supabase
