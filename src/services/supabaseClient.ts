// src/services/supabaseClient.ts
import { createClient } from '@supabase/supabase-js';
import { MediaItem } from '../types';

// Environment vars (Netlify injects them at build)
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL!;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY!;

// Initialize Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    flowType: "pkce",          // ← Required for modern Supabase auth
    detectSessionInUrl: true,  // ← Needed for PKCE redirect login
    storage: window.localStorage, // ← Fixes refresh logout in PWAs
  },
});

// --- Database Operations ---

export async function fetchPosts(): Promise<MediaItem[] | null> {
  const { data, error } = await supabase
    .from("posts")
    .select("*")
    .order("timestamp", { ascending: false });

  if (error) {
    console.error("Supabase fetchPosts:", error.message);
    return null;
  }

  return data as MediaItem[];
}

export async function createPost(item: MediaItem): Promise<void> {
  const { error } = await supabase.from("posts").insert([item]);
  if (error) throw error;
}

export async function deletePost(id: string): Promise<void> {
  const { error } = await supabase.from("posts").delete().eq("id", id);
  if (error) throw error;
}

// --- Storage Upload ---

export async function uploadFileToStorage(file: File): Promise<string> {
  const ext = file.name.split(".").pop();
  const name = `${crypto.randomUUID()}.${ext}`;

  const { error } = await supabase.storage
    .from("lumina-media")
    .upload(name, file);

  if (error) throw error;

  return supabase.storage.from("lumina-media").getPublicUrl(name).data.publicUrl;
}

// --- About Section ---

export async function saveSettings(html: string) {
  await supabase.from("app_settings").upsert({ key: "about_html", value: html });
}

export async function fetchSettings(): Promise<string | null> {
  const { data } = await supabase
    .from("app_settings")
    .select("value")
    .eq("key", "about_html")
    .single();

  return data?.value ?? null;
}
