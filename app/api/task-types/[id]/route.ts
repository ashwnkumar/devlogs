import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

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

    // Only allow updating the name field
    const { name } = body;

    if (!name || !name.trim()) {
      return NextResponse.json(
        { error: "Task type name is required" },
        { status: 400 },
      );
    }

    // First check if the task type exists and user owns it
    const { data: existingTaskType, error: fetchError } = await supabase
      .from("task_types")
      .select("*")
      .eq("id", id)
      .single();

    if (fetchError) {
      if (fetchError.code === "PGRST116") {
        return NextResponse.json(
          { error: "Task type not found" },
          { status: 404 },
        );
      }
      return NextResponse.json(
        { error: `Failed to fetch task type: ${fetchError.message}` },
        { status: 500 },
      );
    }

    // Authorization check
    if (existingTaskType.user_id !== user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Update only the name field
    const { data, error } = await supabase
      .from("task_types")
      .update({ name: name.trim() })
      .eq("id", id)
      .select()
      .single();

    if (error) {
      return NextResponse.json(
        { error: `Failed to update task type: ${error.message}` },
        { status: 500 },
      );
    }

    return NextResponse.json({
      success: true,
      data,
      message: "Task type updated successfully",
    });
  } catch (error) {
    console.error("Error updating task type:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
