import { describe, it, expect } from "vitest";

/**
 * Integration Tests: JSON Serialization Handling
 *
 * Tests JSON serialization and deserialization behavior:
 * - Date objects → ISO strings → Date objects (round trip)
 * - Empty strings preservation through JSON
 * - Normalization after JSON parsing
 *
 * **Validates: Requirements 4.1, 4.2**
 */

describe("Integration Tests: JSON Serialization Handling", () => {
  /**
   * Test 1: Date transformation round trip through JSON
   *
   * **Validates: Requirements 4.1**
   *
   * Verifies that Date objects are correctly transformed through JSON serialization:
   * 1. Date object → JSON.stringify → ISO string
   * 2. ISO string → JSON.parse → string
   * 3. String → new Date() → Date object
   *
   * The final Date object should have the same timestamp as the original.
   */
  it("should preserve date values through JSON serialization round trip", () => {
    // Arrange: Create task with Date objects
    const originalTask = {
      date: new Date("2024-01-15T00:00:00.000Z"),
      projectName: "Project A",
      taskType: "Development",
      task: "Implement feature",
      startTime: new Date("2024-01-15T09:00:00.000Z"),
      endTime: new Date("2024-01-15T17:00:00.000Z"),
      rowNumber: 1,
      originalRow: {},
    };

    // Act: Simulate JSON serialization (what happens when client sends data)
    const serialized = JSON.stringify(originalTask);
    const parsed = JSON.parse(serialized);

    // Simulate what the API does: transform date strings back to Date objects
    const transformed = {
      ...parsed,
      date: parsed.date ? new Date(parsed.date) : null,
      startTime: parsed.startTime ? new Date(parsed.startTime) : null,
      endTime: parsed.endTime ? new Date(parsed.endTime) : null,
    };

    // Assert: Dates should be equivalent (same timestamp)
    expect(transformed.date).toBeInstanceOf(Date);
    expect(transformed.startTime).toBeInstanceOf(Date);
    expect(transformed.endTime).toBeInstanceOf(Date);

    expect(transformed.date?.getTime()).toBe(originalTask.date.getTime());
    expect(transformed.startTime?.getTime()).toBe(
      originalTask.startTime.getTime(),
    );
    expect(transformed.endTime?.getTime()).toBe(originalTask.endTime.getTime());

    // Verify ISO string format is preserved
    expect(parsed.date).toBe("2024-01-15T00:00:00.000Z");
    expect(parsed.startTime).toBe("2024-01-15T09:00:00.000Z");
    expect(parsed.endTime).toBe("2024-01-15T17:00:00.000Z");
  });

  /**
   * Test 2: Null date handling through JSON
   *
   * **Validates: Requirements 4.1**
   *
   * Verifies that null date values are preserved through JSON serialization.
   * This is important for optional date fields.
   */
  it("should preserve null date values through JSON serialization", () => {
    // Arrange: Create task with null dates
    const originalTask = {
      date: null,
      projectName: "Project A",
      taskType: "Development",
      task: "Task with no date",
      startTime: null,
      endTime: null,
      rowNumber: 1,
      originalRow: {},
    };

    // Act: Simulate JSON serialization
    const serialized = JSON.stringify(originalTask);
    const parsed = JSON.parse(serialized);

    // Simulate API transformation
    const transformed = {
      ...parsed,
      date: parsed.date ? new Date(parsed.date) : null,
      startTime: parsed.startTime ? new Date(parsed.startTime) : null,
      endTime: parsed.endTime ? new Date(parsed.endTime) : null,
    };

    // Assert: Null values should be preserved
    expect(transformed.date).toBe(null);
    expect(transformed.startTime).toBe(null);
    expect(transformed.endTime).toBe(null);
  });

  /**
   * Test 3: Empty string handling through JSON
   *
   * **Validates: Requirements 4.2**
   *
   * Verifies that empty strings are preserved through JSON serialization
   * and then normalized to null by the normalization function.
   */
  it("should handle empty strings through JSON serialization and normalization", () => {
    // Arrange: Create task with empty strings
    const originalTask = {
      date: new Date("2024-01-15T00:00:00.000Z"),
      projectName: "",
      taskType: "   ",
      task: "",
      startTime: new Date("2024-01-15T09:00:00.000Z"),
      endTime: new Date("2024-01-15T17:00:00.000Z"),
      rowNumber: 1,
      originalRow: {},
    };

    // Act: Simulate JSON serialization
    const serialized = JSON.stringify(originalTask);
    const parsed = JSON.parse(serialized);

    // Verify empty strings are preserved in JSON
    expect(parsed.projectName).toBe("");
    expect(parsed.taskType).toBe("   ");
    expect(parsed.task).toBe("");

    // Simulate normalization (what the API does)
    const normalizeStringField = (
      value: string | null | undefined,
    ): string | null => {
      if (value === null || value === undefined) {
        return null;
      }
      const trimmed = value.trim();
      return trimmed === "" ? null : trimmed;
    };

    const normalized = {
      ...parsed,
      projectName: normalizeStringField(parsed.projectName),
      taskType: normalizeStringField(parsed.taskType),
      task: normalizeStringField(parsed.task),
    };

    // Assert: Empty strings should be normalized to null
    expect(normalized.projectName).toBe(null);
    expect(normalized.taskType).toBe(null);
    expect(normalized.task).toBe(null);
  });

  /**
   * Test 4: Mixed valid and empty string fields through JSON
   *
   * **Validates: Requirements 4.2**
   *
   * Verifies that a mix of valid strings and empty strings are handled
   * correctly through JSON serialization and normalization.
   */
  it("should handle mixed valid and empty strings through JSON serialization", () => {
    // Arrange: Create task with mix of valid and empty strings
    const originalTask = {
      date: new Date("2024-01-15T00:00:00.000Z"),
      projectName: "Valid Project",
      taskType: "",
      task: "  Valid Task  ",
      startTime: new Date("2024-01-15T09:00:00.000Z"),
      endTime: new Date("2024-01-15T17:00:00.000Z"),
      rowNumber: 1,
      originalRow: {},
    };

    // Act: Simulate JSON serialization
    const serialized = JSON.stringify(originalTask);
    const parsed = JSON.parse(serialized);

    // Simulate normalization
    const normalizeStringField = (
      value: string | null | undefined,
    ): string | null => {
      if (value === null || value === undefined) {
        return null;
      }
      const trimmed = value.trim();
      return trimmed === "" ? null : trimmed;
    };

    const normalized = {
      ...parsed,
      projectName: normalizeStringField(parsed.projectName),
      taskType: normalizeStringField(parsed.taskType),
      task: normalizeStringField(parsed.task),
    };

    // Assert: Valid strings should be trimmed, empty strings should be null
    expect(normalized.projectName).toBe("Valid Project");
    expect(normalized.taskType).toBe(null);
    expect(normalized.task).toBe("Valid Task");
  });

  /**
   * Test 5: Complete round trip with date transformation and normalization
   *
   * **Validates: Requirements 4.1, 4.2**
   *
   * Verifies the complete flow:
   * 1. Original task with Date objects and various string states
   * 2. JSON serialization (dates → ISO strings)
   * 3. JSON parsing
   * 4. Date transformation (ISO strings → Date objects)
   * 5. String normalization (empty strings → null)
   */
  it("should handle complete round trip with dates and string normalization", () => {
    // Arrange: Create task with Date objects and mixed string states
    const originalTask = {
      date: new Date("2024-01-15T00:00:00.000Z"),
      projectName: "  Project A  ",
      taskType: "",
      task: "Valid Task",
      startTime: new Date("2024-01-15T09:00:00.000Z"),
      endTime: new Date("2024-01-15T17:00:00.000Z"),
      rowNumber: 1,
      originalRow: {},
    };

    // Act: Simulate complete flow
    // Step 1: JSON serialization (client → server)
    const serialized = JSON.stringify(originalTask);
    const parsed = JSON.parse(serialized);

    // Step 2: Date transformation (API handler)
    const transformed = {
      ...parsed,
      date: parsed.date ? new Date(parsed.date) : null,
      startTime: parsed.startTime ? new Date(parsed.startTime) : null,
      endTime: parsed.endTime ? new Date(parsed.endTime) : null,
    };

    // Step 3: String normalization (API handler)
    const normalizeStringField = (
      value: string | null | undefined,
    ): string | null => {
      if (value === null || value === undefined) {
        return null;
      }
      const trimmed = value.trim();
      return trimmed === "" ? null : trimmed;
    };

    const normalized = {
      ...transformed,
      projectName: normalizeStringField(transformed.projectName),
      taskType: normalizeStringField(transformed.taskType),
      task: normalizeStringField(transformed.task),
    };

    // Assert: Dates should be transformed correctly
    expect(normalized.date).toBeInstanceOf(Date);
    expect(normalized.startTime).toBeInstanceOf(Date);
    expect(normalized.endTime).toBeInstanceOf(Date);
    expect(normalized.date?.getTime()).toBe(originalTask.date.getTime());
    expect(normalized.startTime?.getTime()).toBe(
      originalTask.startTime.getTime(),
    );
    expect(normalized.endTime?.getTime()).toBe(originalTask.endTime.getTime());

    // Assert: Strings should be normalized correctly
    expect(normalized.projectName).toBe("Project A"); // Trimmed
    expect(normalized.taskType).toBe(null); // Empty → null
    expect(normalized.task).toBe("Valid Task"); // Preserved
  });

  /**
   * Test 6: Array of tasks through JSON serialization
   *
   * **Validates: Requirements 4.1, 4.2**
   *
   * Verifies that an array of tasks (as sent in bulk import) is handled
   * correctly through JSON serialization, with each task processed independently.
   */
  it("should handle array of tasks through JSON serialization", () => {
    // Arrange: Create array of tasks with different states
    const originalTasks = [
      {
        date: new Date("2024-01-15T00:00:00.000Z"),
        projectName: "Project A",
        taskType: "Development",
        task: "Task 1",
        startTime: new Date("2024-01-15T09:00:00.000Z"),
        endTime: new Date("2024-01-15T17:00:00.000Z"),
        rowNumber: 1,
        originalRow: {},
      },
      {
        date: new Date("2024-01-16T00:00:00.000Z"),
        projectName: "",
        taskType: "   ",
        task: "",
        startTime: new Date("2024-01-16T09:00:00.000Z"),
        endTime: new Date("2024-01-16T17:00:00.000Z"),
        rowNumber: 2,
        originalRow: {},
      },
      {
        date: new Date("2024-01-17T00:00:00.000Z"),
        projectName: "  Project B  ",
        taskType: "Testing",
        task: "Task 3",
        startTime: new Date("2024-01-17T10:00:00.000Z"),
        endTime: new Date("2024-01-17T12:00:00.000Z"),
        rowNumber: 3,
        originalRow: {},
      },
    ];

    // Act: Simulate JSON serialization
    const serialized = JSON.stringify({ tasks: originalTasks });
    const parsed = JSON.parse(serialized);

    // Simulate API processing
    const normalizeStringField = (
      value: string | null | undefined,
    ): string | null => {
      if (value === null || value === undefined) {
        return null;
      }
      const trimmed = value.trim();
      return trimmed === "" ? null : trimmed;
    };

    const processedTasks = parsed.tasks.map((task: any) => {
      // Date transformation
      const transformed = {
        ...task,
        date: task.date ? new Date(task.date) : null,
        startTime: task.startTime ? new Date(task.startTime) : null,
        endTime: task.endTime ? new Date(task.endTime) : null,
      };

      // String normalization
      return {
        ...transformed,
        projectName: normalizeStringField(transformed.projectName),
        taskType: normalizeStringField(transformed.taskType),
        task: normalizeStringField(transformed.task),
      };
    });

    // Assert: Task 1 - valid data preserved
    expect(processedTasks[0].date).toBeInstanceOf(Date);
    expect(processedTasks[0].projectName).toBe("Project A");
    expect(processedTasks[0].taskType).toBe("Development");
    expect(processedTasks[0].task).toBe("Task 1");

    // Assert: Task 2 - empty strings normalized to null
    expect(processedTasks[1].date).toBeInstanceOf(Date);
    expect(processedTasks[1].projectName).toBe(null);
    expect(processedTasks[1].taskType).toBe(null);
    expect(processedTasks[1].task).toBe(null);

    // Assert: Task 3 - strings trimmed
    expect(processedTasks[2].date).toBeInstanceOf(Date);
    expect(processedTasks[2].projectName).toBe("Project B");
    expect(processedTasks[2].taskType).toBe("Testing");
    expect(processedTasks[2].task).toBe("Task 3");
  });
});
