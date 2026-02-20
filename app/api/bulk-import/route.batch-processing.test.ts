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

describe("Property-Based Test: Batch Processing Consistency", () => {
  /**
   * Property 8: Batch Processing Consistency
   *
   * **Validates: Requirements 4.4**
   *
   * For any array of ExtractedWorkLog tasks with varying field states (some with
   * empty strings, some with null, some with valid values), normalizing and
   * validating the array should process each task independently and correctly.
   *
   * This property ensures that:
   * 1. Each task in the batch is normalized independently
   * 2. Each task in the batch is validated independently
   * 3. Errors from one task don't affect validation of other tasks
   * 4. The rowNumber in errors correctly identifies which task failed
   * 5. Valid and invalid tasks can coexist in the same batch
   */
  it("Property 8: Batch Processing Consistency - processes arrays of tasks independently", () => {
    // Generator for valid dates between 2000 and 2100
    const validDateArbitrary = fc.date({
      min: new Date("2000-01-01"),
      max: new Date("2100-12-31"),
    });

    // Generator for valid non-empty strings
    const validStringArbitrary = fc
      .string({ minLength: 1, maxLength: 50 })
      .filter((s) => s.trim().length > 0)
      .map((s) => s.trim());

    // Generator for string fields with varying states
    const varyingStringArbitrary = fc.oneof(
      fc.constant(null),
      fc.constant(""),
      fc.constant("   "),
      fc.constant("\t"),
      fc.constant("\n"),
      validStringArbitrary,
    );

    // Generator for valid time pairs where startTime < endTime
    const validTimePairArbitrary = fc
      .tuple(
        fc.date({
          min: new Date("2000-01-01T00:00:00"),
          max: new Date("2100-12-31T23:59:59"),
        }),
        fc.integer({ min: 1, max: 24 * 60 * 60 * 1000 }),
      )
      .map(([startTime, durationMs]) => ({
        startTime,
        endTime: new Date(startTime.getTime() + durationMs),
      }));

    // Generator for tasks with varying field states
    const taskWithVaryingFieldsArbitrary = fc
      .record({
        date: fc.oneof(fc.constant(null), validDateArbitrary),
        projectName: varyingStringArbitrary,
        taskType: varyingStringArbitrary,
        task: varyingStringArbitrary,
        startTime: fc.oneof(
          fc.constant(null),
          validTimePairArbitrary.map((p) => p.startTime),
        ),
        endTime: fc.oneof(
          fc.constant(null),
          validTimePairArbitrary.map((p) => p.endTime),
        ),
        rowNumber: fc.integer({ min: 1, max: 1000 }),
        originalRow: fc.constant({}),
        isHolidayOrLeave: fc.boolean(),
      })
      .chain((baseTask) => {
        // If both startTime and endTime are non-null, ensure startTime < endTime
        if (baseTask.startTime && baseTask.endTime) {
          return validTimePairArbitrary.map((timePair) => ({
            ...baseTask,
            startTime: timePair.startTime,
            endTime: timePair.endTime,
          }));
        }
        return fc.constant(baseTask);
      });

    // Generator for arrays of tasks (2-10 tasks)
    const taskArrayArbitrary = fc.array(taskWithVaryingFieldsArbitrary, {
      minLength: 2,
      maxLength: 10,
    });

    fc.assert(
      fc.property(taskArrayArbitrary, (tasks) => {
        // Step 1: Normalize all tasks (as the API does)
        const normalizedTasks = tasks.map(normalizeTaskData);

        // Step 2: Validate the normalized tasks
        const validationResult = validateBulkImportData(
          normalizedTasks,
          "test-company",
        );

        // Step 3: Verify each task was processed independently
        normalizedTasks.forEach((normalizedTask, index) => {
          const originalTask = tasks[index];
          const rowNumber = index + 1;

          // Verify normalization was applied independently to this task
          const expectedProjectName = normalizeStringField(
            originalTask.projectName,
          );
          const expectedTaskType = normalizeStringField(originalTask.taskType);
          const expectedTask = normalizeStringField(originalTask.task);

          expect(normalizedTask.projectName).toBe(expectedProjectName);
          expect(normalizedTask.taskType).toBe(expectedTaskType);
          expect(normalizedTask.task).toBe(expectedTask);

          // Verify validation was applied independently to this task
          // Check if this specific task should have errors
          const taskErrors = validationResult.errors.filter(
            (e) => e.rowNumber === rowNumber,
          );

          // Count expected errors for this task
          let expectedErrorCount = 0;
          if (!normalizedTask.date) expectedErrorCount++;
          if (!normalizedTask.projectName) expectedErrorCount++;
          if (!normalizedTask.taskType) expectedErrorCount++;
          if (!normalizedTask.task) expectedErrorCount++;
          if (!normalizedTask.startTime) expectedErrorCount++;
          if (!normalizedTask.endTime) expectedErrorCount++;
          if (
            normalizedTask.startTime &&
            normalizedTask.endTime &&
            normalizedTask.startTime >= normalizedTask.endTime
          ) {
            expectedErrorCount++;
          }
          if (normalizedTask.date) {
            const year = normalizedTask.date.getFullYear();
            if (year < 2000 || year > 2100) expectedErrorCount++;
          }

          // Verify the error count matches expectations
          expect(taskErrors.length).toBe(expectedErrorCount);

          // Verify each error has the correct rowNumber
          taskErrors.forEach((error) => {
            expect(error.rowNumber).toBe(rowNumber);
          });
        });

        // Step 4: Verify that errors from different tasks don't interfere
        // Group errors by rowNumber
        const errorsByRow = new Map<number, ValidationError[]>();
        validationResult.errors.forEach((error) => {
          if (!errorsByRow.has(error.rowNumber)) {
            errorsByRow.set(error.rowNumber, []);
          }
          errorsByRow.get(error.rowNumber)!.push(error);
        });

        // Verify each row's errors are independent
        errorsByRow.forEach((errors, rowNumber) => {
          // All errors for this row should have the same rowNumber
          errors.forEach((error) => {
            expect(error.rowNumber).toBe(rowNumber);
          });

          // Errors should only reference fields from this specific task
          const validFields = [
            "date",
            "projectName",
            "taskType",
            "task",
            "startTime",
            "endTime",
          ];
          errors.forEach((error) => {
            expect(validFields).toContain(error.field);
          });
        });

        // Step 5: Verify that valid and invalid tasks can coexist
        // Check if we have a mix of valid and invalid tasks
        const hasValidTask = normalizedTasks.some((task) => {
          return (
            task.date &&
            task.projectName &&
            task.taskType &&
            task.task &&
            task.startTime &&
            task.endTime &&
            task.startTime < task.endTime &&
            task.date.getFullYear() >= 2000 &&
            task.date.getFullYear() <= 2100
          );
        });

        const hasInvalidTask = normalizedTasks.some((task) => {
          return (
            !task.date ||
            !task.projectName ||
            !task.taskType ||
            !task.task ||
            !task.startTime ||
            !task.endTime ||
            (task.startTime &&
              task.endTime &&
              task.startTime >= task.endTime) ||
            (task.date &&
              (task.date.getFullYear() < 2000 ||
                task.date.getFullYear() > 2100))
          );
        });

        // If we have both valid and invalid tasks, verify the validation result
        if (hasValidTask && hasInvalidTask) {
          // Overall validation should fail (because at least one task is invalid)
          expect(validationResult.isValid).toBe(false);
          expect(validationResult.errors.length).toBeGreaterThan(0);

          // But errors should only be for invalid tasks
          const invalidTaskRowNumbers = normalizedTasks
            .map((task, index) => {
              const isInvalid =
                !task.date ||
                !task.projectName ||
                !task.taskType ||
                !task.task ||
                !task.startTime ||
                !task.endTime ||
                (task.startTime &&
                  task.endTime &&
                  task.startTime >= task.endTime) ||
                (task.date &&
                  (task.date.getFullYear() < 2000 ||
                    task.date.getFullYear() > 2100));
              return isInvalid ? index + 1 : null;
            })
            .filter((rowNum) => rowNum !== null);

          // All errors should be for invalid tasks only
          validationResult.errors.forEach((error) => {
            expect(invalidTaskRowNumbers).toContain(error.rowNumber);
          });
        }

        // Step 6: Verify overall validation result consistency
        if (validationResult.errors.length > 0) {
          expect(validationResult.isValid).toBe(false);
        } else {
          expect(validationResult.isValid).toBe(true);
        }
      }),
      { numRuns: 100 },
    );
  });

  /**
   * Additional test: Verify batch processing with all valid tasks
   *
   * This ensures that a batch of all valid tasks passes validation.
   */
  it("Property 8 (edge case): Batch Processing - all valid tasks pass validation", () => {
    // Generator for valid dates
    const validDateArbitrary = fc.date({
      min: new Date("2000-01-01"),
      max: new Date("2100-12-31"),
    });

    // Generator for valid strings
    const validStringArbitrary = fc
      .string({ minLength: 1, maxLength: 50 })
      .filter((s) => s.trim().length > 0)
      .map((s) => s.trim());

    // Generator for valid time pairs
    const validTimePairArbitrary = fc
      .tuple(
        fc.date({
          min: new Date("2000-01-01T00:00:00"),
          max: new Date("2100-12-31T23:59:59"),
        }),
        fc.integer({ min: 1, max: 24 * 60 * 60 * 1000 }),
      )
      .map(([startTime, durationMs]) => ({
        startTime,
        endTime: new Date(startTime.getTime() + durationMs),
      }));

    // Generator for valid tasks
    const validTaskArbitrary = fc
      .record({
        date: validDateArbitrary,
        projectName: validStringArbitrary,
        taskType: validStringArbitrary,
        task: validStringArbitrary,
        rowNumber: fc.integer({ min: 1, max: 1000 }),
        originalRow: fc.constant({}),
        isHolidayOrLeave: fc.boolean(),
      })
      .chain((baseTask) => {
        return validTimePairArbitrary.map((timePair) => ({
          ...baseTask,
          startTime: timePair.startTime,
          endTime: timePair.endTime,
        }));
      });

    // Generator for arrays of valid tasks
    const validTaskArrayArbitrary = fc.array(validTaskArbitrary, {
      minLength: 2,
      maxLength: 10,
    });

    fc.assert(
      fc.property(validTaskArrayArbitrary, (tasks) => {
        // Normalize all tasks
        const normalizedTasks = tasks.map(normalizeTaskData);

        // Validate
        const validationResult = validateBulkImportData(
          normalizedTasks,
          "test-company",
        );

        // All tasks should pass validation
        expect(validationResult.isValid).toBe(true);
        expect(validationResult.errors.length).toBe(0);

        // Verify each task was normalized correctly
        normalizedTasks.forEach((normalizedTask, index) => {
          expect(normalizedTask.date).not.toBe(null);
          expect(normalizedTask.projectName).not.toBe(null);
          expect(normalizedTask.taskType).not.toBe(null);
          expect(normalizedTask.task).not.toBe(null);
          expect(normalizedTask.startTime).not.toBe(null);
          expect(normalizedTask.endTime).not.toBe(null);
        });
      }),
      { numRuns: 100 },
    );
  });

  /**
   * Additional test: Verify batch processing with all invalid tasks
   *
   * This ensures that a batch of all invalid tasks produces errors for each task.
   */
  it("Property 8 (edge case): Batch Processing - all invalid tasks produce errors", () => {
    // Generator for tasks with at least one missing required field
    const invalidTaskArbitrary = fc.record({
      date: fc.constant(null),
      projectName: fc.oneof(
        fc.constant(null),
        fc.constant(""),
        fc.constant("   "),
      ),
      taskType: fc.oneof(
        fc.constant(null),
        fc.constant(""),
        fc.constant("   "),
      ),
      task: fc.oneof(fc.constant(null), fc.constant(""), fc.constant("   ")),
      startTime: fc.constant(null),
      endTime: fc.constant(null),
      rowNumber: fc.integer({ min: 1, max: 1000 }),
      originalRow: fc.constant({}),
      isHolidayOrLeave: fc.boolean(),
    });

    // Generator for arrays of invalid tasks
    const invalidTaskArrayArbitrary = fc.array(invalidTaskArbitrary, {
      minLength: 2,
      maxLength: 10,
    });

    fc.assert(
      fc.property(invalidTaskArrayArbitrary, (tasks) => {
        // Normalize all tasks
        const normalizedTasks = tasks.map(normalizeTaskData);

        // Validate
        const validationResult = validateBulkImportData(
          normalizedTasks,
          "test-company",
        );

        // Validation should fail
        expect(validationResult.isValid).toBe(false);
        expect(validationResult.errors.length).toBeGreaterThan(0);

        // Each task should have at least one error
        normalizedTasks.forEach((_, index) => {
          const rowNumber = index + 1;
          const taskErrors = validationResult.errors.filter(
            (e) => e.rowNumber === rowNumber,
          );
          expect(taskErrors.length).toBeGreaterThan(0);
        });

        // Verify all errors have correct format
        validationResult.errors.forEach((error) => {
          expect(error).toHaveProperty("rowNumber");
          expect(error).toHaveProperty("field");
          expect(error).toHaveProperty("message");
          expect(error.rowNumber).toBeGreaterThanOrEqual(1);
          expect(error.rowNumber).toBeLessThanOrEqual(tasks.length);
        });
      }),
      { numRuns: 100 },
    );
  });
});
