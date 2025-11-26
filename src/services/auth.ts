import { supabase } from "./supabaseClient";

export async function loginWithEmail(email: string, password: string) {
  return await supabase.auth.signInWithPassword({ email, password });
}

export async function getCurrentProfile() {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data } = await supabase
    .from("profiles")
    .select("username, role")
    .eq("id", user.id)
    .single();

  return data;
}

export async function logout() {
  await supabase.auth.signOut();
}
