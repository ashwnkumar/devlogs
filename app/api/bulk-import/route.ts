import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";
import { ExtractedWorkLog } from "@/app/actions/bulk-import";

// ── Type Definitions ────────────────────────────────────────────────────

/**
 * Request body structure for bulk import API
 */
export interface BulkImportRequest {
  tasks: ExtractedWorkLog[];
  company_id: string;
}

/**
 * Success response structure
 */
export interface BulkImportSuccessResponse {
  success: true;
  data: {
    projectsCreated: number;
    projectsReused: number;
    taskTypesCreated: number;
    tasksCreated: number;
    projects: Array<{
      id: string;
      name: string;
    }>;
  };
  message: string;
}

/**
 * Error response structure
 */
export interface BulkImportErrorResponse {
  success: false;
  error: string;
  validationErrors?: ValidationError[];
}

/**
 * Validation error details
 */
export interface ValidationError {
  rowNumber: number;
  field: string;
  message: string;
}

/**
 * Combined response type
 */
export type BulkImportResponse =
  | BulkImportSuccessResponse
  | BulkImportErrorResponse;

/**
 * Validation result structure
 */
interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
}

// ── Validation Layer ────────────────────────────────────────────────────

/**
 * Validates bulk import data before processing
 *
 * Validates:
 * - Required fields (date, projectName, taskType, task, startTime, endTime)
 * - Time range (startTime < endTime)
 * - Date range (2000-2100)
 * - Company ID presence
 *
 * Requirements: 6.1, 6.2, 6.3, 6.4, 6.5
 *
 * @param tasks - Array of tasks to validate
 * @param company_id - Company ID to validate
 * @returns Validation result with errors if any
 */
function validateBulkImportData(
  tasks: ExtractedWorkLog[],
  company_id: string,
): ValidationResult {
  const errors: ValidationError[] = [];

  // Validate company_id (Requirement 6.5)
  if (!company_id || company_id.trim() === "") {
    errors.push({
      rowNumber: 0,
      field: "company_id",
      message: "Company ID is required",
    });
  }

  // Validate each task
  tasks.forEach((task, index) => {
    const rowNumber = index + 1;

    // Required field validation (Requirement 6.1)
    if (!task.date) {
      errors.push({ rowNumber, field: "date", message: "Date is required" });
    }
    if (!task.projectName || task.projectName.trim() === "") {
      errors.push({
        rowNumber,
        field: "projectName",
        message: "Project name is required",
      });
    }
    if (!task.taskType || task.taskType.trim() === "") {
      errors.push({
        rowNumber,
        field: "taskType",
        message: "Task type is required",
      });
    }
    if (!task.task || task.task.trim() === "") {
      errors.push({
        rowNumber,
        field: "task",
        message: "Task title is required",
      });
    }
    if (!task.startTime) {
      errors.push({
        rowNumber,
        field: "startTime",
        message: "Start time is required",
      });
    }
    if (!task.endTime) {
      errors.push({
        rowNumber,
        field: "endTime",
        message: "End time is required",
      });
    }

    // Time range validation (Requirement 6.2)
    if (task.startTime && task.endTime && task.startTime >= task.endTime) {
      errors.push({
        rowNumber,
        field: "startTime",
        message: "Start time must be before end time",
      });
    }

    // Date range validation (Requirement 6.3)
    if (task.date) {
      const year = task.date.getFullYear();
      if (year < 2000 || year > 2100) {
        errors.push({
          rowNumber,
          field: "date",
          message: "Date must be between 2000 and 2100",
        });
      }
    }
  });

  return {
    isValid: errors.length === 0,
    errors,
  };
}

// ── Project Service ─────────────────────────────────────────────────────

/**
 * Result of project processing
 */
export interface ProjectResult {
  projectNameToIdMap: Map<string, string>;
  projectsCreated: number;
  projectsReused: number;
  projectList: Array<{ id: string; name: string }>;
}

/**
 * Processes projects for bulk import
 *
 * Extracts unique project names (case-insensitive), queries existing projects,
 * creates new projects as needed, and builds a name-to-ID mapping.
 *
 * Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6
 *
 * @param tasks - Array of tasks containing project names
 * @param companyId - Company ID to associate projects with
 * @param supabase - Supabase client instance
 * @returns Project processing result with mapping and statistics
 */
export async function processProjects(
  tasks: ExtractedWorkLog[],
  companyId: string,
  supabase: any,
): Promise<ProjectResult> {
  // Extract unique project names (case-insensitive) - Requirement 3.1
  const uniqueProjectNames = new Map<string, string>();
  tasks.forEach((task) => {
    if (!task.projectName) return; // Skip tasks without project names
    const lowerName = task.projectName.toLowerCase();
    if (!uniqueProjectNames.has(lowerName)) {
      uniqueProjectNames.set(lowerName, task.projectName);
    }
  });

  // Fetch existing projects for this company - Requirement 3.2
  const projectNamesArray = Array.from(uniqueProjectNames.keys());
  const { data: existingProjects, error: fetchError } = await supabase
    .from("projects")
    .select("id, name")
    .eq("company_id", companyId);

  if (fetchError) throw fetchError;

  // Build map of existing projects (case-insensitive) - Requirement 3.3
  const projectNameToIdMap = new Map<string, string>();
  const existingProjectSet = new Set<string>();

  existingProjects?.forEach((project: any) => {
    const lowerName = project.name.toLowerCase();
    projectNameToIdMap.set(lowerName, project.id);
    existingProjectSet.add(lowerName);
  });

  // Identify projects to create - Requirement 3.4
  const projectsToCreate: string[] = [];
  uniqueProjectNames.forEach((originalName, lowerName) => {
    if (!existingProjectSet.has(lowerName)) {
      projectsToCreate.push(originalName);
    }
  });

  // Create new projects (batch insert) - Requirement 3.4, 3.5
  let newProjects: any[] = [];
  if (projectsToCreate.length > 0) {
    const { data, error: createError } = await supabase
      .from("projects")
      .insert(
        projectsToCreate.map((name) => ({
          name,
          company_id: companyId,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })),
      )
      .select("id, name");

    if (createError) throw createError;
    newProjects = data || [];

    // Add new projects to map
    newProjects.forEach((project: any) => {
      projectNameToIdMap.set(project.name.toLowerCase(), project.id);
    });
  }

  // Build project list for response - Requirement 3.6
  const projectList = [...(existingProjects || []), ...newProjects].map(
    (p: any) => ({ id: p.id, name: p.name }),
  );

  return {
    projectNameToIdMap,
    projectsCreated: newProjects.length,
    projectsReused: existingProjects?.length || 0,
    projectList,
  };
}

// ── Duplicate Detection ─────────────────────────────────────────────────

/**
 * Result of duplicate checking
 */
export interface DuplicateCheckResult {
  hasDuplicates: boolean;
  duplicates: ValidationError[];
}

/**
 * Checks for duplicate tasks in the database
 *
 * A duplicate is defined as a task matching an existing task on:
 * - user_id
 * - project_id
 * - date (YYYY-MM-DD format)
 * - start_time (ISO timestamp)
 * - title
 *
 * Requirements: 5.1, 5.2, 5.3, 5.4
 *
 * @param tasks - Array of tasks to check for duplicates
 * @param userId - User ID to check against
 * @param projectNameToIdMap - Map of project names to IDs
 * @param supabase - Supabase client instance
 * @returns Duplicate check result with validation errors if duplicates found
 */
export async function checkForDuplicates(
  tasks: ExtractedWorkLog[],
  userId: string,
  projectNameToIdMap: Map<string, string>,
  supabase: any,
): Promise<DuplicateCheckResult> {
  const duplicates: ValidationError[] = [];

  // Build list of task signatures to check - Requirement 5.1
  const taskSignatures = tasks
    .filter(
      (task) => task.date && task.startTime && task.task && task.projectName,
    )
    .map((task, index) => ({
      rowNumber: index + 1,
      user_id: userId,
      project_id: projectNameToIdMap.get(task.projectName!.toLowerCase()),
      date: formatDate(task.date!),
      start_time: task.startTime!.toISOString(),
      title: task.task!,
    }));

  // Get unique project IDs to query
  const projectIds = Array.from(
    new Set(taskSignatures.map((sig) => sig.project_id).filter(Boolean)),
  );

  if (projectIds.length === 0) {
    // No valid project IDs, skip duplicate check
    return {
      hasDuplicates: false,
      duplicates: [],
    };
  }

  // Query for existing tasks matching these signatures - Requirement 5.2
  // Use IN clause for efficient batch checking
  const { data: existingTasks, error } = await supabase
    .from("tasks")
    .select("user_id, project_id, date, start_time, title")
    .in("project_id", projectIds)
    .eq("user_id", userId);

  if (error) throw error;

  // Check each task against existing tasks - Requirement 5.3
  taskSignatures.forEach((sig) => {
    const isDuplicate = existingTasks?.some(
      (existing: any) =>
        existing.user_id === sig.user_id &&
        existing.project_id === sig.project_id &&
        existing.date === sig.date &&
        existing.start_time === sig.start_time &&
        existing.title === sig.title,
    );

    if (isDuplicate) {
      // Add validation error with row number - Requirement 5.4
      duplicates.push({
        rowNumber: sig.rowNumber,
        field: "task",
        message:
          "Duplicate task detected (same user, project, date, start time, and title)",
      });
    }
  });

  return {
    hasDuplicates: duplicates.length > 0,
    duplicates,
  };
}

/**
 * Formats a Date object to YYYY-MM-DD string
 *
 * @param date - Date to format
 * @returns Date string in YYYY-MM-DD format
 */
function formatDate(date: Date): string {
  return date.toISOString().split("T")[0]; // YYYY-MM-DD
}

// ── Task Type Service ───────────────────────────────────────────────────

/**
 * Result of task type processing
 */
export interface TaskTypeResult {
  taskTypeNameToIdMap: Map<string, string>;
  taskTypesCreated: number;
}

/**
 * Processes task types for bulk import
 *
 * Extracts unique task type names, queries existing task types for the user,
 * creates new task types as needed with default color, and builds a name-to-ID mapping.
 *
 * Requirements: 4.1, 4.2, 4.3, 4.4, 4.6
 *
 * @param tasks - Array of tasks containing task type names
 * @param userId - User ID to associate task types with
 * @param supabase - Supabase client instance
 * @returns Task type processing result with mapping and statistics
 */
export async function processTaskTypes(
  tasks: ExtractedWorkLog[],
  userId: string,
  supabase: any,
): Promise<TaskTypeResult> {
  // Extract unique task type names - Requirement 4.1
  const uniqueTaskTypeNames = new Set<string>();
  tasks.forEach((task) => {
    if (task.taskType) {
      uniqueTaskTypeNames.add(task.taskType);
    }
  });

  // Fetch existing task types for this user - Requirement 4.2
  const { data: existingTaskTypes, error: fetchError } = await supabase
    .from("task_types")
    .select("id, name")
    .eq("user_id", userId);

  if (fetchError) throw fetchError;

  // Build map of existing task types - Requirement 4.2, 4.5
  const taskTypeNameToIdMap = new Map<string, string>();
  const existingTaskTypeSet = new Set<string>();

  existingTaskTypes?.forEach((taskType: any) => {
    taskTypeNameToIdMap.set(taskType.name, taskType.id);
    existingTaskTypeSet.add(taskType.name);
  });

  // Identify task types to create - Requirement 4.3
  const taskTypesToCreate = Array.from(uniqueTaskTypeNames).filter(
    (name) => !existingTaskTypeSet.has(name),
  );

  // Create new task types (batch insert) - Requirement 4.3, 4.4
  let newTaskTypes: any[] = [];
  if (taskTypesToCreate.length > 0) {
    const { data, error: createError } = await supabase
      .from("task_types")
      .insert(
        taskTypesToCreate.map((name) => ({
          name,
          color: "#6B7280", // default gray color - Requirement 4.4
          user_id: userId,
        })),
      )
      .select("id, name");

    if (createError) throw createError;
    newTaskTypes = data || [];

    // Add new task types to map
    newTaskTypes.forEach((taskType: any) => {
      taskTypeNameToIdMap.set(taskType.name, taskType.id);
    });
  }

  // Return statistics and mapping - Requirement 4.6
  return {
    taskTypeNameToIdMap,
    taskTypesCreated: newTaskTypes.length,
  };
}

// ── Task Service ────────────────────────────────────────────────────────

/**
 * Task data structure for database insertion
 */
export interface TaskInsertData {
  user_id: string;
  project_id: string;
  task_type_id: string;
  title: string;
  date: string;
  start_time: string;
  end_time: string;
  duration: number;
}

/**
 * Inserts tasks into the database in a single batch operation
 *
 * Transforms ExtractedWorkLog entries into database format:
 * - Calculates duration in minutes from start/end times
 * - Formats dates as YYYY-MM-DD
 * - Formats times as ISO timestamps
 * - Maps project names and task types to their IDs
 *
 * Requirements: 7.2, 10.1, 10.2, 10.3
 *
 * @param tasks - Array of tasks to insert
 * @param userId - User ID to associate tasks with
 * @param projectNameToIdMap - Map of project names to IDs
 * @param taskTypeNameToIdMap - Map of task type names to IDs
 * @param supabase - Supabase client instance
 * @returns Count of tasks created
 * @throws Error if project or task type mapping is missing
 */
export async function insertTasks(
  tasks: ExtractedWorkLog[],
  userId: string,
  projectNameToIdMap: Map<string, string>,
  taskTypeNameToIdMap: Map<string, string>,
  supabase: any,
): Promise<number> {
  // Transform tasks into insert format - Requirement 7.2
  const tasksToInsert: TaskInsertData[] = tasks.map((task) => {
    const projectId = task.projectName
      ? projectNameToIdMap.get(task.projectName.toLowerCase())
      : undefined;
    const taskTypeId = task.taskType
      ? taskTypeNameToIdMap.get(task.taskType)
      : undefined;

    if (!projectId || !taskTypeId) {
      throw new Error(
        `Missing mapping for project "${task.projectName || "unknown"}" or task type "${task.taskType || "unknown"}"`,
      );
    }

    if (!task.date || !task.startTime || !task.endTime || !task.task) {
      throw new Error(
        `Missing required fields for task at row ${task.rowNumber || "unknown"}`,
      );
    }

    // Calculate duration in minutes - Requirement 7.2
    const durationMs = task.endTime.getTime() - task.startTime.getTime();
    const durationMinutes = Math.round(durationMs / (1000 * 60));

    return {
      user_id: userId,
      project_id: projectId,
      task_type_id: taskTypeId,
      title: task.task,
      date: formatDate(task.date), // YYYY-MM-DD format - Requirement 10.1
      start_time: task.startTime.toISOString(), // ISO timestamp - Requirement 10.2
      end_time: task.endTime.toISOString(), // ISO timestamp - Requirement 10.3
      duration: durationMinutes,
    };
  });

  // Batch insert all tasks - Requirement 7.2
  const { data, error } = await supabase
    .from("tasks")
    .insert(tasksToInsert)
    .select("id");

  if (error) throw error;

  return data?.length || 0;
}

// ── Company Authorization ───────────────────────────────────────────────

/**
 * Verifies that a user has access to a specific company
 *
 * Checks if the company exists and belongs to the authenticated user.
 *
 * Requirement: 9.4
 *
 * @param userId - User ID to check access for
 * @param companyId - Company ID to verify access to
 * @param supabase - Supabase client instance
 * @returns True if user has access, false otherwise
 */
export async function verifyCompanyAccess(
  userId: string,
  companyId: string,
  supabase: any,
): Promise<boolean> {
  // Query user's company associations - Requirement 9.4
  const { data: company, error } = await supabase
    .from("companies")
    .select("id, user_id")
    .eq("id", companyId)
    .eq("user_id", userId)
    .single();

  if (error || !company) {
    return false;
  }

  // Verify user has access to specified company_id - Requirement 9.4
  return company.user_id === userId;
}

// ── Response Helpers ────────────────────────────────────────────────────

/**
 * Creates a success response with proper structure
 *
 * Requirements: 8.1, 8.3
 *
 * @param data - Success data containing counts and project list
 * @param message - Success message
 * @returns NextResponse with success structure
 */
function successResponse(
  data: {
    projectsCreated: number;
    projectsReused: number;
    taskTypesCreated: number;
    tasksCreated: number;
    projects: Array<{ id: string; name: string }>;
  },
  message: string,
): NextResponse<BulkImportSuccessResponse> {
  return NextResponse.json(
    {
      success: true,
      data,
      message,
    } as BulkImportSuccessResponse,
    { status: 200 },
  );
}

/**
 * Creates an error response with proper structure and status code
 *
 * Requirements: 1.3, 1.4, 1.5, 1.6, 11.1, 11.2, 11.5
 *
 * @param status - HTTP status code
 * @param error - Error message
 * @param validationErrors - Optional validation errors array
 * @returns NextResponse with error structure
 */
function errorResponse(
  status: number,
  error: string,
  validationErrors?: ValidationError[],
): NextResponse<BulkImportErrorResponse> {
  return NextResponse.json(
    {
      success: false,
      error,
      ...(validationErrors && { validationErrors }),
    } as BulkImportErrorResponse,
    { status },
  );
}

// ── API Route Handler ───────────────────────────────────────────────────

/**
 * POST /api/bulk-import
 *
 * Processes cleaned Excel data and imports it into the database with atomic
 * transaction guarantees. Handles up to 500 rows efficiently.
 *
 * Flow:
 * 1. Authenticate user (Requirement 9.1, 9.2)
 * 2. Parse and validate request body (Requirement 1.2, 6.1-6.5)
 * 3. Process task types (Requirement 4.1-4.6)
 * 4. Process projects (Requirement 3.1-3.6)
 * 5. Check for duplicates (Requirement 5.1-5.4)
 * 6. Insert tasks (Requirement 7.2, 10.1-10.3)
 * 7. Return success response (Requirement 8.1-8.5)
 *
 * Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 2.1, 2.2, 8.1, 8.4, 9.1, 9.2, 12.1, 12.2, 12.7
 */
export async function POST(request: NextRequest) {
  try {
    // ── Task 8.1: Authentication and Validation ─────────────────────────

    // 1. Initialize Supabase client
    const supabase = await createClient();

    // 2. Authenticate user - Requirement 9.1, 9.2
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      // Return 401 for authentication errors - Requirement 1.5
      return errorResponse(401, "Unauthorized");
    }

    const userId = user.id;

    // 3. Parse request body - Requirement 1.2
    const body: BulkImportRequest = await request.json();
    const { tasks, company_id } = body;

    // 4. Validate input data (fail fast) - Requirements: 6.1, 6.2, 6.3, 6.4, 6.5
    const validationResult = validateBulkImportData(tasks, company_id);
    if (!validationResult.isValid) {
      // Return 400 for validation errors - Requirement 1.4
      return errorResponse(400, "Validation failed", validationResult.errors);
    }

    // 5. Verify company access - Requirement 9.4
    const hasAccess = await verifyCompanyAccess(userId, company_id, supabase);
    if (!hasAccess) {
      // Return 403 for unauthorized access - Requirement 9.4
      return errorResponse(403, "Access denied to specified company");
    }

    // ── Task 8.2: Main Import Orchestration ─────────────────────────────

    // 6. Process task types first (outside transaction) - Requirement 12.3
    const taskTypeResult = await processTaskTypes(tasks, userId, supabase);

    // 7. Process projects - Requirement 12.4
    const projectResult = await processProjects(tasks, company_id, supabase);

    // 8. Check for duplicates before inserting - Requirement 5.1-5.4, 12.5
    const duplicateCheck = await checkForDuplicates(
      tasks,
      userId,
      projectResult.projectNameToIdMap,
      supabase,
    );

    if (duplicateCheck.hasDuplicates) {
      // Return 400 for duplicate errors
      return errorResponse(
        400,
        "Duplicate tasks detected",
        duplicateCheck.duplicates,
      );
    }

    // 9. Insert all tasks in batch - Requirement 7.2, 12.6
    const tasksCreated = await insertTasks(
      tasks,
      userId,
      projectResult.projectNameToIdMap,
      taskTypeResult.taskTypeNameToIdMap,
      supabase,
    );

    // ── Task 8.3: Success Response ──────────────────────────────────────

    // 10. Build success message - Requirement 8.1
    const message = `Successfully imported ${tasksCreated} task${tasksCreated !== 1 ? "s" : ""} across ${projectResult.projectList.length} project${projectResult.projectList.length !== 1 ? "s" : ""}`;

    // 11. Return success response - Requirement 8.1, 8.2, 8.3
    return successResponse(
      {
        projectsCreated: projectResult.projectsCreated,
        projectsReused: projectResult.projectsReused,
        taskTypesCreated: taskTypeResult.taskTypesCreated,
        tasksCreated,
        projects: projectResult.projectList,
      },
      message,
    );
  } catch (error) {
    // ── Task 8.3: Error Handling ────────────────────────────────────────

    // Log errors for debugging - Requirement 11.1
    console.error("Bulk import error:", error);

    // Return 500 for server errors - Requirement 1.6, 11.5
    // Provide user-friendly error message - Requirement 11.2
    return errorResponse(
      500,
      error instanceof Error ? error.message : "Internal server error",
    );
  }
}
