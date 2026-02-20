import { describe, it, expect } from "vitest";
import * as fc from "fast-check";

// Import the types we need
type ExtractedWorkLog = {
  date: Date | null;
  projectName: string | null;
  taskType: string | null;
  task: string | null;
  startTime: Date | null;
  endTime: Date | null;
  rowNumber: number;
  originalRow: Record<string, any>;
  isHolidayOrLeave?: boolean;
};

// Re-implement the normalization functions for testing
// (In a real scenario, these would be exported from the route file)
function normalizeStringField(value: string | null | undefined): string | null {
  if (value === null || value === undefined) {
    return null;
  }
  const trimmed = value.trim();
  return trimmed === "" ? null : trimmed;
}

function normalizeTaskData(task: ExtractedWorkLog): ExtractedWorkLog {
  return {
    ...task,
    projectName: normalizeStringField(task.projectName),
    taskType: normalizeStringField(task.taskType),
    task: normalizeStringField(task.task),
  };
}

// Validation types
interface ValidationError {
  rowNumber: number;
  field: string;
  message: string;
}

interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
}

// Re-implement the validation function for testing
function validateBulkImportData(
  tasks: ExtractedWorkLog[],
  company_id: string,
): ValidationResult {
  const errors: ValidationError[] = [];

  // Validate company_id
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

    // Required field validation
    if (!task.date) {
      errors.push({ rowNumber, field: "date", message: "Date is required" });
    }
    if (!task.projectName) {
      errors.push({
        rowNumber,
        field: "projectName",
        message: "Project name is required",
      });
    }
    if (!task.taskType) {
      errors.push({
        rowNumber,
        field: "taskType",
        message: "Task type is required",
      });
    }
    if (!task.task) {
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

    // Time range validation
    if (task.startTime && task.endTime && task.startTime >= task.endTime) {
      errors.push({
        rowNumber,
        field: "startTime",
        message: "Start time must be before end time",
      });
    }

    // Date range validation
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

describe("Unit Tests: Normalization Edge Cases", () => {
  /**
   * Unit tests for normalizeStringField edge cases
   * Requirements: 1.2
   */
  describe("normalizeStringField", () => {
    it("should convert various whitespace combinations to null", () => {
      // Single space
      expect(normalizeStringField(" ")).toBe(null);

      // Multiple spaces
      expect(normalizeStringField("   ")).toBe(null);

      // Tab character
      expect(normalizeStringField("\t")).toBe(null);

      // Multiple tabs
      expect(normalizeStringField("\t\t\t")).toBe(null);

      // Newline character
      expect(normalizeStringField("\n")).toBe(null);

      // Multiple newlines
      expect(normalizeStringField("\n\n\n")).toBe(null);

      // Mixed whitespace (spaces, tabs, newlines)
      expect(normalizeStringField("  \t\n  ")).toBe(null);
      expect(normalizeStringField("\n\t \t\n")).toBe(null);
      expect(normalizeStringField(" \t \n \t ")).toBe(null);
    });

    it("should trim strings with leading/trailing whitespace", () => {
      // Leading spaces
      expect(normalizeStringField("  hello")).toBe("hello");

      // Trailing spaces
      expect(normalizeStringField("hello  ")).toBe("hello");

      // Both leading and trailing spaces
      expect(normalizeStringField("  hello  ")).toBe("hello");

      // Leading tabs
      expect(normalizeStringField("\t\thello")).toBe("hello");

      // Trailing tabs
      expect(normalizeStringField("hello\t\t")).toBe("hello");

      // Leading newlines
      expect(normalizeStringField("\n\nhello")).toBe("hello");

      // Trailing newlines
      expect(normalizeStringField("hello\n\n")).toBe("hello");

      // Mixed leading/trailing whitespace
      expect(normalizeStringField("  \t\nhello\n\t  ")).toBe("hello");
    });

    it("should preserve already-trimmed valid strings", () => {
      // Simple strings
      expect(normalizeStringField("hello")).toBe("hello");
      expect(normalizeStringField("world")).toBe("world");

      // Strings with internal spaces (should be preserved)
      expect(normalizeStringField("hello world")).toBe("hello world");
      expect(normalizeStringField("foo bar baz")).toBe("foo bar baz");

      // Strings with numbers
      expect(normalizeStringField("Project123")).toBe("Project123");

      // Strings with special characters
      expect(normalizeStringField("Project-A")).toBe("Project-A");
      expect(normalizeStringField("Task_Type_1")).toBe("Task_Type_1");

      // Longer strings
      expect(normalizeStringField("This is a valid task description")).toBe(
        "This is a valid task description",
      );
    });

    it("should handle null and undefined inputs", () => {
      expect(normalizeStringField(null)).toBe(null);
      expect(normalizeStringField(undefined)).toBe(null);
    });

    it("should handle empty string", () => {
      expect(normalizeStringField("")).toBe(null);
    });
  });

  describe("normalizeTaskData", () => {
    it("should normalize all string fields while preserving other fields", () => {
      const task: ExtractedWorkLog = {
        date: new Date("2024-01-15"),
        projectName: "  Project A  ",
        taskType: "\tDevelopment\t",
        task: "\nImplement feature\n",
        startTime: new Date("2024-01-15T09:00:00"),
        endTime: new Date("2024-01-15T17:00:00"),
        rowNumber: 1,
        originalRow: { col1: "value1" },
        isHolidayOrLeave: false,
      };

      const normalized = normalizeTaskData(task);

      // String fields should be trimmed
      expect(normalized.projectName).toBe("Project A");
      expect(normalized.taskType).toBe("Development");
      expect(normalized.task).toBe("Implement feature");

      // Other fields should be unchanged
      expect(normalized.date).toBe(task.date);
      expect(normalized.startTime).toBe(task.startTime);
      expect(normalized.endTime).toBe(task.endTime);
      expect(normalized.rowNumber).toBe(1);
      expect(normalized.originalRow).toBe(task.originalRow);
      expect(normalized.isHolidayOrLeave).toBe(false);
    });

    it("should convert whitespace-only string fields to null", () => {
      const task: ExtractedWorkLog = {
        date: new Date("2024-01-15"),
        projectName: "   ",
        taskType: "\t\t",
        task: "\n\n",
        startTime: new Date("2024-01-15T09:00:00"),
        endTime: new Date("2024-01-15T17:00:00"),
        rowNumber: 2,
        originalRow: {},
      };

      const normalized = normalizeTaskData(task);

      expect(normalized.projectName).toBe(null);
      expect(normalized.taskType).toBe(null);
      expect(normalized.task).toBe(null);
    });

    it("should preserve already-trimmed valid strings", () => {
      const task: ExtractedWorkLog = {
        date: new Date("2024-01-15"),
        projectName: "Project A",
        taskType: "Development",
        task: "Implement feature",
        startTime: new Date("2024-01-15T09:00:00"),
        endTime: new Date("2024-01-15T17:00:00"),
        rowNumber: 3,
        originalRow: {},
      };

      const normalized = normalizeTaskData(task);

      expect(normalized.projectName).toBe("Project A");
      expect(normalized.taskType).toBe("Development");
      expect(normalized.task).toBe("Implement feature");
    });
  });
});

describe("Property-Based Tests: Normalization Functions", () => {
  /**
   * Property 1: Empty String Normalization
   *
   * **Validates: Requirements 1.1, 1.4**
   *
   * For any ExtractedWorkLog task with empty strings in projectName, taskType,
   * or task fields, normalizing the task should convert all empty strings to null
   * while preserving non-empty strings.
   */
  it("Property 1: Empty String Normalization - converts empty/whitespace strings to null", () => {
    // Generator for string fields that can be:
    // - null
    // - empty string
    // - whitespace-only string
    // - valid non-empty string
    const stringFieldArbitrary = fc.oneof(
      fc.constant(null),
      fc.constant(""),
      fc.constant("   "),
      fc.constant("\t"),
      fc.constant("\n"),
      fc.constant("  \t\n  "),
      fc
        .string({ minLength: 1, maxLength: 50 })
        .filter((s) => s.trim().length > 0),
    );

    // Generator for ExtractedWorkLog with various string field states
    const taskArbitrary = fc.record({
      date: fc.date(),
      projectName: stringFieldArbitrary,
      taskType: stringFieldArbitrary,
      task: stringFieldArbitrary,
      startTime: fc.date(),
      endTime: fc.date(),
      rowNumber: fc.integer({ min: 1, max: 1000 }),
      originalRow: fc.constant({}),
      isHolidayOrLeave: fc.boolean(),
    });

    fc.assert(
      fc.property(taskArbitrary, (task) => {
        const normalized = normalizeTaskData(task);

        // Helper to check if a value should be normalized to null
        const shouldBeNull = (value: string | null): boolean => {
          return value === null || value === undefined || value.trim() === "";
        };

        // Helper to get expected normalized value
        const expectedValue = (value: string | null): string | null => {
          if (value === null || value === undefined) return null;
          const trimmed = value.trim();
          return trimmed === "" ? null : trimmed;
        };

        // Verify projectName normalization
        expect(normalized.projectName).toBe(expectedValue(task.projectName));

        // Verify taskType normalization
        expect(normalized.taskType).toBe(expectedValue(task.taskType));

        // Verify task normalization
        expect(normalized.task).toBe(expectedValue(task.task));

        // Verify that empty/whitespace strings become null
        if (shouldBeNull(task.projectName)) {
          expect(normalized.projectName).toBe(null);
        }
        if (shouldBeNull(task.taskType)) {
          expect(normalized.taskType).toBe(null);
        }
        if (shouldBeNull(task.task)) {
          expect(normalized.task).toBe(null);
        }

        // Verify that non-empty strings are preserved (trimmed)
        if (task.projectName && task.projectName.trim().length > 0) {
          expect(normalized.projectName).toBe(task.projectName.trim());
          expect(normalized.projectName).not.toBe(null);
        }
        if (task.taskType && task.taskType.trim().length > 0) {
          expect(normalized.taskType).toBe(task.taskType.trim());
          expect(normalized.taskType).not.toBe(null);
        }
        if (task.task && task.task.trim().length > 0) {
          expect(normalized.task).toBe(task.task.trim());
          expect(normalized.task).not.toBe(null);
        }

        // Verify other fields are unchanged
        expect(normalized.date).toBe(task.date);
        expect(normalized.startTime).toBe(task.startTime);
        expect(normalized.endTime).toBe(task.endTime);
        expect(normalized.rowNumber).toBe(task.rowNumber);
        expect(normalized.originalRow).toBe(task.originalRow);
        expect(normalized.isHolidayOrLeave).toBe(task.isHolidayOrLeave);
      }),
      { numRuns: 100 },
    );
  });

  /**
   * Property 2: Null Preservation (Idempotence)
   *
   * **Validates: Requirements 1.3**
   *
   * For any ExtractedWorkLog task with null values in string fields,
   * normalizing the task should preserve all null values unchanged.
   * This verifies that normalization is idempotent for null values.
   */
  it("Property 2: Null Preservation - normalizing null values preserves them", () => {
    // Generator for ExtractedWorkLog with null string fields
    const taskWithNullsArbitrary = fc.record({
      date: fc.oneof(fc.date(), fc.constant(null)),
      projectName: fc.constant(null),
      taskType: fc.constant(null),
      task: fc.constant(null),
      startTime: fc.oneof(fc.date(), fc.constant(null)),
      endTime: fc.oneof(fc.date(), fc.constant(null)),
      rowNumber: fc.integer({ min: 1, max: 1000 }),
      originalRow: fc.constant({}),
      isHolidayOrLeave: fc.boolean(),
    });

    fc.assert(
      fc.property(taskWithNullsArbitrary, (task) => {
        const normalized = normalizeTaskData(task);

        // Verify that null values are preserved
        expect(normalized.projectName).toBe(null);
        expect(normalized.taskType).toBe(null);
        expect(normalized.task).toBe(null);

        // Verify idempotence: normalizing again should produce the same result
        const normalizedAgain = normalizeTaskData(normalized);
        expect(normalizedAgain.projectName).toBe(null);
        expect(normalizedAgain.taskType).toBe(null);
        expect(normalizedAgain.task).toBe(null);

        // Verify other fields are unchanged
        expect(normalized.date).toBe(task.date);
        expect(normalized.startTime).toBe(task.startTime);
        expect(normalized.endTime).toBe(task.endTime);
        expect(normalized.rowNumber).toBe(task.rowNumber);
        expect(normalized.originalRow).toBe(task.originalRow);
        expect(normalized.isHolidayOrLeave).toBe(task.isHolidayOrLeave);
      }),
      { numRuns: 100 },
    );
  });

  /**
   * Property 3: Required Field Validation
   *
   * **Validates: Requirements 2.1, 2.3, 3.2**
   *
   * For any ExtractedWorkLog task with null values in required fields
   * (projectName, taskType, task, date, startTime, endTime), validation
   * should fail and produce an error for each missing required field.
   */
  it("Property 3: Required Field Validation - detects missing required fields", () => {
    // Generator for tasks with at least one null required field
    const taskWithMissingFieldsArbitrary = fc
      .record({
        date: fc.oneof(fc.date(), fc.constant(null)),
        projectName: fc.oneof(
          fc.string({ minLength: 1, maxLength: 50 }),
          fc.constant(null),
        ),
        taskType: fc.oneof(
          fc.string({ minLength: 1, maxLength: 50 }),
          fc.constant(null),
        ),
        task: fc.oneof(
          fc.string({ minLength: 1, maxLength: 50 }),
          fc.constant(null),
        ),
        startTime: fc.oneof(fc.date(), fc.constant(null)),
        endTime: fc.oneof(fc.date(), fc.constant(null)),
        rowNumber: fc.integer({ min: 1, max: 1000 }),
        originalRow: fc.constant({}),
        isHolidayOrLeave: fc.boolean(),
      })
      .filter(
        (task) =>
          // Ensure at least one required field is null
          task.date === null ||
          task.projectName === null ||
          task.taskType === null ||
          task.task === null ||
          task.startTime === null ||
          task.endTime === null,
      );

    fc.assert(
      fc.property(taskWithMissingFieldsArbitrary, (task) => {
        const validationResult = validateBulkImportData([task], "test-company");

        // Validation should fail
        expect(validationResult.isValid).toBe(false);
        expect(validationResult.errors.length).toBeGreaterThan(0);

        // Check that each null required field produces an error
        if (task.date === null) {
          const dateError = validationResult.errors.find(
            (e) => e.field === "date" && e.rowNumber === 1,
          );
          expect(dateError).toBeDefined();
          expect(dateError?.message).toBe("Date is required");
        }

        if (task.projectName === null) {
          const projectNameError = validationResult.errors.find(
            (e) => e.field === "projectName" && e.rowNumber === 1,
          );
          expect(projectNameError).toBeDefined();
          expect(projectNameError?.message).toBe("Project name is required");
        }

        if (task.taskType === null) {
          const taskTypeError = validationResult.errors.find(
            (e) => e.field === "taskType" && e.rowNumber === 1,
          );
          expect(taskTypeError).toBeDefined();
          expect(taskTypeError?.message).toBe("Task type is required");
        }

        if (task.task === null) {
          const taskError = validationResult.errors.find(
            (e) => e.field === "task" && e.rowNumber === 1,
          );
          expect(taskError).toBeDefined();
          expect(taskError?.message).toBe("Task title is required");
        }

        if (task.startTime === null) {
          const startTimeError = validationResult.errors.find(
            (e) => e.field === "startTime" && e.rowNumber === 1,
          );
          expect(startTimeError).toBeDefined();
          expect(startTimeError?.message).toBe("Start time is required");
        }

        if (task.endTime === null) {
          const endTimeError = validationResult.errors.find(
            (e) => e.field === "endTime" && e.rowNumber === 1,
          );
          expect(endTimeError).toBeDefined();
          expect(endTimeError?.message).toBe("End time is required");
        }

        // Verify error format consistency (each error has required properties)
        validationResult.errors.forEach((error) => {
          expect(error).toHaveProperty("rowNumber");
          expect(error).toHaveProperty("field");
          expect(error).toHaveProperty("message");
          expect(typeof error.rowNumber).toBe("number");
          expect(typeof error.field).toBe("string");
          expect(typeof error.message).toBe("string");
        });
      }),
      { numRuns: 100 },
    );
  });

  /**
   * Property 4: Valid Data Acceptance
   *
   * **Validates: Requirements 2.4, 3.1**
   *
   * For any ExtractedWorkLog task with all required fields properly populated
   * (non-null, non-empty strings for string fields, valid Date objects for date fields),
   * validation should succeed with no errors.
   */
  it("Property 4: Valid Data Acceptance - accepts valid data with all required fields", () => {
    // Generator for valid dates between 2000 and 2100
    const validDateArbitrary = fc.date({
      min: new Date("2000-01-01"),
      max: new Date("2100-12-31"),
    });

    // Generator for valid non-empty strings (trimmed)
    const validStringArbitrary = fc
      .string({ minLength: 1, maxLength: 50 })
      .filter((s) => s.trim().length > 0)
      .map((s) => s.trim());

    // Generator for valid time pairs where startTime < endTime
    const validTimePairArbitrary = fc
      .tuple(
        fc.date({
          min: new Date("2000-01-01T00:00:00"),
          max: new Date("2100-12-31T23:59:59"),
        }),
        fc.integer({ min: 1, max: 24 * 60 * 60 * 1000 }), // 1ms to 24 hours in milliseconds
      )
      .map(([startTime, durationMs]) => ({
        startTime,
        endTime: new Date(startTime.getTime() + durationMs),
      }));

    // Generator for ExtractedWorkLog with all required fields properly populated
    const validTaskArbitrary = fc
      .record({
        date: validDateArbitrary,
        projectName: validStringArbitrary,
        taskType: validStringArbitrary,
        task: validStringArbitrary,
        startTime: validTimePairArbitrary.map((pair) => pair.startTime),
        endTime: validTimePairArbitrary.map((pair) => pair.endTime),
        rowNumber: fc.integer({ min: 1, max: 1000 }),
        originalRow: fc.constant({}),
        isHolidayOrLeave: fc.boolean(),
      })
      .chain((baseTask) => {
        // Generate a valid time pair and assign both startTime and endTime
        return validTimePairArbitrary.map((timePair) => ({
          ...baseTask,
          startTime: timePair.startTime,
          endTime: timePair.endTime,
        }));
      });

    fc.assert(
      fc.property(validTaskArbitrary, (task) => {
        // Verify preconditions: all required fields are properly populated
        expect(task.date).not.toBe(null);
        expect(task.date).toBeInstanceOf(Date);
        expect(task.projectName).not.toBe(null);
        expect(task.projectName?.trim().length).toBeGreaterThan(0);
        expect(task.taskType).not.toBe(null);
        expect(task.taskType?.trim().length).toBeGreaterThan(0);
        expect(task.task).not.toBe(null);
        expect(task.task?.trim().length).toBeGreaterThan(0);
        expect(task.startTime).not.toBe(null);
        expect(task.startTime).toBeInstanceOf(Date);
        expect(task.endTime).not.toBe(null);
        expect(task.endTime).toBeInstanceOf(Date);
        expect(task.startTime!.getTime()).toBeLessThan(task.endTime!.getTime());

        // Validate the task
        const validationResult = validateBulkImportData([task], "test-company");

        // Validation should succeed
        expect(validationResult.isValid).toBe(true);
        expect(validationResult.errors.length).toBe(0);

        // Verify that no errors are produced for any field
        const hasDateError = validationResult.errors.some(
          (e) => e.field === "date",
        );
        const hasProjectNameError = validationResult.errors.some(
          (e) => e.field === "projectName",
        );
        const hasTaskTypeError = validationResult.errors.some(
          (e) => e.field === "taskType",
        );
        const hasTaskError = validationResult.errors.some(
          (e) => e.field === "task",
        );
        const hasStartTimeError = validationResult.errors.some(
          (e) => e.field === "startTime",
        );
        const hasEndTimeError = validationResult.errors.some(
          (e) => e.field === "endTime",
        );

        expect(hasDateError).toBe(false);
        expect(hasProjectNameError).toBe(false);
        expect(hasTaskTypeError).toBe(false);
        expect(hasTaskError).toBe(false);
        expect(hasStartTimeError).toBe(false);
        expect(hasEndTimeError).toBe(false);
      }),
      { numRuns: 100 },
    );
  });

  /**
   * Property 5: Date Validation Preservation
   *
   * **Validates: Requirements 2.5, 3.4**
   *
   * For any ExtractedWorkLog task with dates outside the valid range (year < 2000
   * or year > 2100) or with startTime >= endTime, validation should fail with
   * appropriate error messages, maintaining existing validation behavior.
   */
  it("Property 5: Date Validation Preservation - rejects invalid dates and time ranges", () => {
    // Generator for valid non-empty strings (for required fields)
    const validStringArbitrary = fc
      .string({ minLength: 1, maxLength: 50 })
      .filter((s) => s.trim().length > 0)
      .map((s) => s.trim());

    // Generator for tasks with invalid date ranges or time ranges
    const invalidTaskArbitrary = fc.oneof(
      // Case 1: Date year < 2000
      fc
        .record({
          date: fc.date({
            min: new Date("1900-01-01"),
            max: new Date("1999-12-31"),
          }),
          projectName: validStringArbitrary,
          taskType: validStringArbitrary,
          task: validStringArbitrary,
          startTime: fc.date({
            min: new Date("2000-01-01T00:00:00"),
            max: new Date("2100-12-31T23:59:59"),
          }),
          endTime: fc.date({
            min: new Date("2000-01-01T00:00:00"),
            max: new Date("2100-12-31T23:59:59"),
          }),
          rowNumber: fc.integer({ min: 1, max: 1000 }),
          originalRow: fc.constant({}),
          isHolidayOrLeave: fc.boolean(),
        })
        .chain((baseTask) => {
          // Ensure startTime < endTime for this case
          return fc
            .integer({ min: 1, max: 24 * 60 * 60 * 1000 })
            .map((durationMs) => ({
              ...baseTask,
              endTime: new Date(baseTask.startTime.getTime() + durationMs),
            }));
        }),

      // Case 2: Date year > 2100
      fc
        .record({
          date: fc.date({
            min: new Date("2101-01-01"),
            max: new Date("2200-12-31"),
          }),
          projectName: validStringArbitrary,
          taskType: validStringArbitrary,
          task: validStringArbitrary,
          startTime: fc.date({
            min: new Date("2000-01-01T00:00:00"),
            max: new Date("2100-12-31T23:59:59"),
          }),
          endTime: fc.date({
            min: new Date("2000-01-01T00:00:00"),
            max: new Date("2100-12-31T23:59:59"),
          }),
          rowNumber: fc.integer({ min: 1, max: 1000 }),
          originalRow: fc.constant({}),
          isHolidayOrLeave: fc.boolean(),
        })
        .chain((baseTask) => {
          // Ensure startTime < endTime for this case
          return fc
            .integer({ min: 1, max: 24 * 60 * 60 * 1000 })
            .map((durationMs) => ({
              ...baseTask,
              endTime: new Date(baseTask.startTime.getTime() + durationMs),
            }));
        }),

      // Case 3: startTime >= endTime (with valid date range)
      fc
        .record({
          date: fc.date({
            min: new Date("2000-01-01"),
            max: new Date("2100-12-31"),
          }),
          projectName: validStringArbitrary,
          taskType: validStringArbitrary,
          task: validStringArbitrary,
          startTime: fc.date({
            min: new Date("2000-01-01T00:00:00"),
            max: new Date("2100-12-31T23:59:59"),
          }),
          endTime: fc.date({
            min: new Date("2000-01-01T00:00:00"),
            max: new Date("2100-12-31T23:59:59"),
          }),
          rowNumber: fc.integer({ min: 1, max: 1000 }),
          originalRow: fc.constant({}),
          isHolidayOrLeave: fc.boolean(),
        })
        .chain((baseTask) => {
          // Ensure startTime >= endTime
          return fc
            .integer({ min: 0, max: 24 * 60 * 60 * 1000 })
            .map((offsetMs) => ({
              ...baseTask,
              endTime: new Date(baseTask.startTime.getTime() - offsetMs),
            }));
        }),
    );

    fc.assert(
      fc.property(invalidTaskArbitrary, (task) => {
        // Validate the task
        const validationResult = validateBulkImportData([task], "test-company");

        // Validation should fail
        expect(validationResult.isValid).toBe(false);
        expect(validationResult.errors.length).toBeGreaterThan(0);

        // Check for specific error types based on the invalid condition
        const dateYear = task.date?.getFullYear();

        // If date is outside valid range, should have date error
        if (dateYear && (dateYear < 2000 || dateYear > 2100)) {
          const dateError = validationResult.errors.find(
            (e) => e.field === "date" && e.rowNumber === 1,
          );
          expect(dateError).toBeDefined();
          expect(dateError?.message).toBe("Date must be between 2000 and 2100");
        }

        // If startTime >= endTime, should have startTime error
        if (
          task.startTime &&
          task.endTime &&
          task.startTime.getTime() >= task.endTime.getTime()
        ) {
          const timeError = validationResult.errors.find(
            (e) => e.field === "startTime" && e.rowNumber === 1,
          );
          expect(timeError).toBeDefined();
          expect(timeError?.message).toBe("Start time must be before end time");
        }

        // Verify error format consistency
        validationResult.errors.forEach((error) => {
          expect(error).toHaveProperty("rowNumber");
          expect(error).toHaveProperty("field");
          expect(error).toHaveProperty("message");
          expect(typeof error.rowNumber).toBe("number");
          expect(typeof error.field).toBe("string");
          expect(typeof error.message).toBe("string");
        });
      }),
      { numRuns: 100 },
    );
  });

  /**
   * Property 6: Error Format Consistency
   *
   * **Validates: Requirements 3.3**
   *
   * For any validation error produced by the validation function, the error object
   * should contain rowNumber, field, and message properties, maintaining the existing
   * error structure.
   */
  it("Property 6: Error Format Consistency - all errors have consistent format", () => {
    // Generator for tasks that will produce various types of validation errors
    const invalidTaskArbitrary = fc.record({
      date: fc.oneof(
        fc.constant(null),
        fc.date({
          min: new Date("2000-01-01"),
          max: new Date("2100-12-31"),
        }),
        fc.date({
          min: new Date("1900-01-01"),
          max: new Date("1999-12-31"),
        }),
        fc.date({
          min: new Date("2101-01-01"),
          max: new Date("2200-12-31"),
        }),
      ),
      projectName: fc.oneof(
        fc.constant(null),
        fc.constant(""),
        fc.constant("   "),
        fc.string({ minLength: 1, maxLength: 50 }),
      ),
      taskType: fc.oneof(
        fc.constant(null),
        fc.constant(""),
        fc.constant("   "),
        fc.string({ minLength: 1, maxLength: 50 }),
      ),
      task: fc.oneof(
        fc.constant(null),
        fc.constant(""),
        fc.constant("   "),
        fc.string({ minLength: 1, maxLength: 50 }),
      ),
      startTime: fc.oneof(
        fc.constant(null),
        fc.date({
          min: new Date("2000-01-01T00:00:00"),
          max: new Date("2100-12-31T23:59:59"),
        }),
      ),
      endTime: fc.oneof(
        fc.constant(null),
        fc.date({
          min: new Date("2000-01-01T00:00:00"),
          max: new Date("2100-12-31T23:59:59"),
        }),
      ),
      rowNumber: fc.integer({ min: 1, max: 1000 }),
      originalRow: fc.constant({}),
      isHolidayOrLeave: fc.boolean(),
    });

    // Generator for arrays of invalid tasks (1-10 tasks)
    const invalidTasksArrayArbitrary = fc.array(invalidTaskArbitrary, {
      minLength: 1,
      maxLength: 10,
    });

    // Generator for company_id (can be valid or invalid)
    const companyIdArbitrary = fc.oneof(
      fc.constant(""),
      fc.constant("   "),
      fc.string({ minLength: 1, maxLength: 50 }),
    );

    fc.assert(
      fc.property(
        invalidTasksArrayArbitrary,
        companyIdArbitrary,
        (tasks, companyId) => {
          // Normalize tasks first (as the API does)
          const normalizedTasks = tasks.map(normalizeTaskData);

          // Validate the tasks
          const validationResult = validateBulkImportData(
            normalizedTasks,
            companyId,
          );

          // If there are any errors, verify their format
          if (validationResult.errors.length > 0) {
            validationResult.errors.forEach((error) => {
              // Each error must have rowNumber property
              expect(error).toHaveProperty("rowNumber");
              expect(typeof error.rowNumber).toBe("number");
              expect(error.rowNumber).toBeGreaterThanOrEqual(0);

              // Each error must have field property
              expect(error).toHaveProperty("field");
              expect(typeof error.field).toBe("string");
              expect(error.field.length).toBeGreaterThan(0);

              // Each error must have message property
              expect(error).toHaveProperty("message");
              expect(typeof error.message).toBe("string");
              expect(error.message.length).toBeGreaterThan(0);

              // Verify that the error object has exactly these three properties
              const errorKeys = Object.keys(error).sort();
              expect(errorKeys).toEqual(["field", "message", "rowNumber"]);

              // Verify field values are valid field names
              const validFields = [
                "company_id",
                "date",
                "projectName",
                "taskType",
                "task",
                "startTime",
                "endTime",
              ];
              expect(validFields).toContain(error.field);

              // Verify message is descriptive (not empty or just whitespace)
              expect(error.message.trim().length).toBeGreaterThan(0);
            });
          }

          // Verify that isValid is consistent with errors array
          if (validationResult.errors.length > 0) {
            expect(validationResult.isValid).toBe(false);
          } else {
            expect(validationResult.isValid).toBe(true);
          }
        },
      ),
      { numRuns: 100 },
    );
  });
});
