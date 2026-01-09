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
  const file = formData.get("file") as File | null;
  const column_name = formData.get("column_name") as string | null;
  const company_id = formData.get("company_id") as string | null;

  if (!file || !column_name || !company_id) {
    return NextResponse.json(
      { error: "Missing Required Fields" },
      { status: 400 }
    );
  }

  try {
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.load(await file.arrayBuffer());
    const sheet = workbook.getWorksheet(1);
    if (!sheet) throw new Error("No Worksheet Found");

    const headerRow = sheet.getRow(1);
    const headers = headerRow.values as string[];

    const colIdx = headers.findIndex(
      (h) =>
        h?.toString().trim().toLowerCase() === column_name.trim().toLowerCase()
    );

    if (colIdx === -1) {
      throw new Error(`Column ${column_name} not Found!`);
    }

    const projectNames = new Set<string>();

    sheet.eachRow({ includeEmpty: true }, (row, rowNumber) => {
      if (rowNumber === 1) return;
      const cellValue = row.getCell(colIdx).text?.trim();
      if (cellValue) projectNames.add(cellValue);
    });

    if (projectNames.size === 0)
      throw new Error("No Valid Project Names Found!");

    const inserts = Array.from(projectNames).map((name) => ({
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
