import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { project, task_type, title, start_time, end_time, is_overtime } =
      await req.json();

    if (
      !project ||
      !task_type ||
      !title ||
      !start_time ||
      typeof is_overtime !== "boolean"
    )
      return NextResponse.json(
        { error: "Missing Required Fields" },
        { status: 400 }
      );

    const is_running = end_time === null;

    const { data, error } = await supabase
      .from("tasks")
      .insert({
        user_id: user.id,
        project_id: project,
        task_type,
        title,
        start_time,
        end_time,
        is_running,
        is_overtime,
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json(
        { error: `Failed to add task: ${error.message}` },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error("Error Adding Log:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
