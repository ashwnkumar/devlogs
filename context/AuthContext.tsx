"use client";
import { createClient } from "@/lib/supabase/client";
import { Session, User } from "@supabase/supabase-js";
import { createContext, useContext, useEffect, useState } from "react";

type AuthContextType = {
  user: User | null;
  setSession?: (session: Session | null) => void;
  login?: (
    email: string,
    password: string
  ) => Promise<{
    success: boolean;
    data?: any;
    error?: any;
  }>;
  logout?: () => void;
};

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  const fetchUserDetails = async (id: string) => {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("users")
      .select("*")
      .eq("id", id)
      .single();
    if (error) {
      console.error("Error fetching user details:", error);
    } else {
      console.log("User details:", data);
      setUser(data);
    }
  };

  console.log("user from auth context", user);

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
          fetchUserDetails(session.user.id);
        }
      });
    };

    const authChange = async () => {
      const supabase = await createClient();
      supabase.auth.onAuthStateChange((_event, session) => {
        if (session?.user) {
          fetchUserDetails(session.user.id);
        }
      });
    };
    authChange();
    fetchSession();
  }, []);

  return (
    <AuthContext.Provider value={{ login, logout, user }}>
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
