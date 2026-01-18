"use client";
import InputComponent from "@/components/form/InputComponent";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useAuth } from "@/context/AuthContext";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { redirect } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

export function RegisterForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const { register } = useAuth();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [loading, setLoading] = useState<boolean>(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [registrationComplete, setRegistrationComplete] =
    useState<boolean>(false);

  const validateForm = (): boolean => {
    const newErrors: { [key: string]: string } = {};

    // Validate email
    if (!formData.email) {
      newErrors.email = "Email is required";
    } else {
      // Basic email format validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email)) {
        newErrors.email = "Invalid email format";
      }
    }

    // Validate password
    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }

    // Validate confirm password
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = "Please confirm your password";
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
    setErrors((prevErrors) => ({
      ...prevErrors,
      [name]: "",
    }));
  };

  const handleSubmit = async () => {
    // Validate form
    if (!validateForm()) {
      toast.error("Please fix the errors before submitting");
      return;
    }

    // Check if register function is available
    if (!register) {
      toast.error("Registration function not available");
      return;
    }

    // Set loading state
    setLoading(true);

    try {
      // Call register method from AuthContext
      const res = await register(formData.email, formData.password);

      if (!res.success) {
        // Handle error response with appropriate error messages
        let errorMessage = "Registration failed. Please try again";

        if (res.error) {
          const error = res.error as { message?: string };
          const errorMsg = error.message || (res.error as Error).toString();

          // Handle specific error cases
          if (
            errorMsg.includes("User already registered") ||
            errorMsg.includes("already been registered")
          ) {
            errorMessage = "An account with this email already exists";
          } else if (errorMsg.includes("Invalid email")) {
            errorMessage = "Invalid email format";
          } else if (
            errorMsg.includes("fetch") ||
            errorMsg.includes("network")
          ) {
            errorMessage = "Network error. Please try again";
          } else if (errorMsg) {
            // Pass through Supabase error messages (e.g., password validation)
            errorMessage = errorMsg;
          }
        }

        toast.error(errorMessage);
        setLoading(false);
      } else {
        // Handle success response
        setLoading(false);

        // Check if email confirmation is needed
        if (res.needsEmailConfirmation) {
          setRegistrationComplete(true);
          // Do not redirect when email confirmation is needed
        } else {
          toast.success("Registration successful!");
          // Redirect to home page if no email confirmation needed
          redirect("/");
        }
      }
    } catch (error) {
      // Handle network errors and unexpected errors
      console.error("Registration error:", error);

      let errorMessage = "Registration failed. Please try again";
      if (error instanceof TypeError && error.message.includes("fetch")) {
        errorMessage = "Network error. Please try again";
      }

      toast.error(errorMessage);
      setLoading(false);
    }
  };

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card>
        <CardHeader>
          <CardTitle>
            {registrationComplete ? "Check your email" : "Create an account"}
          </CardTitle>
          <CardDescription>
            {registrationComplete
              ? "We've sent you a confirmation link"
              : "Enter your email below to create your account"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {registrationComplete ? (
            <div className="space-y-4">
              <div className="rounded-lg bg-green-50 dark:bg-green-950 p-4 border border-green-200 dark:border-green-800">
                <div className="flex items-start gap-3">
                  <svg
                    className="h-5 w-5 text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  <div className="flex-1">
                    <h3 className="text-sm font-medium text-green-800 dark:text-green-200">
                      Registration successful!
                    </h3>
                    <p className="mt-2 text-sm text-green-700 dark:text-green-300">
                      We've sent a confirmation email to{" "}
                      <span className="font-semibold">{formData.email}</span>.
                      Please check your inbox and click the confirmation link to
                      activate your account.
                    </p>
                  </div>
                </div>
              </div>
              <div className="text-sm text-muted-foreground space-y-2">
                <p>Didn't receive the email?</p>
                <ul className="list-disc list-inside space-y-1 ml-2">
                  <li>Check your spam or junk folder</li>
                  <li>Make sure you entered the correct email address</li>
                  <li>Wait a few minutes and check again</li>
                </ul>
              </div>
              <div className="pt-4 text-center text-sm">
                <Link href="/login" className="underline text-primary">
                  Return to login
                </Link>
              </div>
            </div>
          ) : (
            <form className="space-y-4">
              <InputComponent
                label="Email"
                name="email"
                required
                value={formData.email}
                type="email"
                placeholder="m@example.com"
                onChange={handleInputChange}
                error={errors.email}
              />
              <InputComponent
                label="Password"
                required
                value={formData.password}
                name="password"
                type="password"
                placeholder="••••••••"
                onChange={handleInputChange}
                error={errors.password}
              />
              <InputComponent
                label="Confirm Password"
                required
                value={formData.confirmPassword}
                name="confirmPassword"
                type="password"
                placeholder="••••••••"
                onChange={handleInputChange}
                error={errors.confirmPassword}
              />
              <Button
                disabled={loading}
                type="button"
                onClick={handleSubmit}
                className="w-full mt-4 disabled:opacity-50"
              >
                {loading ? "Creating account..." : "Create account"}
              </Button>
              <div className="mt-4 text-center text-sm">
                Already have an account?{" "}
                <Link href="/login" className="underline text-primary">
                  Login
                </Link>
              </div>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
