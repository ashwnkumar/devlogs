// app/actions/bulk-import.ts
"use server";

import * as XLSX from "xlsx";
import { SYSTEM_TASK_TYPES } from "@/types/user";

// Expected shape per row after processing
export type ExtractedWorkLog = {
  date: Date | null;
  projectName: string | null;
  taskType: string | null;
  task: string | null;
  startTime: Date | null;
  endTime: Date | null;
  rowNumber: number; // 1-based for user-friendly error display
  originalRow: Record<string, any>; // raw values if needed for debugging/preview
  isHolidayOrLeave?: boolean; // Flag to identify holiday/leave entries
};

// Result shape from the action
export type ExtractResult =
  | {
      success: true;
      data: ExtractedWorkLog[];
      meta: {
        totalRows: number;
        uniqueProjects: string[];
        uniqueTaskTypes: string[];
        foundColumns: Record<string, number>; // index of each column
      };
    }
  | {
      success: false;
      error: string;
    };

// Main extraction function
export async function extractExcelData(
  formData: FormData,
): Promise<ExtractResult> {
  try {
    const file = formData.get("file") as File | null;

    if (!file || file.size === 0) {
      return { success: false, error: "No file uploaded" };
    }

    if (
      !file.name.toLowerCase().endsWith(".xlsx") &&
      !file.name.toLowerCase().endsWith(".xls")
    ) {
      return {
        success: false,
        error: "Only .xlsx or .xls files are supported",
      };
    }

    // Read file buffer
    const buffer = Buffer.from(await file.arrayBuffer());

    // Parse workbook with cellDates enabled
    const workbook = XLSX.read(buffer, {
      type: "buffer",
      cellDates: false, // ← Critical: get formatted strings, not buggy Date objects
      cellText: true,
      dateNF: "dd/mm/yyyy", // Hint to Excel parser for formatting
      cellNF: false,
      sheetStubs: false,
    });

    if (workbook.SheetNames.length === 0) {
      return { success: false, error: "No sheets found in the file" };
    }

    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];

    // Convert to array of objects (first row = headers)
    const rawRows = XLSX.utils.sheet_to_json<Record<string, any>>(worksheet, {
      header: 1,
      defval: null,
      blankrows: false,
      raw: false, // ← Forces formatted strings (what user sees)
    });

    if (rawRows.length < 2) {
      return {
        success: false,
        error: "File has no data rows (only header or empty)",
      };
    }

    // Normalize headers: lowercase, trim, collapse spaces
    const headers = (rawRows[0] as string[]).map((h) =>
      String(h ?? "")
        .trim()
        .toLowerCase()
        .replace(/\s+/g, " "),
    );

    // Fuzzy column matching
    const colMap = {
      date: findColumn(headers, [
        "date",
        "work date",
        "log date",
        "day",
        "worked on",
      ]),
      projectName: findColumn(headers, [
        "project name",
        "project",
        "proj",
        "client",
        "repo",
      ]),
      taskType: findColumn(headers, [
        "task type",
        "type",
        "category",
        "tasktype",
        "kind",
        "classification",
      ]),
      task: findColumn(headers, ["description", "what", "notes", "activity"]),
      startTime: findColumn(headers, [
        "start time",
        "start",
        "from",
        "begin",
        "started",
      ]),
      endTime: findColumn(headers, [
        "end time",
        "end",
        "to",
        "until",
        "finished",
      ]),
    };

    const extracted: ExtractedWorkLog[] = [];

    for (let i = 1; i < rawRows.length; i++) {
      const row = rawRows[i] as any[];
      const entry: ExtractedWorkLog = {
        date: normalizeDate(row[colMap.date]),
        projectName: normalizeString(row[colMap.projectName]),
        taskType: normalizeString(row[colMap.taskType]),
        task: normalizeString(row[colMap.task]),
        startTime: normalizeTime(row[colMap.startTime]),
        endTime: normalizeTime(row[colMap.endTime]),
        rowNumber: i + 1,
        originalRow: rawRows[i],
      };

      // Skip completely useless rows (no date AND no task description)
      if (!entry.date && !entry.task) continue;

      extracted.push(entry);
    }

    if (extracted.length === 0) {
      return { success: false, error: "No valid rows found after processing" };
    }

    // Pre-compute uniques for mapping UI
    const uniqueProjects = Array.from(
      new Set(
        extracted.map((r) => r.projectName).filter((v): v is string => !!v),
      ),
    ).sort();

    const uniqueTaskTypes = Array.from(
      new Set(extracted.map((r) => r.taskType).filter((v): v is string => !!v)),
    ).sort();

    return {
      success: true,
      data: extracted,
      meta: {
        totalRows: extracted.length,
        uniqueProjects,
        uniqueTaskTypes,
        foundColumns: colMap,
      },
    };
  } catch (err: any) {
    console.error("[extractExcelData] Error:", err);
    return {
      success: false,
      error: err.message || "Failed to read or parse the Excel file",
    };
  }
}

// ── Helpers ─────────────────────────────────────────────────────────────

function findColumn(headers: string[], candidates: string[]): number {
  for (const cand of candidates) {
    const idx = headers.findIndex((h) => h.includes(cand.toLowerCase()));
    if (idx !== -1) return idx;
  }
  return -1;
}

function normalizeString(val: any): string | null {
  if (val == null) return null;
  const str = String(val).trim();
  return str.length > 0 ? str : null;
}

function normalizeDate(val: any): Date | null {
  if (val == null) return null;

  let str: string;
  if (typeof val === "string") {
    str = val.trim();
  } else if (val instanceof Date) {
    // Rare fallback if still a Date
    return val;
  } else {
    str = String(val).trim();
  }

  if (!str) return null;

  // India-common: DD/MM/YYYY or DD-MM-YYYY
  const ddmmMatch = str.match(/^(\d{1,2})[/-](\d{1,2})[/-](\d{2,4})$/);
  if (ddmmMatch) {
    const [, dd, mm, yy] = ddmmMatch.map(Number);
    const year = yy < 100 ? 2000 + yy : yy;
    const candidate = new Date(year, mm - 1, dd);

    // Validate (prevents invalid like 32/13)
    if (
      !isNaN(candidate.getTime()) &&
      candidate.getDate() === dd &&
      candidate.getMonth() === mm - 1
    ) {
      // Set to local midnight (no time portion)
      candidate.setHours(0, 0, 0, 0);
      return candidate;
    }
  }

  // Fallback: standard parse (might hit MM/DD in some cases)
  const fallback = new Date(str);
  if (!isNaN(fallback.getTime())) {
    fallback.setHours(0, 0, 0, 0);
    return fallback;
  }

  return null;
}

function normalizeTime(val: any): Date | null {
  if (val instanceof Date && !isNaN(val.getTime())) {
    // If full date-time, keep it; if time-only, we'll treat as 1970-01-01 + time
    return val;
  }

  if (typeof val === "number" && val >= 0 && val < 1) {
    // Excel time fraction (0.0 = 00:00, 0.5 = 12:00)
    const ms = val * 86400000;
    const timeOnly = new Date(ms);
    return timeOnly;
  }

  if (typeof val === "string" && val.trim()) {
    const dt = new Date(`1970-01-01 ${val.trim()}`);
    return isNaN(dt.getTime()) ? null : dt;
  }

  return null;
}
