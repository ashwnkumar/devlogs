import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { RegisterForm } from "./RegisterForm";
import * as AuthContext from "@/context/AuthContext";
import { toast } from "sonner";

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

// Mock next/navigation
vi.mock("next/navigation", () => ({
  redirect: vi.fn(),
}));

describe("RegisterForm - Form Submission", () => {
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

  it("should prevent submission and show toast when validation fails", async () => {
    render(<RegisterForm />);

    const submitButton = screen.getByRole("button", {
      name: /create account/i,
    });

    // Submit with empty form
    fireEvent.click(submitButton);

    // Should show error toast
    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith(
        "Please fix the errors before submitting",
      );
    });

    // Should not call register
    expect(mockRegister).not.toHaveBeenCalled();
  });

  it("should call register method with email and password on valid submission", async () => {
    mockRegister.mockResolvedValue({
      success: true,
      needsEmailConfirmation: false,
    });

    render(<RegisterForm />);

    const emailInput = screen.getByPlaceholderText("m@example.com");
    const passwords = screen.getAllByPlaceholderText("••••••••");
    const passwordInput = passwords[0];
    const confirmPasswordInput = passwords[1];
    const submitButton = screen.getByRole("button", {
      name: /create account/i,
    });

    // Fill in valid data
    fireEvent.change(emailInput, { target: { value: "test@example.com" } });
    fireEvent.change(passwordInput, { target: { value: "password123" } });
    fireEvent.change(confirmPasswordInput, {
      target: { value: "password123" },
    });

    // Submit the form
    fireEvent.click(submitButton);

    // Should call register with correct parameters
    await waitFor(() => {
      expect(mockRegister).toHaveBeenCalledWith(
        "test@example.com",
        "password123",
      );
    });
  });

  it("should show success toast when registration succeeds without email confirmation", async () => {
    mockRegister.mockResolvedValue({
      success: true,
      needsEmailConfirmation: false,
    });

    render(<RegisterForm />);

    const emailInput = screen.getByPlaceholderText("m@example.com");
    const passwords = screen.getAllByPlaceholderText("••••••••");
    const passwordInput = passwords[0];
    const confirmPasswordInput = passwords[1];
    const submitButton = screen.getByRole("button", {
      name: /create account/i,
    });

    // Fill in valid data
    fireEvent.change(emailInput, { target: { value: "test@example.com" } });
    fireEvent.change(passwordInput, { target: { value: "password123" } });
    fireEvent.change(confirmPasswordInput, {
      target: { value: "password123" },
    });

    // Submit the form
    fireEvent.click(submitButton);

    // Should show success toast
    await waitFor(() => {
      expect(toast.success).toHaveBeenCalledWith("Registration successful!");
    });
  });

  it("should show email confirmation message when email confirmation is needed", async () => {
    mockRegister.mockResolvedValue({
      success: true,
      needsEmailConfirmation: true,
    });

    render(<RegisterForm />);

    const emailInput = screen.getByPlaceholderText("m@example.com");
    const passwords = screen.getAllByPlaceholderText("••••••••");
    const passwordInput = passwords[0];
    const confirmPasswordInput = passwords[1];
    const submitButton = screen.getByRole("button", {
      name: /create account/i,
    });

    // Fill in valid data
    fireEvent.change(emailInput, { target: { value: "test@example.com" } });
    fireEvent.change(passwordInput, { target: { value: "password123" } });
    fireEvent.change(confirmPasswordInput, {
      target: { value: "password123" },
    });

    // Submit the form
    fireEvent.click(submitButton);

    // Should show email confirmation message
    await waitFor(() => {
      expect(toast.success).toHaveBeenCalledWith(
        "Registration successful! Please check your email to confirm your account.",
      );
    });
  });

  it("should show 'user already exists' error message", async () => {
    mockRegister.mockResolvedValue({
      success: false,
      error: { message: "User already registered" },
    });

    render(<RegisterForm />);

    const emailInput = screen.getByPlaceholderText("m@example.com");
    const passwords = screen.getAllByPlaceholderText("••••••••");
    const passwordInput = passwords[0];
    const confirmPasswordInput = passwords[1];
    const submitButton = screen.getByRole("button", {
      name: /create account/i,
    });

    // Fill in valid data
    fireEvent.change(emailInput, { target: { value: "test@example.com" } });
    fireEvent.change(passwordInput, { target: { value: "password123" } });
    fireEvent.change(confirmPasswordInput, {
      target: { value: "password123" },
    });

    // Submit the form
    fireEvent.click(submitButton);

    // Should show user already exists error
    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith(
        "An account with this email already exists",
      );
    });
  });

  it("should show network error message", async () => {
    mockRegister.mockResolvedValue({
      success: false,
      error: { message: "fetch failed" },
    });

    render(<RegisterForm />);

    const emailInput = screen.getByPlaceholderText("m@example.com");
    const passwords = screen.getAllByPlaceholderText("••••••••");
    const passwordInput = passwords[0];
    const confirmPasswordInput = passwords[1];
    const submitButton = screen.getByRole("button", {
      name: /create account/i,
    });

    // Fill in valid data
    fireEvent.change(emailInput, { target: { value: "test@example.com" } });
    fireEvent.change(passwordInput, { target: { value: "password123" } });
    fireEvent.change(confirmPasswordInput, {
      target: { value: "password123" },
    });

    // Submit the form
    fireEvent.click(submitButton);

    // Should show network error
    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith(
        "Network error. Please try again",
      );
    });
  });

  it("should show generic error message for unknown errors", async () => {
    mockRegister.mockResolvedValue({
      success: false,
      error: { message: "Something went wrong" },
    });

    render(<RegisterForm />);

    const emailInput = screen.getByPlaceholderText("m@example.com");
    const passwords = screen.getAllByPlaceholderText("••••••••");
    const passwordInput = passwords[0];
    const confirmPasswordInput = passwords[1];
    const submitButton = screen.getByRole("button", {
      name: /create account/i,
    });

    // Fill in valid data
    fireEvent.change(emailInput, { target: { value: "test@example.com" } });
    fireEvent.change(passwordInput, { target: { value: "password123" } });
    fireEvent.change(confirmPasswordInput, {
      target: { value: "password123" },
    });

    // Submit the form
    fireEvent.click(submitButton);

    // Should show the error message from Supabase
    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith("Something went wrong");
    });
  });

  it("should disable button and show loading state during submission", async () => {
    // Make register take some time to resolve
    mockRegister.mockImplementation(
      () =>
        new Promise((resolve) =>
          setTimeout(
            () => resolve({ success: true, needsEmailConfirmation: false }),
            100,
          ),
        ),
    );

    render(<RegisterForm />);

    const emailInput = screen.getByPlaceholderText("m@example.com");
    const passwords = screen.getAllByPlaceholderText("••••••••");
    const passwordInput = passwords[0];
    const confirmPasswordInput = passwords[1];
    const submitButton = screen.getByRole("button", {
      name: /create account/i,
    });

    // Fill in valid data
    fireEvent.change(emailInput, { target: { value: "test@example.com" } });
    fireEvent.change(passwordInput, { target: { value: "password123" } });
    fireEvent.change(confirmPasswordInput, {
      target: { value: "password123" },
    });

    // Submit the form
    fireEvent.click(submitButton);

    // Button should show loading state
    await waitFor(() => {
      expect(
        screen.getByRole("button", { name: /creating account/i }),
      ).toBeInTheDocument();
    });

    // Button should be disabled
    expect(
      screen.getByRole("button", { name: /creating account/i }),
    ).toBeDisabled();

    // Wait for submission to complete
    await waitFor(
      () => {
        expect(toast.success).toHaveBeenCalled();
      },
      { timeout: 200 },
    );
  });
});
