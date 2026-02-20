/**
 * Script to generate a test Excel file with 100+ rows for manual testing
 *
 * Usage: node generate-test-excel.ts
 * Output: test-data-120-rows.xlsx
 */

import ExcelJS from "exceljs";
import { writeFileSync } from "fs";
import { join } from "path";

async function generateTestExcel() {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet("Work Logs");

  // Add headers
  worksheet.columns = [
    { header: "Date", key: "date", width: 12 },
    { header: "Project", key: "project", width: 20 },
    { header: "Type", key: "taskType", width: 15 },
    { header: "Description", key: "description", width: 40 },
    { header: "Start Time", key: "startTime", width: 12 },
    { header: "End Time", key: "endTime", width: 12 },
  ];

  // Generate 120 rows of test data
  const projects = [
    "Project Alpha",
    "Project Beta",
    "Project Gamma",
    "Project Delta",
    "Project Epsilon",
  ];

  const taskTypes = ["Dev", "Test", "Docs", "Meeting", "Review"];

  const descriptions = [
    "Implemented new authentication feature",
    "Fixed bug in user profile page",
    "Updated API documentation",
    "Team standup meeting",
    "Code review for pull request #123",
    "Refactored database queries",
    "Added unit tests for payment module",
    "Updated deployment scripts",
    "Client meeting to discuss requirements",
    "Performance optimization",
  ];

  const baseDate = new Date(2024, 0, 1); // January 1, 2024

  for (let i = 0; i < 120; i++) {
    const date = new Date(baseDate);
    date.setDate(baseDate.getDate() + Math.floor(i / 4)); // 4 entries per day

    const startHour = 9 + (i % 8);
    const startMinute = (i % 4) * 15; // 0, 15, 30, 45
    const duration = 1 + (i % 3); // 1, 2, or 3 hours

    const startTime = new Date(date);
    startTime.setHours(startHour, startMinute, 0, 0);

    const endTime = new Date(startTime);
    endTime.setHours(startTime.getHours() + duration, startMinute, 0, 0);

    worksheet.addRow({
      date: date.toLocaleDateString("en-GB"), // DD/MM/YYYY format
      project: projects[i % projects.length],
      taskType: taskTypes[i % taskTypes.length],
      description: descriptions[i % descriptions.length],
      startTime: startTime.toLocaleTimeString("en-GB", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      }),
      endTime: endTime.toLocaleTimeString("en-GB", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      }),
    });
  }

  // Add some edge cases
  // Row with empty project name
  worksheet.addRow({
    date: "15/01/2024",
    project: "",
    taskType: "Dev",
    description: "Testing empty project name",
    startTime: "09:00",
    endTime: "10:00",
  });

  // Row with empty task type
  worksheet.addRow({
    date: "15/01/2024",
    project: "Project Alpha",
    taskType: "",
    description: "Testing empty task type",
    startTime: "10:00",
    endTime: "11:00",
  });

  // Row with very long description
  worksheet.addRow({
    date: "15/01/2024",
    project: "Project Beta",
    taskType: "Dev",
    description:
      "This is a very long description that tests how the system handles lengthy text entries. It includes multiple sentences and should wrap properly in the UI. We want to ensure that long descriptions don't break the layout or cause performance issues.",
    startTime: "11:00",
    endTime: "12:00",
  });

  // Row with same start and end time (should trigger validation error)
  worksheet.addRow({
    date: "15/01/2024",
    project: "Project Gamma",
    taskType: "Meeting",
    description: "Testing same start and end time",
    startTime: "14:00",
    endTime: "14:00",
  });

  // Row with end time before start time (should trigger validation error)
  worksheet.addRow({
    date: "15/01/2024",
    project: "Project Delta",
    taskType: "Review",
    description: "Testing end time before start time",
    startTime: "15:00",
    endTime: "14:00",
  });

  // Style the header row
  worksheet.getRow(1).font = { bold: true };
  worksheet.getRow(1).fill = {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: "FFE0E0E0" },
  };

  // Save the file
  const buffer = await workbook.xlsx.writeBuffer();
  const outputPath = join(process.cwd(), "test-data-120-rows.xlsx");
  writeFileSync(outputPath, buffer);

  console.log(`✅ Test Excel file generated: ${outputPath}`);
  console.log(`📊 Total rows: 125 (120 normal + 5 edge cases)`);
  console.log(`\nEdge cases included:`);
  console.log(`  - Empty project name`);
  console.log(`  - Empty task type`);
  console.log(`  - Very long description`);
  console.log(`  - Same start and end time (validation error)`);
  console.log(`  - End time before start time (validation error)`);
}

generateTestExcel().catch(console.error);
