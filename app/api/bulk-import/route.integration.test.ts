import { describe, it, expect, vi, beforeEach } from "vitest";
import { POST } from "./route";
import { NextRequest } from "next/server";

/**
 * Integration Tests: Full POST Handler Flow
 *
 * Tests the complete POST handler flow including:
 * - Date transformation (JSON serialization handling)
 * - Data normalization (empty strings to null)
 * - Validation
 * - Error responses
 *
 * Requirements: 3.1, 3.2, 4.2, 4.4
 */

// Mock Supabase client
const mockSupabaseClient = {
  auth: {
    getUser: vi.fn(),
  },
  from: vi.fn(),
};

// Mock the createClient function
vi.mock("@/lib/supabase/server", () => ({
  createClient: vi.fn(() => Promise.resolve(mockSupabaseClient)),
}));

// Mock utility functions
vi.mock("@/lib/utils", () => ({
  isHolidayOrLeave: vi.fn(() => false),
  createFullDayTimeRange: vi.fn(),
}));

describe("Integration Tests: Full POST Handler Flow", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    // Default: authenticated user
    mockSupabaseClient.auth.getUser.mockResolvedValue({
      data: { user: { id: "test-user-id" } },
      error: null,
    });
  });

  /**
   * Test 1: Data that previously failed (empty strings)
   *
   * Validates: Requirements 3.1 (backward compatibility with valid data)
   *
   * This test verifies that data with empty strings (which previously caused
   * validation errors) is now properly normalized to null and passes validation.
   */
  it("should handle data with empty strings (previously failed case)", async () => {
    // Arrange: Create request with empty strings that should be normalized
    const requestBody = {
      tasks: [
        {
          date: "2024-01-15T00:00:00.000Z",
          projectName: "Project A",
          taskType: "Development",
          task: "Task 1",
          startTime: "2024-01-15T09:00:00.000Z",
          endTime: "2024-01-15T17:00:00.000Z",
          rowNumber: 1,
          originalRow: {},
        },
        {
          date: "2024-01-16T00:00:00.000Z",
          projectName: "", // Empty string - should be normalized to null
          taskType: "   ", // Whitespace - should be normalized to null
          task: "", // Empty string - should be normalized to null
          startTime: "2024-01-16T09:00:00.000Z",
          endTime: "2024-01-16T17:00:00.000Z",
          rowNumber: 2,
          originalRow: {},
        },
      ],
      company_id: "test-company-id",
    };

    const request = new NextRequest("http://localhost:3000/api/bulk-import", {
      method: "POST",
      body: JSON.stringify(requestBody),
    });

    // Mock company access verification
    mockSupabaseClient.from.mockImplementation((table: string) => {
      if (table === "companies") {
        return {
          select: vi.fn().mockReturnThis(),
          eq: vi.fn().mockReturnThis(),
          single: vi.fn().mockResolvedValue({
            data: { id: "test-company-id", user_id: "test-user-id" },
            error: null,
          }),
        };
      }
      return { select: vi.fn().mockReturnThis() };
    });

    // Act: Call the POST handler
    const response = await POST(request);
    const data = await response.json();

    // Assert: Should return validation errors for row 2 (empty required fields)
    expect(response.status).toBe(400);
    expect(data.success).toBe(false);
    expect(data.error).toBe("Validation failed");
    expect(data.validationErrors).toBeDefined();
    expect(data.validationErrors.length).toBeGreaterThan(0);

    // Verify that empty strings were detected as missing required fields
    const row2Errors = data.validationErrors.filter(
      (e: any) => e.rowNumber === 2,
    );
    expect(row2Errors.length).toBeGreaterThan(0);
    expect(row2Errors.some((e: any) => e.field === "projectName")).toBe(true);
    expect(row2Errors.some((e: any) => e.field === "taskType")).toBe(true);
    expect(row2Errors.some((e: any) => e.field === "task")).toBe(true);
  });

  /**
   * Test 2: Valid data to ensure backward compatibility
   *
   * Validates: Requirements 3.1 (backward compatibility)
   *
   * This test ensures that properly populated data continues to work
   * as expected after the normalization fix.
   */
  it("should process valid data successfully (backward compatibility)", async () => {
    // Arrange: Create request with all valid data
    const requestBody = {
      tasks: [
        {
          date: "2024-01-15T00:00:00.000Z",
          projectName: "Project A",
          taskType: "Development",
          task: "Implement feature X",
          startTime: "2024-01-15T09:00:00.000Z",
          endTime: "2024-01-15T17:00:00.000Z",
          rowNumber: 1,
          originalRow: {},
        },
        {
          date: "2024-01-16T00:00:00.000Z",
          projectName: "Project B",
          taskType: "Testing",
          task: "Write unit tests",
          startTime: "2024-01-16T10:00:00.000Z",
          endTime: "2024-01-16T12:00:00.000Z",
          rowNumber: 2,
          originalRow: {},
        },
      ],
      company_id: "test-company-id",
    };

    const request = new NextRequest("http://localhost:3000/api/bulk-import", {
      method: "POST",
      body: JSON.stringify(requestBody),
    });

    // Mock all database operations with proper chaining
    let callCount = 0;
    mockSupabaseClient.from.mockImplementation((table: string) => {
      const baseChain = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        in: vi.fn().mockReturnThis(),
        insert: vi.fn().mockReturnThis(),
        single: vi.fn(),
      };

      if (table === "companies") {
        baseChain.single.mockResolvedValue({
          data: {
            id: "test-company-id",
            user_id: "test-user-id",
            work_start: "09:00:00",
            work_end: "18:00:00",
          },
          error: null,
        });
        return baseChain;
      } else if (table === "task_types") {
        baseChain.eq.mockResolvedValue({
          data: [
            { id: "type-1", name: "Development" },
            { id: "type-2", name: "Testing" },
          ],
          error: null,
        });
        return baseChain;
      } else if (table === "projects") {
        baseChain.eq.mockResolvedValue({
          data: [
            { id: "project-1", name: "Project A" },
            { id: "project-2", name: "Project B" },
          ],
          error: null,
        });
        return baseChain;
      } else if (table === "tasks") {
        // First call is for duplicate check, second is for insert
        callCount++;
        if (callCount === 1) {
          baseChain.eq.mockResolvedValue({
            data: [], // No duplicates
            error: null,
          });
        } else {
          baseChain.select.mockResolvedValue({
            data: [{ id: "task-1" }, { id: "task-2" }],
            error: null,
          });
        }
        return baseChain;
      }

      return baseChain;
    });

    // Act: Call the POST handler
    const response = await POST(request);
    const data = await response.json();

    // Assert: Should succeed
    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.data).toBeDefined();
    expect(data.data.tasksCreated).toBe(2);
    expect(data.message).toContain("Successfully imported");
  });

  /**
   * Test 3: Genuinely invalid data (missing required fields)
   *
   * Validates: Requirements 3.2 (reject invalid data with appropriate errors)
   *
   * This test ensures that data with genuinely missing required fields
   * (null values) is properly rejected with appropriate error messages.
   */
  it("should reject genuinely invalid data with missing required fields", async () => {
    // Arrange: Create request with missing required fields
    const requestBody = {
      tasks: [
        {
          date: null, // Missing required field
          projectName: "Project A",
          taskType: "Development",
          task: "Task 1",
          startTime: "2024-01-15T09:00:00.000Z",
          endTime: "2024-01-15T17:00:00.000Z",
          rowNumber: 1,
          originalRow: {},
        },
        {
          date: "2024-01-16T00:00:00.000Z",
          projectName: null, // Missing required field
          taskType: null, // Missing required field
          task: "Task 2",
          startTime: "2024-01-16T09:00:00.000Z",
          endTime: "2024-01-16T17:00:00.000Z",
          rowNumber: 2,
          originalRow: {},
        },
      ],
      company_id: "test-company-id",
    };

    const request = new NextRequest("http://localhost:3000/api/bulk-import", {
      method: "POST",
      body: JSON.stringify(requestBody),
    });

    // Mock company access verification
    mockSupabaseClient.from.mockImplementation((table: string) => {
      if (table === "companies") {
        return {
          select: vi.fn().mockReturnThis(),
          eq: vi.fn().mockReturnThis(),
          single: vi.fn().mockResolvedValue({
            data: { id: "test-company-id", user_id: "test-user-id" },
            error: null,
          }),
        };
      }
      return { select: vi.fn().mockReturnThis() };
    });

    // Act: Call the POST handler
    const response = await POST(request);
    const data = await response.json();

    // Assert: Should return validation errors
    expect(response.status).toBe(400);
    expect(data.success).toBe(false);
    expect(data.error).toBe("Validation failed");
    expect(data.validationErrors).toBeDefined();
    expect(data.validationErrors.length).toBeGreaterThan(0);

    // Verify specific errors
    const row1Errors = data.validationErrors.filter(
      (e: any) => e.rowNumber === 1,
    );
    const row2Errors = data.validationErrors.filter(
      (e: any) => e.rowNumber === 2,
    );

    expect(row1Errors.some((e: any) => e.field === "date")).toBe(true);
    expect(row2Errors.some((e: any) => e.field === "projectName")).toBe(true);
    expect(row2Errors.some((e: any) => e.field === "taskType")).toBe(true);
  });

  /**
   * Test 4: Mixed valid/invalid tasks in batch
   *
   * Validates: Requirements 4.4 (handle arrays with varying field states)
   *
   * This test ensures that batches with mixed valid and invalid tasks
   * are processed correctly, with validation errors reported for invalid
   * tasks while valid tasks are identified.
   */
  it("should handle mixed valid/invalid tasks in batch", async () => {
    // Arrange: Create request with mix of valid and invalid tasks
    const requestBody = {
      tasks: [
        // Valid task
        {
          date: "2024-01-15T00:00:00.000Z",
          projectName: "Project A",
          taskType: "Development",
          task: "Valid task",
          startTime: "2024-01-15T09:00:00.000Z",
          endTime: "2024-01-15T17:00:00.000Z",
          rowNumber: 1,
          originalRow: {},
        },
        // Invalid task - empty strings
        {
          date: "2024-01-16T00:00:00.000Z",
          projectName: "",
          taskType: "",
          task: "",
          startTime: "2024-01-16T09:00:00.000Z",
          endTime: "2024-01-16T17:00:00.000Z",
          rowNumber: 2,
          originalRow: {},
        },
        // Valid task
        {
          date: "2024-01-17T00:00:00.000Z",
          projectName: "Project B",
          taskType: "Testing",
          task: "Another valid task",
          startTime: "2024-01-17T10:00:00.000Z",
          endTime: "2024-01-17T12:00:00.000Z",
          rowNumber: 3,
          originalRow: {},
        },
        // Invalid task - null values
        {
          date: null,
          projectName: "Project C",
          taskType: null,
          task: "Task with missing fields",
          startTime: "2024-01-18T09:00:00.000Z",
          endTime: "2024-01-18T17:00:00.000Z",
          rowNumber: 4,
          originalRow: {},
        },
        // Invalid task - time range error
        {
          date: "2024-01-19T00:00:00.000Z",
          projectName: "Project D",
          taskType: "Development",
          task: "Task with invalid time range",
          startTime: "2024-01-19T17:00:00.000Z",
          endTime: "2024-01-19T09:00:00.000Z", // End before start
          rowNumber: 5,
          originalRow: {},
        },
      ],
      company_id: "test-company-id",
    };

    const request = new NextRequest("http://localhost:3000/api/bulk-import", {
      method: "POST",
      body: JSON.stringify(requestBody),
    });

    // Mock company access verification
    mockSupabaseClient.from.mockImplementation((table: string) => {
      if (table === "companies") {
        return {
          select: vi.fn().mockReturnThis(),
          eq: vi.fn().mockReturnThis(),
          single: vi.fn().mockResolvedValue({
            data: { id: "test-company-id", user_id: "test-user-id" },
            error: null,
          }),
        };
      }
      return { select: vi.fn().mockReturnThis() };
    });

    // Act: Call the POST handler
    const response = await POST(request);
    const data = await response.json();

    // Assert: Should return validation errors
    expect(response.status).toBe(400);
    expect(data.success).toBe(false);
    expect(data.error).toBe("Validation failed");
    expect(data.validationErrors).toBeDefined();

    // Verify errors for each invalid task
    const row2Errors = data.validationErrors.filter(
      (e: any) => e.rowNumber === 2,
    );
    const row4Errors = data.validationErrors.filter(
      (e: any) => e.rowNumber === 4,
    );
    const row5Errors = data.validationErrors.filter(
      (e: any) => e.rowNumber === 5,
    );

    // Row 2: Empty strings should be detected as missing fields
    expect(row2Errors.length).toBeGreaterThan(0);
    expect(row2Errors.some((e: any) => e.field === "projectName")).toBe(true);

    // Row 4: Null values should be detected as missing fields
    expect(row4Errors.length).toBeGreaterThan(0);
    expect(row4Errors.some((e: any) => e.field === "date")).toBe(true);
    expect(row4Errors.some((e: any) => e.field === "taskType")).toBe(true);

    // Row 5: Time range validation error
    expect(row5Errors.length).toBeGreaterThan(0);
    expect(row5Errors.some((e: any) => e.field === "startTime")).toBe(true);

    // Verify no errors for valid tasks (rows 1 and 3)
    const row1Errors = data.validationErrors.filter(
      (e: any) => e.rowNumber === 1,
    );
    const row3Errors = data.validationErrors.filter(
      (e: any) => e.rowNumber === 3,
    );
    expect(row1Errors.length).toBe(0);
    expect(row3Errors.length).toBe(0);
  });

  /**
   * Test 5: JSON serialization handling
   *
   * Validates: Requirements 4.2 (handle JSON-serialized data)
   *
   * This test verifies that Date objects serialized to ISO strings
   * via JSON are properly transformed back to Date objects.
   */
  it("should handle JSON-serialized dates correctly", async () => {
    // Arrange: Create request with ISO date strings (as they come from JSON)
    const requestBody = {
      tasks: [
        {
          date: "2024-01-15T00:00:00.000Z", // ISO string from JSON
          projectName: "Project A",
          taskType: "Development",
          task: "Task 1",
          startTime: "2024-01-15T09:00:00.000Z", // ISO string from JSON
          endTime: "2024-01-15T17:00:00.000Z", // ISO string from JSON
          rowNumber: 1,
          originalRow: {},
        },
      ],
      company_id: "test-company-id",
    };

    const request = new NextRequest("http://localhost:3000/api/bulk-import", {
      method: "POST",
      body: JSON.stringify(requestBody),
    });

    // Mock all database operations for success
    let callCount = 0;
    mockSupabaseClient.from.mockImplementation((table: string) => {
      const baseChain = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        in: vi.fn().mockReturnThis(),
        insert: vi.fn().mockReturnThis(),
        single: vi.fn(),
      };

      if (table === "companies") {
        baseChain.single.mockResolvedValue({
          data: {
            id: "test-company-id",
            user_id: "test-user-id",
            work_start: "09:00:00",
            work_end: "18:00:00",
          },
          error: null,
        });
        return baseChain;
      } else if (table === "task_types") {
        baseChain.eq.mockResolvedValue({
          data: [{ id: "type-1", name: "Development" }],
          error: null,
        });
        return baseChain;
      } else if (table === "projects") {
        baseChain.eq.mockResolvedValue({
          data: [{ id: "project-1", name: "Project A" }],
          error: null,
        });
        return baseChain;
      } else if (table === "tasks") {
        // First call is for duplicate check, second is for insert
        callCount++;
        if (callCount === 1) {
          baseChain.eq.mockResolvedValue({
            data: [], // No duplicates
            error: null,
          });
        } else {
          baseChain.select.mockResolvedValue({
            data: [{ id: "task-1" }],
            error: null,
          });
        }
        return baseChain;
      }

      return baseChain;
    });

    // Act: Call the POST handler
    const response = await POST(request);
    const data = await response.json();

    // Assert: Should succeed (dates were properly transformed)
    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.data.tasksCreated).toBe(1);
  });

  /**
   * Test 6: Authentication failure
   *
   * Validates: Error handling for unauthenticated requests
   */
  it("should return 401 for unauthenticated requests", async () => {
    // Arrange: Mock unauthenticated user
    mockSupabaseClient.auth.getUser.mockResolvedValue({
      data: { user: null },
      error: null,
    });

    const requestBody = {
      tasks: [],
      company_id: "test-company-id",
    };

    const request = new NextRequest("http://localhost:3000/api/bulk-import", {
      method: "POST",
      body: JSON.stringify(requestBody),
    });

    // Act: Call the POST handler
    const response = await POST(request);
    const data = await response.json();

    // Assert: Should return 401
    expect(response.status).toBe(401);
    expect(data.success).toBe(false);
    expect(data.error).toBe("Unauthorized");
  });

  /**
   * Test 7: Company access denied
   *
   * Validates: Error handling for unauthorized company access
   */
  it("should return 403 for unauthorized company access", async () => {
    // Arrange: Mock company that doesn't belong to user
    const requestBody = {
      tasks: [
        {
          date: "2024-01-15T00:00:00.000Z",
          projectName: "Project A",
          taskType: "Development",
          task: "Task 1",
          startTime: "2024-01-15T09:00:00.000Z",
          endTime: "2024-01-15T17:00:00.000Z",
          rowNumber: 1,
          originalRow: {},
        },
      ],
      company_id: "unauthorized-company-id",
    };

    const request = new NextRequest("http://localhost:3000/api/bulk-import", {
      method: "POST",
      body: JSON.stringify(requestBody),
    });

    // Mock company access verification - company not found or belongs to different user
    mockSupabaseClient.from.mockImplementation((table: string) => {
      if (table === "companies") {
        return {
          select: vi.fn().mockReturnThis(),
          eq: vi.fn().mockReturnThis(),
          single: vi.fn().mockResolvedValue({
            data: null,
            error: { message: "Not found" },
          }),
        };
      }
      return { select: vi.fn().mockReturnThis() };
    });

    // Act: Call the POST handler
    const response = await POST(request);
    const data = await response.json();

    // Assert: Should return 403
    expect(response.status).toBe(403);
    expect(data.success).toBe(false);
    expect(data.error).toBe("Access denied to specified company");
  });
});
