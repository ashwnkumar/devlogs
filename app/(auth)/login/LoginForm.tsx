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
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";
import { redirect } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

export function LoginForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const { login } = useAuth();
  const [formData, setFormData] = useState({
    email: "code.by.ashwin@gmail.com",
    password: "devlogs1272!",
  });
  const [loading, setLoading] = useState<boolean>(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const validateForm = () => {
    const err = {};

    if (!formData.email) {
      err.email = "Email is required";
    }
    if (!formData.password) {
      err.password = "Password is required";
    }
    setErrors(err);
    return Object.keys(err).length === 0;
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
    if (!validateForm()) {
      return toast.error("Please fill all required fields");
    }
    setLoading(true);
    const res = await login(formData.email, formData.password);
    if (!res.success) {
      toast.error(res.message || "Login failed");
      setLoading(false);
    } else {
      setLoading(false);
      toast.success("Logged in successfully");
      redirect("/");
    }
  };

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card>
        <CardHeader>
          <CardTitle>Login to your account</CardTitle>
          <CardDescription>
            Enter your email below to login to your account
          </CardDescription>
        </CardHeader>
        <CardContent>
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
            <Button
              disabled={loading}
              type="button"
              onClick={handleSubmit}
              className="w-full mt-4 disabled:opacity-50"
            >
              {loading ? "Logging in..." : "Login"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
