import { supabase } from "./supabaseClient";

export async function loginWithEmail(email: string, password: string) {
  return await supabase.auth.signInWithPassword({ email, password });
}

export async function getCurrentProfile() {
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) return null;

  // Try to load existing profile
  const { data: profile } = await supabase
    .from("profiles")
    .select("username, role")
    .eq("id", user.id)
    .single();

  if (profile) {
    return profile;
  }

  // If missing, create a default profile
  const defaultProfile = {
    id: user.id,
    username: user.email.split("@")[0],
    role: "GUEST",
  };

  await supabase.from("profiles").insert(defaultProfile);

  return defaultProfile;
}

export async function logout() {
  await supabase.auth.signOut();
}
