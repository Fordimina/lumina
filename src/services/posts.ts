import { supabase } from "./supabaseClient";
import { MediaItem } from "../types";

export async function updatePost(
  id: string,
  fields: Partial<MediaItem>
) {
  const { error } = await supabase
    .from("posts")
    .update(fields)
    .eq("id", id);

  if (error) throw error;
}
