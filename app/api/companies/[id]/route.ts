import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = await params;
    const { data, error } = await supabase
      .from("companies")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        return NextResponse.json(
          { error: "Company not found" },
          { status: 404 },
        );
      }
      return NextResponse.json(
        { error: `Failed to fetch company: ${error.message}` },
        { status: 500 },
      );
    }

    // Authorization check - ensure user owns this company
    if (data.user_id !== user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    return NextResponse.json({ data });
  } catch (error) {
    console.error("Error fetching company:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = await params;
    const body = await request.json();

    // First check if the company exists and user owns it
    const { data: existingCompany, error: fetchError } = await supabase
      .from("companies")
      .select("*")
      .eq("id", id)
      .single();

    if (fetchError) {
      if (fetchError.code === "PGRST116") {
        return NextResponse.json(
          { error: "Company not found" },
          { status: 404 },
        );
      }
      return NextResponse.json(
        { error: `Failed to fetch company: ${fetchError.message}` },
        { status: 500 },
      );
    }

    // Authorization check
    if (existingCompany.user_id !== user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Sanitize timestamp fields - convert empty strings to null
    const sanitizedBody = { ...body };
    const timestampFields = [
      "joined_at",
      "left_at",
      "created_at",
      "updated_at",
    ];
    timestampFields.forEach((field) => {
      if (sanitizedBody[field] === "") {
        sanitizedBody[field] = null;
      }
    });

    // Update the company
    const { data, error } = await supabase
      .from("companies")
      .update(sanitizedBody)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      return NextResponse.json(
        { error: `Failed to update company: ${error.message}` },
        { status: 500 },
      );
    }

    return NextResponse.json({
      success: true,
      data,
      message: "Company updated successfully",
    });
  } catch (error) {
    console.error("Error updating company:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = await params;

    // First check if the company exists and user owns it
    const { data: existingCompany, error: fetchError } = await supabase
      .from("companies")
      .select("*")
      .eq("id", id)
      .single();

    if (fetchError) {
      if (fetchError.code === "PGRST116") {
        return NextResponse.json(
          { error: "Company not found" },
          { status: 404 },
        );
      }
      return NextResponse.json(
        { error: `Failed to fetch company: ${fetchError.message}` },
        { status: 500 },
      );
    }

    // Authorization check
    if (existingCompany.user_id !== user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Check if this is the user's current company
    const { data: userData, error: userFetchError } = await supabase
      .from("users")
      .select("current_company")
      .eq("id", user.id)
      .single();

    if (userFetchError) {
      return NextResponse.json(
        { error: `Failed to fetch user data: ${userFetchError.message}` },
        { status: 500 },
      );
    }

    // If deleting the current company, set current_company to null
    if (userData.current_company === id) {
      const { error: updateError } = await supabase
        .from("users")
        .update({ current_company: null })
        .eq("id", user.id);

      if (updateError) {
        return NextResponse.json(
          {
            error: `Failed to update user current company: ${updateError.message}`,
          },
          { status: 500 },
        );
      }
    }

    // Delete the company
    const { error } = await supabase.from("companies").delete().eq("id", id);

    if (error) {
      return NextResponse.json(
        { error: `Failed to delete company: ${error.message}` },
        { status: 500 },
      );
    }

    return NextResponse.json({
      success: true,
      message: "Company deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting company:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
