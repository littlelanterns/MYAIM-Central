import { createClient } from '@supabase/supabase-js';

// IMPORTANT: Make sure your .env.local file is created and has these variables
const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseKey = process.env.REACT_APP_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseKey);