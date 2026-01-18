import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { data, error } = await supabase
      .from("users")
      .select("*")
      .eq("id", user.id)
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        return NextResponse.json({ error: "User not found" }, { status: 404 });
      }
      return NextResponse.json(
        { error: `Failed to fetch user profile: ${error.message}` },
        { status: 500 },
      );
    }

    return NextResponse.json({ data });
  } catch (error) {
    console.error("Error fetching user profile:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  const supabase = await createClient();

  try {
    // Parse and validate request body
    let body;
    try {
      body = await request.json();
    } catch (error) {
      return NextResponse.json(
        { error: "Invalid request body" },
        { status: 400 },
      );
    }

    const { user_id, name } = body;

    // Validate required fields
    if (!user_id) {
      return NextResponse.json(
        { error: "user_id and name are required" },
        { status: 400 },
      );
    }

    // Validate name is not empty or whitespace-only
    if (!name || typeof name !== "string" || name.trim().length === 0) {
      return NextResponse.json(
        { error: "name must be a non-empty string" },
        { status: 400 },
      );
    }

    // Check if user record already exists
    const { data: existingUser, error: fetchError } = await supabase
      .from("users")
      .select("id")
      .eq("id", user_id)
      .single();

    if (fetchError && fetchError.code !== "PGRST116") {
      // PGRST116 is "not found" error, which is expected for new users
      return NextResponse.json(
        { error: `Failed to check user existence: ${fetchError.message}` },
        { status: 500 },
      );
    }

    if (existingUser) {
      // User exists, update the name
      const { data, error } = await supabase
        .from("users")
        .update({ name })
        .eq("id", user_id)
        .select()
        .single();

      if (error) {
        return NextResponse.json(
          { error: `Failed to update user name: ${error.message}` },
          { status: 500 },
        );
      }

      return NextResponse.json({
        data,
        message: "User name updated successfully",
      });
    } else {
      // User doesn't exist, create new record
      const { data, error } = await supabase
        .from("users")
        .insert({ id: user_id, name })
        .select()
        .single();

      if (error) {
        return NextResponse.json(
          { error: `Failed to create user profile: ${error.message}` },
          { status: 500 },
        );
      }

      return NextResponse.json({
        data,
        message: "User profile created successfully",
      });
    }
  } catch (error) {
    console.error("Error storing user profile:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

export async function PUT(request: NextRequest) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // Parse and validate request body
    let updates;
    try {
      updates = await request.json();
    } catch (error) {
      return NextResponse.json(
        { error: "Invalid request body" },
        { status: 400 },
      );
    }

    // Validate that protected fields are not in updates
    const protectedFields = ["id", "created_at"];
    const hasProtectedFields = protectedFields.some(
      (field) => field in updates,
    );

    if (hasProtectedFields) {
      return NextResponse.json(
        { error: "Cannot update protected fields" },
        { status: 400 },
      );
    }

    // Sanitize timestamp fields - convert empty strings to null
    const sanitizedUpdates = { ...updates };
    const timestampFields = ["last_active", "updated_at"];
    timestampFields.forEach((field) => {
      if (sanitizedUpdates[field] === "") {
        sanitizedUpdates[field] = null;
      }
    });

    // Execute update query filtered by authenticated user's ID
    const { data, error } = await supabase
      .from("users")
      .update(sanitizedUpdates)
      .eq("id", user.id)
      .select()
      .single();

    if (error) {
      return NextResponse.json(
        { error: `Failed to update profile: ${error.message}` },
        { status: 500 },
      );
    }

    return NextResponse.json({
      data,
      message: "Profile updated successfully",
    });
  } catch (error) {
    console.error("Error updating user profile:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
