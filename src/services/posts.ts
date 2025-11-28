import { supabase } from "./supabaseClient";

export async function updatePost(id, fields) {
  const { error } = await supabase
    .from("posts")
    .update(fields)
    .eq("id", id);

  if (error) throw error;
}
