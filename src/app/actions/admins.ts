"use server";

import { createClient } from "@supabase/supabase-js";
import { revalidatePath } from "next/cache";

// Initialize Admin Client
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  },
);

// Helper to check if target is admin
async function isTargetAdmin(userId: string): Promise<boolean> {
  const { data } = await supabaseAdmin
    .from("profiles")
    .select("role")
    .eq("id", userId)
    .single();
  return data?.role === "admin";
}

export async function fetchAllUsers() {
  const { data: { users }, error: authError } = await supabaseAdmin.auth.admin.listUsers();
  if (authError) throw new Error(authError.message);

  const { data: profiles, error: profileError } = await supabaseAdmin.from("profiles").select("*");
  if (profileError) throw new Error(profileError.message);

  const mergedUsers = users.map((u: any) => {
    const profile = profiles?.find((p) => p.id === u.id);
    return {
      id: u.id,
      email: u.email,
      last_sign_in: u.last_sign_in_at,
      created_at: u.created_at,
      first_name: profile?.first_name || "",
      last_name: profile?.last_name || "",
      role: profile?.role || "user",
      is_banned: u.banned_until !== undefined && u.banned_until !== null, 
    };
  });

  return mergedUsers;
}

export async function deleteUser(userId: string) {
  // SECURITY CHECK: Cannot delete an admin
  if (await isTargetAdmin(userId)) {
    throw new Error("OPERATION DENIED: You cannot delete another Administrator.");
  }

  const { error } = await supabaseAdmin.auth.admin.deleteUser(userId);
  if (error) throw new Error(error.message);
  revalidatePath("/admin/users");
}

export async function banUser(userId: string, shouldBan: boolean) {
  // SECURITY CHECK: Cannot ban an admin
  if (await isTargetAdmin(userId)) {
    throw new Error("OPERATION DENIED: You cannot ban another Administrator.");
  }

  const banDuration = shouldBan ? "876000h" : "0s";
  const { error } = await supabaseAdmin.auth.admin.updateUserById(userId, {
    ban_duration: banDuration,
  });

  if (error) throw new Error(error.message);
  revalidatePath("/admin/users");
}

// Update User Details (Role, Name, etc.)
export async function updateUser(userId: string, data: { first_name: string; last_name: string; role: "admin" | "user" }) {
  // Note: We allow changing role, but usually you'd want extra checks here too.
  const { error } = await supabaseAdmin
    .from("profiles")
    .update({ 
      first_name: data.first_name,
      last_name: data.last_name,
      role: data.role 
    })
    .eq("id", userId);

  if (error) throw new Error(error.message);
  revalidatePath("/admin/users");
}