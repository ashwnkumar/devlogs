import { describe, it, expect } from "vitest";

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

/**
 * Unit Tests: Validation Error Messages
 *
 * Requirements: 2.3, 2.5
 *
 * Tests specific validation error messages and boundary cases:
 * - Each required field produces correct error message
 * - Date range boundaries (1999, 2000, 2100, 2101)
 * - Time range validation (start >= end)
 */
describe("Unit Tests: Validation Error Messages", () => {
  /**
   * Helper function to create a valid task for testing
   */
  const createValidTask = (
    overrides?: Partial<ExtractedWorkLog>,
  ): ExtractedWorkLog => {
    return {
      date: new Date("2024-01-15"),
      projectName: "Project A",
      taskType: "Development",
      task: "Implement feature",
      startTime: new Date("2024-01-15T09:00:00"),
      endTime: new Date("2024-01-15T17:00:00"),
      rowNumber: 1,
      originalRow: {},
      ...overrides,
    };
  };

  describe("Required Field Error Messages", () => {
    it("should produce correct error message for missing date", () => {
      const task = createValidTask({ date: null });
      const result = validateBulkImportData([task], "test-company");

      expect(result.isValid).toBe(false);
      const dateError = result.errors.find((e) => e.field === "date");
      expect(dateError).toBeDefined();
      expect(dateError?.message).toBe("Date is required");
      expect(dateError?.rowNumber).toBe(1);
    });

    it("should produce correct error message for missing projectName", () => {
      const task = createValidTask({ projectName: null });
      const result = validateBulkImportData([task], "test-company");

      expect(result.isValid).toBe(false);
      const error = result.errors.find((e) => e.field === "projectName");
      expect(error).toBeDefined();
      expect(error?.message).toBe("Project name is required");
      expect(error?.rowNumber).toBe(1);
    });

    it("should produce correct error message for missing taskType", () => {
      const task = createValidTask({ taskType: null });
      const result = validateBulkImportData([task], "test-company");

      expect(result.isValid).toBe(false);
      const error = result.errors.find((e) => e.field === "taskType");
      expect(error).toBeDefined();
      expect(error?.message).toBe("Task type is required");
      expect(error?.rowNumber).toBe(1);
    });

    it("should produce correct error message for missing task", () => {
      const task = createValidTask({ task: null });
      const result = validateBulkImportData([task], "test-company");

      expect(result.isValid).toBe(false);
      const error = result.errors.find((e) => e.field === "task");
      expect(error).toBeDefined();
      expect(error?.message).toBe("Task title is required");
      expect(error?.rowNumber).toBe(1);
    });

    it("should produce correct error message for missing startTime", () => {
      const task = createValidTask({ startTime: null });
      const result = validateBulkImportData([task], "test-company");

      expect(result.isValid).toBe(false);
      const error = result.errors.find((e) => e.field === "startTime");
      expect(error).toBeDefined();
      expect(error?.message).toBe("Start time is required");
      expect(error?.rowNumber).toBe(1);
    });

    it("should produce correct error message for missing endTime", () => {
      const task = createValidTask({ endTime: null });
      const result = validateBulkImportData([task], "test-company");

      expect(result.isValid).toBe(false);
      const error = result.errors.find((e) => e.field === "endTime");
      expect(error).toBeDefined();
      expect(error?.message).toBe("End time is required");
      expect(error?.rowNumber).toBe(1);
    });

    it("should produce correct error message for missing company_id", () => {
      const task = createValidTask();
      const result = validateBulkImportData([task], "");

      expect(result.isValid).toBe(false);
      const error = result.errors.find((e) => e.field === "company_id");
      expect(error).toBeDefined();
      expect(error?.message).toBe("Company ID is required");
      expect(error?.rowNumber).toBe(0);
    });

    it("should produce multiple error messages when multiple fields are missing", () => {
      const task = createValidTask({
        date: null,
        projectName: null,
        taskType: null,
      });
      const result = validateBulkImportData([task], "test-company");

      expect(result.isValid).toBe(false);
      expect(result.errors.length).toBe(3);

      const dateError = result.errors.find((e) => e.field === "date");
      const projectError = result.errors.find((e) => e.field === "projectName");
      const taskTypeError = result.errors.find((e) => e.field === "taskType");

      expect(dateError?.message).toBe("Date is required");
      expect(projectError?.message).toBe("Project name is required");
      expect(taskTypeError?.message).toBe("Task type is required");
    });
  });

  describe("Date Range Boundary Validation", () => {
    it("should reject date with year 1999 (below minimum)", () => {
      const task = createValidTask({ date: new Date("1999-12-31") });
      const result = validateBulkImportData([task], "test-company");

      expect(result.isValid).toBe(false);
      const dateError = result.errors.find((e) => e.field === "date");
      expect(dateError).toBeDefined();
      expect(dateError?.message).toBe("Date must be between 2000 and 2100");
      expect(dateError?.rowNumber).toBe(1);
    });

    it("should accept date with year 2000 (minimum boundary)", () => {
      const task = createValidTask({ date: new Date("2000-01-01") });
      const result = validateBulkImportData([task], "test-company");

      expect(result.isValid).toBe(true);
      expect(result.errors.length).toBe(0);
    });

    it("should accept date with year 2100 (maximum boundary)", () => {
      const task = createValidTask({ date: new Date("2100-12-31") });
      const result = validateBulkImportData([task], "test-company");

      expect(result.isValid).toBe(true);
      expect(result.errors.length).toBe(0);
    });

    it("should reject date with year 2101 (above maximum)", () => {
      const task = createValidTask({ date: new Date("2101-01-01") });
      const result = validateBulkImportData([task], "test-company");

      expect(result.isValid).toBe(false);
      const dateError = result.errors.find((e) => e.field === "date");
      expect(dateError).toBeDefined();
      expect(dateError?.message).toBe("Date must be between 2000 and 2100");
      expect(dateError?.rowNumber).toBe(1);
    });

    it("should accept dates within valid range (2000-2100)", () => {
      const validYears = [2000, 2024, 2050, 2100];

      validYears.forEach((year) => {
        const task = createValidTask({ date: new Date(`${year}-06-15`) });
        const result = validateBulkImportData([task], "test-company");

        expect(result.isValid).toBe(true);
        expect(result.errors.length).toBe(0);
      });
    });

    it("should reject dates outside valid range", () => {
      const invalidYears = [1999, 1900, 2101, 2200];

      invalidYears.forEach((year) => {
        const task = createValidTask({ date: new Date(`${year}-06-15`) });
        const result = validateBulkImportData([task], "test-company");

        expect(result.isValid).toBe(false);
        const dateError = result.errors.find((e) => e.field === "date");
        expect(dateError).toBeDefined();
        expect(dateError?.message).toBe("Date must be between 2000 and 2100");
      });
    });
  });

  describe("Time Range Validation", () => {
    it("should reject when startTime equals endTime", () => {
      const sameTime = new Date("2024-01-15T09:00:00");
      const task = createValidTask({
        startTime: sameTime,
        endTime: sameTime,
      });
      const result = validateBulkImportData([task], "test-company");

      expect(result.isValid).toBe(false);
      const timeError = result.errors.find((e) => e.field === "startTime");
      expect(timeError).toBeDefined();
      expect(timeError?.message).toBe("Start time must be before end time");
      expect(timeError?.rowNumber).toBe(1);
    });

    it("should reject when startTime is after endTime", () => {
      const task = createValidTask({
        startTime: new Date("2024-01-15T17:00:00"),
        endTime: new Date("2024-01-15T09:00:00"),
      });
      const result = validateBulkImportData([task], "test-company");

      expect(result.isValid).toBe(false);
      const timeError = result.errors.find((e) => e.field === "startTime");
      expect(timeError).toBeDefined();
      expect(timeError?.message).toBe("Start time must be before end time");
      expect(timeError?.rowNumber).toBe(1);
    });

    it("should accept when startTime is before endTime", () => {
      const task = createValidTask({
        startTime: new Date("2024-01-15T09:00:00"),
        endTime: new Date("2024-01-15T17:00:00"),
      });
      const result = validateBulkImportData([task], "test-company");

      expect(result.isValid).toBe(true);
      expect(result.errors.length).toBe(0);
    });

    it("should accept when startTime is 1 millisecond before endTime", () => {
      const startTime = new Date("2024-01-15T09:00:00.000");
      const endTime = new Date("2024-01-15T09:00:00.001");
      const task = createValidTask({ startTime, endTime });
      const result = validateBulkImportData([task], "test-company");

      expect(result.isValid).toBe(true);
      expect(result.errors.length).toBe(0);
    });

    it("should reject when startTime is 1 millisecond after endTime", () => {
      const startTime = new Date("2024-01-15T09:00:00.001");
      const endTime = new Date("2024-01-15T09:00:00.000");
      const task = createValidTask({ startTime, endTime });
      const result = validateBulkImportData([task], "test-company");

      expect(result.isValid).toBe(false);
      const timeError = result.errors.find((e) => e.field === "startTime");
      expect(timeError).toBeDefined();
      expect(timeError?.message).toBe("Start time must be before end time");
    });
  });

  describe("Error Format Consistency", () => {
    it("should include rowNumber, field, and message in all errors", () => {
      const task = createValidTask({
        date: null,
        projectName: null,
        startTime: null,
      });
      const result = validateBulkImportData([task], "test-company");

      expect(result.isValid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);

      result.errors.forEach((error) => {
        expect(error).toHaveProperty("rowNumber");
        expect(error).toHaveProperty("field");
        expect(error).toHaveProperty("message");
        expect(typeof error.rowNumber).toBe("number");
        expect(typeof error.field).toBe("string");
        expect(typeof error.message).toBe("string");
        expect(error.message.length).toBeGreaterThan(0);
      });
    });

    it("should use correct rowNumber for multiple tasks", () => {
      const tasks = [
        createValidTask({ date: null, rowNumber: 1 }),
        createValidTask({ projectName: null, rowNumber: 2 }),
        createValidTask({ taskType: null, rowNumber: 3 }),
      ];
      const result = validateBulkImportData(tasks, "test-company");

      expect(result.isValid).toBe(false);
      expect(result.errors.length).toBe(3);

      const dateError = result.errors.find((e) => e.field === "date");
      const projectError = result.errors.find((e) => e.field === "projectName");
      const taskTypeError = result.errors.find((e) => e.field === "taskType");

      expect(dateError?.rowNumber).toBe(1);
      expect(projectError?.rowNumber).toBe(2);
      expect(taskTypeError?.rowNumber).toBe(3);
    });
  });

  describe("Combined Validation Scenarios", () => {
    it("should report both date range and time range errors", () => {
      const task = createValidTask({
        date: new Date("1999-12-31"),
        startTime: new Date("2024-01-15T17:00:00"),
        endTime: new Date("2024-01-15T09:00:00"),
      });
      const result = validateBulkImportData([task], "test-company");

      expect(result.isValid).toBe(false);
      expect(result.errors.length).toBe(2);

      const dateError = result.errors.find((e) => e.field === "date");
      const timeError = result.errors.find((e) => e.field === "startTime");

      expect(dateError?.message).toBe("Date must be between 2000 and 2100");
      expect(timeError?.message).toBe("Start time must be before end time");
    });

    it("should report all validation errors for completely invalid task", () => {
      const task = createValidTask({
        date: new Date("1999-12-31"),
        projectName: null,
        taskType: null,
        task: null,
        startTime: new Date("2024-01-15T17:00:00"),
        endTime: new Date("2024-01-15T09:00:00"),
      });
      const result = validateBulkImportData([task], "test-company");

      expect(result.isValid).toBe(false);
      expect(result.errors.length).toBe(5); // date range, projectName, taskType, task, time range

      const fields = result.errors.map((e) => e.field);
      expect(fields).toContain("date");
      expect(fields).toContain("projectName");
      expect(fields).toContain("taskType");
      expect(fields).toContain("task");
      expect(fields).toContain("startTime");
    });
  });
});
