"use client";

import { useAtomValue, useSetAtom } from "jotai";
import { userAtom, authCheckedAtom } from "@/lib/auth-store";
import { useRouter } from "next/navigation";
import NavLink from "./navlink";

export default function Navbar() {
  const user = useAtomValue(userAtom);
  const authChecked = useAtomValue(authCheckedAtom);
  const setUser = useSetAtom(userAtom);
  const router = useRouter();

  async function logout() {
    await fetch("/api/auth/logout", {
      method: "POST",
    });

    setUser(null);
    router.push("/");
  }

  return (
    <nav className="flex items-center justify-between border-b">
      <div className="flex">
        <NavLink
          href="/"
        >
          GAMBLING!!
        </NavLink>

        <NavLink
          href="/loan"
        >
          Loans
        </NavLink>
      </div>

      <div className="flex items-center">
        {!authChecked ? (
          <span>Loading...</span>
        ) : user ? (
          <div className="flex gap-4 items-center">
            <span
              className={`font-semibold ${
                user.money > 0
                  ? "text-emerald-400"
                  : "text-red-400"
              }`}
            >
              ${user.money}
            </span>

            <span>{user.name ?? user.email}</span>

            <button
              onClick={logout}
              className="bg-red-500 py-2 px-4 text-white"
            >
              Logout
            </button>
          </div>
        ) : (
          <>
            <NavLink
              href="/login"
            >
              Login
            </NavLink>

            <NavLink
              href="/register"
            >
              Register
            </NavLink>
          </>
        )}
      </div>
    </nav>
  );
}