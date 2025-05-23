"use client";
// SessionContext and SessionProvider for Supabase authentication
import React, { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { createClient } from "./supabase";
import type { Session, User } from "@supabase/supabase-js";

interface SessionContextType {
  session: Session | null;
  user: User | null;
  isLoading: boolean;
}

const SessionContext = createContext<SessionContextType | undefined>(undefined);

export const SessionProvider = ({ children }: { children: ReactNode }) => {
  const supabase = createClient();
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const getSession = async () => {
      const { data, error } = await supabase.auth.getSession();
      if (error) {
        console.error("Error fetching session:", error);
      } else if (!data.session) {
        console.warn("No session found. User might need to log in again.");
      } else {
        console.log("Session retrieved successfully:", data.session);
      }
      setSession(data.session);
      setUser(data.session?.user ?? null);
      setIsLoading(false);
    };
    getSession();
    const { data: listener } = supabase.auth.onAuthStateChange((_event, newSession) => {
      if (!newSession) {
        console.warn("Auth state changed but no new session found.");
      } else {
        console.log("Auth state changed. New session:", newSession);
      }
      setSession(newSession);
      setUser(newSession?.user ?? null);
    });
    return () => {
      listener.subscription.unsubscribe();
    };
  }, [supabase]);

  return (
    <SessionContext.Provider value={{ session, user, isLoading }}>
      {children}
    </SessionContext.Provider>
  );
};

export const useSession = () => {
  const context = useContext(SessionContext);
  if (context === undefined) {
    throw new Error("useSession must be used within a SessionProvider");
  }
  return context;
};
