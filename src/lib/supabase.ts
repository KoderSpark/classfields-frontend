import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export interface Provider {
  id: string;
  business_name: string;
  contact_number: string;
  email: string;
  category: string;
  subcategory: string;
  city: string;
  subcity: string;
  description: string;
  profile_image_url?: string;
  created_at: string;
}

export interface Category {
  id: string;
  name: string;
  subcategories: string[];
  created_at: string;
}
