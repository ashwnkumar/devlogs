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

    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "10", 10);

    const companyId = searchParams.get("f"); // project filter
    const searchQuery = searchParams.get("q"); // text search

    const offset = (page - 1) * limit;

    let query = supabase
      .from("tasks")
      .select("*", { count: "exact" })
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    // Filter by project/company
    if (companyId) {
      query = query.eq("project_id", companyId);
    }

    // 🔍 Text search
    if (searchQuery && searchQuery.trim().length > 0) {
      const q = `%${searchQuery.trim()}%`;

      query = query.or(`title.ilike.${q}`);
    }

    // Pagination (must come last)
    query = query.range(offset, offset + limit - 1);

    const { data, error, count } = await query;

    if (error) {
      return NextResponse.json(
        { error: `Failed to fetch tasks: ${error.message}` },
        { status: 500 }
      );
    }

    const totalPages = Math.ceil((count || 0) / limit);

    return NextResponse.json({
      data: data ?? [],
      pagination: {
        page,
        limit,
        totalItems: count ?? 0,
        totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      },
    });
  } catch (error) {
    console.error("Error fetching tasks:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
