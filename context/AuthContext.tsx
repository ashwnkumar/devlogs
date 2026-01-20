"use client";
import { createClient } from "@/lib/supabase/client";
import { Session } from "@supabase/supabase-js";
import { createContext, useContext, useEffect, useState } from "react";
import type { UserType, UserMetadata } from "@/types";

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
  showWelcome: boolean;
  setShowWelcome: (showWelcome: boolean) => void;
};

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserType | null>(null);
  const [showWelcome, setShowWelcome] = useState<boolean>(false);

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
    const supabase = createClient();
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) {
        console.error("Login error:", error);
        return { success: false, error };
      } else {
        const { data: metadata, error: metaErr } = await supabase
          .from("users")
          .select("metadata")
          .eq("id", data.user.id)
          .single();

        return {
          success: true,
          data: {
            ...data,
            metadata,
          },
        };
      }
    } catch (error) {
      console.error("Something Went Wrong:", error);
      return { success: false, error };
    }
  };

  const register = async (email: string, password: string) => {
    const supabase = createClient();
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });

      if (error) {
        console.error("Registration error:", error);
        return { success: false, error };
      }

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
      const supabase = createClient();
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
    let mounted = true;

    const initAuth = async () => {
      const supabase = await createClient();

      // Set up auth state listener first
      const {
        data: { subscription },
      } = supabase.auth.onAuthStateChange(async (_event, session) => {
        if (session?.user && mounted) {
          fetchUserDetails();
        } else if (!session?.user && mounted) {
          setUser(null);
        }
      });

      // Fetch initial session (onAuthStateChange will handle the user fetch)
      await supabase.auth.getSession();

      return subscription;
    };

    const subscription = initAuth();

    return () => {
      mounted = false;
      subscription.then((sub) => sub?.unsubscribe());
    };
  }, []);

  return (
    <AuthContext.Provider
      value={{ login, register, logout, user, showWelcome, setShowWelcome }}
    >
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
