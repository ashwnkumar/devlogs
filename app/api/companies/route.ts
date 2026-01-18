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
    const { searchParams } = new URL(request.url);
    const fetchAll = searchParams.get("all") === "true";

    let query = supabase
      .from("companies")
      .select("*")
      .order("created_at", { ascending: false });

    if (!fetchAll) {
      query = query.eq("user_id", user.id);
    }

    const { data, error } = await query;

    if (error) {
      return NextResponse.json(
        { error: `Failed to fetch companies: ${error.message}` },
        { status: 500 },
      );
    }

    return NextResponse.json({ data: data || [] });
  } catch (error) {
    console.error("Error fetching companies:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();

    // Sanitize timestamp fields - convert empty strings to null
    const sanitizedBody = { ...body };
    const timestampFields = ["joined_at", "left_at"];
    timestampFields.forEach((field) => {
      if (sanitizedBody[field] === "") {
        sanitizedBody[field] = null;
      }
    });

    // Add user_id to the data
    const companyData = {
      ...sanitizedBody,
      user_id: user.id,
    };

    const { data, error } = await supabase
      .from("companies")
      .insert(companyData)
      .select()
      .single();

    if (error) {
      return NextResponse.json(
        { error: `Failed to create company: ${error.message}` },
        { status: 500 },
      );
    }

    return NextResponse.json({
      success: true,
      data,
      message: "Company created successfully",
    });
  } catch (error) {
    console.error("Error creating company:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
