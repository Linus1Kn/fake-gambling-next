"use client";

import { useEffect } from "react";
import { useSetAtom } from "jotai";
import {
  userAtom,
  authCheckedAtom,
} from "@/lib/auth-store";

export default function AuthProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const setUser = useSetAtom(userAtom);
  const setAuthChecked = useSetAtom(authCheckedAtom);

  useEffect(() => {
    let cancelled = false;

    async function checkAuth() {
      try {
        const response = await fetch("/api/auth/me");

        if (cancelled) return;

        if (response.ok) {
          const data = await response.json();
          setUser(data.user);
        } else {
          setUser(null);
        }
      } catch {
        if (!cancelled) {
          setUser(null);
        }
      } finally {
        if (!cancelled) {
          setAuthChecked(true);
        }
      }
    }

    checkAuth();

    return () => {
      cancelled = true;
    };
  }, [setUser, setAuthChecked]);

  return children;
}