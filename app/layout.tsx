import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "DevLogs - Developer Work Logging & Productivity Tracking",
    template: "%s | DevLogs",
  },
  description:
    "DevLogs is a modern work logging and journaling platform built for software engineers. Track daily tasks, time spent, and productivity evolution across projects with intuitive dashboards and analytics.",
  keywords: [
    "developer productivity",
    "work logging",
    "time tracking",
    "developer journal",
    "task management",
    "software engineering",
    "productivity analytics",
    "deep work tracking",
    "project management",
    "developer tools",
  ],
  authors: [{ name: "DevLogs" }],
  creator: "DevLogs",
  openGraph: {
    type: "website",
    locale: "en_US",
    siteName: "DevLogs",
    title: "DevLogs - Developer Work Logging & Productivity Tracking",
    description:
      "Track your daily work, time spent, and long-term productivity evolution with DevLogs - the developer-first journaling platform.",
  },
  twitter: {
    card: "summary_large_image",
    title: "DevLogs - Developer Work Logging & Productivity Tracking",
    description:
      "Track your daily work, time spent, and long-term productivity evolution with DevLogs - the developer-first journaling platform.",
  },
  robots: {
    index: true,
    follow: true,
  },
  viewport: {
    width: "device-width",
    initialScale: 1,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
