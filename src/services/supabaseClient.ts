import { createClient } from '@supabase/supabase-js';
import { MediaItem } from '../types';
import { createClient } from "@supabase/supabase-js";

// Check for environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_KEY;

// Validate configuration to ensure we don't try to connect with invalid/missing keys
const isSupabaseConfigured = 
  supabaseUrl && 
  supabaseKey && 
  !supabaseUrl.includes('your-project') && 
  !supabaseKey.includes('your-anon-key');

export const supabase = isSupabaseConfigured 
  ? createClient(supabaseUrl, supabaseKey)
  : null;

// --- Database Functions ---

export const fetchPosts = async (): Promise<MediaItem[] | null> => {
  if (!supabase) {
    console.warn("Supabase is not configured. Using local demo data.");
    return null;
  }

  const { data, error } = await supabase
    .from('posts')
    .select('*')
    .order('timestamp', { ascending: false });

  if (error) {
    // Improve error logging to show the actual message instead of [object Object]
    console.error('Error fetching posts:', error.message || JSON.stringify(error));
    return null;
  }
  return data as MediaItem[];
};

export const createPost = async (item: MediaItem): Promise<void> => {
  if (!supabase) throw new Error("Storage is not configured. Check Supabase settings.");

  const { error } = await supabase
    .from('posts')
    .insert([item]);

  if (error) throw error;
};

export const deletePost = async (id: string): Promise<void> => {
  if (!supabase) throw new Error("Storage is not configured. Check Supabase settings.");

  const { error } = await supabase
    .from('posts')
    .delete()
    .eq('id', id);

  if (error) throw error;
};

// --- Storage Functions ---

export const uploadFileToStorage = async (file: File): Promise<string> => {
  if (!supabase) throw new Error("Storage is not configured. Check Supabase settings.");

  const fileExt = file.name.split('.').pop();
  const fileName = `${Math.random().toString(36).substring(2)}_${Date.now()}.${fileExt}`;
  const filePath = `${fileName}`;

  const { error: uploadError } = await supabase.storage
    .from('lumina-media')
    .upload(filePath, file);

  if (uploadError) throw uploadError;

  const { data } = supabase.storage
    .from('lumina-media')
    .getPublicUrl(filePath);

  return data.publicUrl;
};

// --- Settings (About Section) ---

export const saveSettings = async (htmlContent: string): Promise<void> => {
  if (!supabase) {
    console.warn("Supabase not configured. Settings saved locally only.");
    return;
  }
  
  const { error } = await supabase
    .from('app_settings')
    .upsert({ key: 'about_html', value: htmlContent });

  if (error) throw error;
};

export const fetchSettings = async (): Promise<string | null> => {
  if (!supabase) return null;

  const { data, error } = await supabase
    .from('app_settings')
    .select('value')
    .eq('key', 'about_html')
    .single();

  if (error) {
    // It is normal for settings to be missing initially, so we don't error hard here
    return null;
  }
  return data.value;
};

//for Auth

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL!;
const supabaseAnon = import.meta.env.VITE_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnon, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
});
