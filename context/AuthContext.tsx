"use client";
import { createClient } from "@/lib/supabase/client";
import { Session } from "@supabase/supabase-js";
import { createContext, useContext, useEffect, useState } from "react";
import type { UserType } from "@/types";

type AuthContextType = {
  user: UserType | null;
  setSession?: (session: Session | null) => void;
  login?: (
    email: string,
    password: string,
  ) => Promise<{
    success: boolean;
    data?: unknown;
    error?: unknown;
  }>;
  register?: (
    email: string,
    password: string,
  ) => Promise<{
    success: boolean;
    data?: unknown;
    error?: unknown;
    needsEmailConfirmation?: boolean;
  }>;
  logout?: () => Promise<{
    success: boolean;
    error?: unknown;
  }>;
};

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserType | null>(null);

  const fetchUserDetails = async () => {
    try {
      const response = await fetch("/api/users/profile");

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to fetch user details");
      }

      const { data } = await response.json();
      setUser(data);
    } catch (error) {
      console.error("Error fetching user details:", error);
    }
  };

  const login = async (email: string, password: string) => {
    const supabase = await createClient();
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) {
        console.error("Login error:", error);
        return { success: false, error };
      } else {
        return { success: true, data };
      }
    } catch (error) {
      console.error("Something Went Wrong:", error);
      return { success: false, error };
    }
  };

  const register = async (email: string, password: string) => {
    const supabase = await createClient();
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });

      if (error) {
        console.error("Registration error:", error);
        return { success: false, error };
      }

      // Check if email confirmation is required
      const needsEmailConfirmation =
        data.user && !data.session ? true : undefined;

      return {
        success: true,
        data,
        needsEmailConfirmation,
      };
    } catch (error) {
      console.error("Something Went Wrong:", error);
      return { success: false, error };
    }
  };

  const logout = async () => {
    try {
      const supabase = await createClient();
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error("Logout error:", error);
        return { success: false, error };
      } else {
        return { success: true };
      }
    } catch (error) {
      console.error("Something Went Wrong:", error);
      return { success: false, error };
    }
  };

  useEffect(() => {
    const fetchSession = async () => {
      const supabase = await createClient();
      supabase.auth.getSession().then(({ data: { session } }) => {
        if (session?.user) {
          fetchUserDetails();
        }
      });
    };

    const authChange = async () => {
      const supabase = await createClient();
      supabase.auth.onAuthStateChange((_event, session) => {
        if (session?.user) {
          fetchUserDetails();
        }
      });
    };
    authChange();
    fetchSession();
  }, []);

  return (
    <AuthContext.Provider value={{ login, register, logout, user }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const cxt = useContext(AuthContext);
  if (!cxt) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return cxt;
};
