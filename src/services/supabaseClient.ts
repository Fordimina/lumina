import { createClient } from "@supabase/supabase-js";
import type { MediaItem } from "../types";

// ----------------------------------------------------
// 1. Environment Variables
// ----------------------------------------------------
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL!;
const supabaseAnon = import.meta.env.VITE_SUPABASE_ANON_KEY!;

// One single Supabase instance
export const supabase = createClient(supabaseUrl, supabaseAnon, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
});

// ----------------------------------------------------
// 2. Posts Table
// ----------------------------------------------------
export async function fetchPosts(): Promise<MediaItem[]> {
  const { data, error } = await supabase
    .from("posts")
    .select("*")
    .order("timestamp", { ascending: false });

  if (error) throw error;
  return data;
}

export async function createPost(item: MediaItem) {
  const { error } = await supabase.from("posts").insert(item);
  if (error) throw error;
}

export async function deletePost(id: string) {
  const { error } = await supabase.from("posts").delete().eq("id", id);
  if (error) throw error;
}

// ----------------------------------------------------
// 3. Storage (Bucket: lumina-media)
// ----------------------------------------------------
export async function uploadFileToStorage(file: File): Promise<string> {
  const ext = file.name.split(".").pop();
  const name = `${crypto.randomUUID()}.${ext}`;

  const { error } = await supabase.storage
    .from("lumina-media")
    .upload(name, file);

  if (error) throw error;

  return supabase.storage.from("lumina-media").getPublicUrl(name).data.publicUrl;
}

// ----------------------------------------------------
// 4. App Settings Table
// ----------------------------------------------------
export async function saveSettings(html: string) {
  const { error } = await supabase
    .from("app_settings")
    .upsert({ key: "about_html", value: html });

  if (error) throw error;
}

export async function fetchSettings(): Promise<string | null> {
  const { data, error } = await supabase
    .from("app_settings")
    .select("value")
    .eq("key", "about_html")
    .single();

  if (error) return null;

  return data?.value ?? null;
}
