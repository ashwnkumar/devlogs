import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { RegisterForm } from "./RegisterForm";
import * as AuthContext from "@/context/AuthContext";

// Mock the AuthContext
vi.mock("@/context/AuthContext", () => ({
  useAuth: vi.fn(),
}));

// Mock sonner toast
vi.mock("sonner", () => ({
  toast: {
    error: vi.fn(),
    success: vi.fn(),
  },
}));

describe("RegisterForm - Validation Logic", () => {
  const mockRegister = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(AuthContext.useAuth).mockReturnValue({
      register: mockRegister,
      user: null,
      login: vi.fn(),
      logout: vi.fn(),
      setSession: vi.fn(),
    });
  });

  describe("Email Validation", () => {
    it("should show 'Email is required' error when email is empty", async () => {
      render(<RegisterForm />);

      const passwords = screen.getAllByPlaceholderText("••••••••");
      const passwordInput = passwords[0];
      const confirmPasswordInput = passwords[1];
      const submitButton = screen.getByRole("button", {
        name: /create account/i,
      });

      // Fill in password fields but leave email empty
      fireEvent.change(passwordInput, { target: { value: "password123" } });
      fireEvent.change(confirmPasswordInput, {
        target: { value: "password123" },
      });

      // Submit the form
      fireEvent.click(submitButton);

      // Check for email error
      expect(screen.getByText("Email is required")).toBeInTheDocument();
    });

    it("should show 'Invalid email format' error when email format is invalid", async () => {
      render(<RegisterForm />);

      const emailInput = screen.getByPlaceholderText("m@example.com");
      const passwords = screen.getAllByPlaceholderText("••••••••");
      const passwordInput = passwords[0];
      const confirmPasswordInput = passwords[1];
      const submitButton = screen.getByRole("button", {
        name: /create account/i,
      });

      // Fill in with invalid email
      fireEvent.change(emailInput, { target: { value: "invalid-email" } });
      fireEvent.change(passwordInput, { target: { value: "password123" } });
      fireEvent.change(confirmPasswordInput, {
        target: { value: "password123" },
      });

      // Submit the form
      fireEvent.click(submitButton);

      // Check for email format error
      expect(screen.getByText("Invalid email format")).toBeInTheDocument();
    });
  });

  describe("Password Validation", () => {
    it("should show 'Password is required' error when password is empty", async () => {
      render(<RegisterForm />);

      const emailInput = screen.getByPlaceholderText("m@example.com");
      const passwords = screen.getAllByPlaceholderText("••••••••");
      const confirmPasswordInput = passwords[1];
      const submitButton = screen.getByRole("button", {
        name: /create account/i,
      });

      // Fill in email and confirm password but leave password empty
      fireEvent.change(emailInput, { target: { value: "test@example.com" } });
      fireEvent.change(confirmPasswordInput, {
        target: { value: "password123" },
      });

      // Submit the form
      fireEvent.click(submitButton);

      // Check for password error
      expect(screen.getByText("Password is required")).toBeInTheDocument();
    });

    it("should show 'Password must be at least 6 characters' error when password is too short", async () => {
      render(<RegisterForm />);

      const emailInput = screen.getByPlaceholderText("m@example.com");
      const passwords = screen.getAllByPlaceholderText("••••••••");
      const passwordInput = passwords[0];
      const confirmPasswordInput = passwords[1];
      const submitButton = screen.getByRole("button", {
        name: /create account/i,
      });

      // Fill in with short password
      fireEvent.change(emailInput, { target: { value: "test@example.com" } });
      fireEvent.change(passwordInput, { target: { value: "12345" } });
      fireEvent.change(confirmPasswordInput, { target: { value: "12345" } });

      // Submit the form
      fireEvent.click(submitButton);

      // Check for password length error
      expect(
        screen.getByText("Password must be at least 6 characters"),
      ).toBeInTheDocument();
    });
  });

  describe("Confirm Password Validation", () => {
    it("should show 'Please confirm your password' error when confirm password is empty", async () => {
      render(<RegisterForm />);

      const emailInput = screen.getByPlaceholderText("m@example.com");
      const passwords = screen.getAllByPlaceholderText("••••••••");
      const passwordInput = passwords[0];
      const submitButton = screen.getByRole("button", {
        name: /create account/i,
      });

      // Fill in email and password but leave confirm password empty
      fireEvent.change(emailInput, { target: { value: "test@example.com" } });
      fireEvent.change(passwordInput, { target: { value: "password123" } });

      // Submit the form
      fireEvent.click(submitButton);

      // Check for confirm password error
      expect(
        screen.getByText("Please confirm your password"),
      ).toBeInTheDocument();
    });

    it("should show 'Passwords do not match' error when passwords don't match", async () => {
      render(<RegisterForm />);

      const emailInput = screen.getByPlaceholderText("m@example.com");
      const passwords = screen.getAllByPlaceholderText("••••••••");
      const passwordInput = passwords[0];
      const confirmPasswordInput = passwords[1];
      const submitButton = screen.getByRole("button", {
        name: /create account/i,
      });

      // Fill in with mismatched passwords
      fireEvent.change(emailInput, { target: { value: "test@example.com" } });
      fireEvent.change(passwordInput, { target: { value: "password123" } });
      fireEvent.change(confirmPasswordInput, {
        target: { value: "different123" },
      });

      // Submit the form
      fireEvent.click(submitButton);

      // Check for password mismatch error
      expect(screen.getByText("Passwords do not match")).toBeInTheDocument();
    });
  });

  describe("Error Clearing on Input Change", () => {
    it("should clear email error when email field is modified", async () => {
      render(<RegisterForm />);

      const emailInput = screen.getByPlaceholderText("m@example.com");
      const passwords = screen.getAllByPlaceholderText("••••••••");
      const passwordInput = passwords[0];
      const confirmPasswordInput = passwords[1];
      const submitButton = screen.getByRole("button", {
        name: /create account/i,
      });

      // Fill in password fields but leave email empty
      fireEvent.change(passwordInput, { target: { value: "password123" } });
      fireEvent.change(confirmPasswordInput, {
        target: { value: "password123" },
      });

      // Submit to trigger validation
      fireEvent.click(submitButton);

      // Verify error is shown
      expect(screen.getByText("Email is required")).toBeInTheDocument();

      // Now modify the email field
      fireEvent.change(emailInput, { target: { value: "test@example.com" } });

      // Error should be cleared
      expect(screen.queryByText("Email is required")).not.toBeInTheDocument();
    });

    it("should clear password error when password field is modified", async () => {
      render(<RegisterForm />);

      const emailInput = screen.getByPlaceholderText("m@example.com");
      const passwords = screen.getAllByPlaceholderText("••••••••");
      const passwordInput = passwords[0];
      const confirmPasswordInput = passwords[1];
      const submitButton = screen.getByRole("button", {
        name: /create account/i,
      });

      // Fill in email and confirm password but leave password empty
      fireEvent.change(emailInput, { target: { value: "test@example.com" } });
      fireEvent.change(confirmPasswordInput, {
        target: { value: "password123" },
      });

      // Submit to trigger validation
      fireEvent.click(submitButton);

      // Verify error is shown
      expect(screen.getByText("Password is required")).toBeInTheDocument();

      // Now modify the password field
      fireEvent.change(passwordInput, { target: { value: "password123" } });

      // Error should be cleared
      expect(
        screen.queryByText("Password is required"),
      ).not.toBeInTheDocument();
    });
  });

  describe("Valid Form Submission", () => {
    it("should not show any errors when all fields are valid", async () => {
      render(<RegisterForm />);

      const emailInput = screen.getByPlaceholderText("m@example.com");
      const passwords = screen.getAllByPlaceholderText("••••••••");
      const passwordInput = passwords[0];
      const confirmPasswordInput = passwords[1];

      // Fill in all fields with valid data
      fireEvent.change(emailInput, { target: { value: "test@example.com" } });
      fireEvent.change(passwordInput, { target: { value: "password123" } });
      fireEvent.change(confirmPasswordInput, {
        target: { value: "password123" },
      });

      // Check that no error messages are displayed
      expect(screen.queryByText("Email is required")).not.toBeInTheDocument();
      expect(
        screen.queryByText("Invalid email format"),
      ).not.toBeInTheDocument();
      expect(
        screen.queryByText("Password is required"),
      ).not.toBeInTheDocument();
      expect(
        screen.queryByText("Password must be at least 6 characters"),
      ).not.toBeInTheDocument();
      expect(
        screen.queryByText("Please confirm your password"),
      ).not.toBeInTheDocument();
      expect(
        screen.queryByText("Passwords do not match"),
      ).not.toBeInTheDocument();
    });
  });
});
