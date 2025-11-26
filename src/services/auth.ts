import { supabase } from "./supabaseClient";

export async function loginWithEmail(email: string, password: string) {
  return await supabase.auth.signInWithPassword({ email, password });
}

export async function getCurrentProfile() {
  // Get session user
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError) {
    console.error("getUser error:", userError);
    return null;
  }

  if (!user) {
    console.warn("No active user session");
    return null;
  }

  // Try loading an existing profile
  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("username, role")
    .eq("id", user.id)
    .maybeSingle();  // ← prevents throwing when no row exists

  if (profileError) {
    console.error("Profile query error:", profileError);
  }

  if (profile) {
    return profile;
  }

  // Create fallback profile if none exists
  const newProfile = {
    id: user.id,
    username: (user.email ?? "user").split("@")[0],
    role: "GUEST",
  };

  const { error: insertError } = await supabase
    .from("profiles")
    .insert(newProfile);

  if (insertError) {
    console.error("Profile insert error:", insertError);
  }

  return newProfile;
}

export async function logout() {
  await supabase.auth.signOut();
}
