"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function addCompany(formData: FormData) {
  const supabase = await createClient();

  // Get current user
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();
  if (userError || !user) {
    throw new Error("Unauthorized");
  }

  const name = formData.get("name") as string;
  const location = formData.get("location") as string;
  const joined_at = formData.get("joined_at") as string;
  const left_at = formData.get("left_at") as string | null;
  const is_current = formData.get("is_current") === "true";

  if (!name?.trim() || !location?.trim() || !joined_at) {
    throw new Error("Please fill all required fields");
  }

  const payload = {
    name: name.trim(),
    location: location.trim(),
    joined_at: joined_at,
    left_at: is_current ? null : left_at,
  };

  const { data: companyData, error: addErr } = await supabase
    .from("companies")
    .insert({
      ...payload,
      user_id: user.id,
    })
    .select()
    .single();

  if (addErr) {
    throw new Error(`Failed to add company: ${addErr.message}`);
  }

  if (is_current) {
    const { error } = await supabase
      .from("users")
      .update({ current_company: companyData.id })
      .eq("id", user.id)
      .select();

    if (error) {
      throw new Error(`Update error: ${error.message}`);
    }
  }

  revalidatePath("/companies");
  return { success: true, message: "Company added successfully" };
}

export async function updateCompany(formData: FormData) {
  const supabase = await createClient();

  // Get current user
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();
  if (userError || !user) {
    throw new Error("Unauthorized");
  }

  const id = formData.get("id") as string;
  const name = formData.get("name") as string;
  const location = formData.get("location") as string;
  const joined_at = formData.get("joined_at") as string;
  const left_at = formData.get("left_at") as string | null;
  const is_current = formData.get("is_current") === "true";

  if (!id || !name?.trim() || !location?.trim() || !joined_at) {
    throw new Error("Please fill all required fields");
  }

  const payload = {
    name: name.trim(),
    location: location.trim(),
    joined_at: joined_at,
    left_at: is_current ? null : left_at,
  };

  const { error } = await supabase
    .from("companies")
    .update(payload)
    .eq("id", id);

  if (error) {
    throw new Error(`Update failed: ${error.message}`);
  }

  if (is_current) {
    const { error } = await supabase
      .from("users")
      .update({ current_company: id })
      .eq("id", user.id)
      .select();

    if (error) {
      throw new Error(`Update error: ${error.message}`);
    }
  }

  revalidatePath("/companies");
  return { success: true, message: "Company updated successfully" };
}

export async function deleteCompany(formData: FormData) {
  const supabase = await createClient();

  // Get current user
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();
  if (userError || !user) {
    throw new Error("Unauthorized");
  }

  const id = formData.get("id") as string;

  if (!id) {
    throw new Error("Company ID is required");
  }

  const { error } = await supabase.from("companies").delete().eq("id", id);

  if (error) {
    throw new Error(`Delete failed: ${error.message}`);
  }

  revalidatePath("/companies");
  return { success: true, message: "Company deleted successfully" };
}
