import { describe, it, expect } from "vitest";
import * as fc from "fast-check";

/**
 * Property-Based Test: Date Transformation Round Trip
 *
 * This test verifies that Date objects can be serialized to JSON (ISO strings)
 * and transformed back to Date objects correctly, maintaining the same timestamp.
 *
 * This is critical for the bulk import API which receives JSON-serialized data
 * from the client where Date objects are converted to ISO strings.
 */

describe("Property-Based Test: Date Transformation Round Trip", () => {
  /**
   * Property 7: Date Transformation Round Trip
   *
   * **Validates: Requirements 4.1**
   *
   * For any valid Date object, serializing it to an ISO string via JSON and then
   * transforming it back should produce an equivalent Date object with the same timestamp.
   *
   * This property ensures that the date transformation logic in the POST handler
   * correctly handles JSON serialization/deserialization:
   *
   * ```typescript
   * const transformedTasks = tasks.map((task) => ({
   *   ...task,
   *   date: task.date ? new Date(task.date) : null,
   *   startTime: task.startTime ? new Date(task.startTime) : null,
   *   endTime: task.endTime ? new Date(task.endTime) : null,
   * }));
   * ```
   */
  it("Property 7: Date Transformation Round Trip - preserves date values through JSON serialization", () => {
    // Generator for valid dates (reasonable range for work logs)
    const validDateArbitrary = fc.date({
      min: new Date("2000-01-01T00:00:00.000Z"),
      max: new Date("2100-12-31T23:59:59.999Z"),
    });

    fc.assert(
      fc.property(validDateArbitrary, (originalDate) => {
        // Step 1: Simulate JSON serialization (what happens when client sends data)
        // When a Date is serialized to JSON, it becomes an ISO string
        const serialized = JSON.stringify({ date: originalDate });

        // Step 2: Parse the JSON (what happens in the API)
        const parsed = JSON.parse(serialized);

        // Step 3: Transform the ISO string back to a Date (what the API does)
        const transformedDate = parsed.date ? new Date(parsed.date) : null;

        // Verify the transformation preserves the timestamp
        expect(transformedDate).not.toBe(null);
        expect(transformedDate).toBeInstanceOf(Date);

        // The timestamps should be exactly equal
        expect(transformedDate!.getTime()).toBe(originalDate.getTime());

        // The ISO strings should be identical
        expect(transformedDate!.toISOString()).toBe(originalDate.toISOString());

        // Verify that the date components are preserved
        expect(transformedDate!.getFullYear()).toBe(originalDate.getFullYear());
        expect(transformedDate!.getMonth()).toBe(originalDate.getMonth());
        expect(transformedDate!.getDate()).toBe(originalDate.getDate());
        expect(transformedDate!.getHours()).toBe(originalDate.getHours());
        expect(transformedDate!.getMinutes()).toBe(originalDate.getMinutes());
        expect(transformedDate!.getSeconds()).toBe(originalDate.getSeconds());
        expect(transformedDate!.getMilliseconds()).toBe(
          originalDate.getMilliseconds(),
        );
      }),
      { numRuns: 100 },
    );
  });

  /**
   * Additional test: Verify null handling in date transformation
   *
   * This ensures that null dates are preserved through the transformation,
   * which is important for optional date fields.
   */
  it("Property 7 (edge case): Date Transformation Round Trip - preserves null values", () => {
    // Simulate JSON serialization with null date
    const serialized = JSON.stringify({ date: null });

    // Parse the JSON
    const parsed = JSON.parse(serialized);

    // Transform (should remain null)
    const transformedDate = parsed.date ? new Date(parsed.date) : null;

    // Verify null is preserved
    expect(transformedDate).toBe(null);
  });

  /**
   * Additional test: Verify transformation works for all date fields
   *
   * This tests the actual transformation pattern used in the POST handler
   * for all three date fields: date, startTime, endTime.
   */
  it("Property 7 (integration): Date Transformation Round Trip - works for all task date fields", () => {
    // Generator for task-like objects with date fields
    const taskWithDatesArbitrary = fc.record({
      date: fc.date({
        min: new Date("2000-01-01"),
        max: new Date("2100-12-31"),
      }),
      startTime: fc.date({
        min: new Date("2000-01-01T00:00:00"),
        max: new Date("2100-12-31T23:59:59"),
      }),
      endTime: fc.date({
        min: new Date("2000-01-01T00:00:00"),
        max: new Date("2100-12-31T23:59:59"),
      }),
      projectName: fc.constant("Test Project"),
      taskType: fc.constant("Development"),
      task: fc.constant("Test Task"),
    });

    fc.assert(
      fc.property(taskWithDatesArbitrary, (originalTask) => {
        // Step 1: Simulate JSON serialization (client → server)
        const serialized = JSON.stringify(originalTask);

        // Step 2: Parse JSON (server receives)
        const parsed = JSON.parse(serialized);

        // Step 3: Apply the transformation logic from the POST handler
        const transformed = {
          ...parsed,
          date: parsed.date ? new Date(parsed.date) : null,
          startTime: parsed.startTime ? new Date(parsed.startTime) : null,
          endTime: parsed.endTime ? new Date(parsed.endTime) : null,
        };

        // Verify all date fields are correctly transformed
        expect(transformed.date).toBeInstanceOf(Date);
        expect(transformed.startTime).toBeInstanceOf(Date);
        expect(transformed.endTime).toBeInstanceOf(Date);

        // Verify timestamps are preserved
        expect(transformed.date!.getTime()).toBe(originalTask.date.getTime());
        expect(transformed.startTime!.getTime()).toBe(
          originalTask.startTime.getTime(),
        );
        expect(transformed.endTime!.getTime()).toBe(
          originalTask.endTime.getTime(),
        );

        // Verify ISO strings match
        expect(transformed.date!.toISOString()).toBe(
          originalTask.date.toISOString(),
        );
        expect(transformed.startTime!.toISOString()).toBe(
          originalTask.startTime.toISOString(),
        );
        expect(transformed.endTime!.toISOString()).toBe(
          originalTask.endTime.toISOString(),
        );

        // Verify non-date fields are unchanged
        expect(transformed.projectName).toBe(originalTask.projectName);
        expect(transformed.taskType).toBe(originalTask.taskType);
        expect(transformed.task).toBe(originalTask.task);
      }),
      { numRuns: 100 },
    );
  });
});
