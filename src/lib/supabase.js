import { createClient } from '@supabase/supabase-js';

// IMPORTANT: Make sure your .env.local file is created and has these variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseKey);