import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";
import ExcelJS from "exceljs";

export async function POST(req: NextRequest) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user)
    return NextResponse.json({ error: "Unauthorised" }, { status: 401 });

  const formData = await req.formData();
  const projectsData = formData.get("projects") as string;
  const projectNames = JSON.parse(projectsData) as string[];
  const company_id = formData.get("company_id") as string | null;

  if (!company_id || projectNames?.length === 0)
    return NextResponse.json(
      { error: "Missing Required Fields" },
      { status: 500 }
    );

  try {
    const inserts = projectNames?.map((name) => ({
      name,
      user_id: user.id,
      company_id: company_id!,
    }));

    const { data, error: bulkErr } = await supabase
      .from("projects")
      .insert(inserts)
      .select();

    if (bulkErr) throw bulkErr;

    return NextResponse.json({ success: true, data, count: data.length });
  } catch (error) {
    console.error("Error parsing excel sheet", error);
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 500 }
    );
  }
}
