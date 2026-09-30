"use client";

import { useState } from "react";
import { useAtomValue, useSetAtom } from "jotai";
import { userAtom } from "../../lib/auth-store";
import { BanknoteX } from "lucide-react";
import Button from "../components/button";

export default function DonatePage() {
  const user = useAtomValue(userAtom);
  const setUser = useSetAtom(userAtom);

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  async function donate() {
    if (loading || !user || user.money < 0) {
      return;
    }

    setLoading(true);
    setMessage("");

    try {
      const response = await fetch("/api/donate", {
        method: "POST",
      });

      const data = await response.json();

      if (!response.ok) {
        setMessage(data.error ?? "Donation failed.");
        return;
      }

      setUser((current) =>
        current
          ? {
              ...current,
              money: data.money,
            }
          : current
      );

      if (data.loanGiven) {
        setMessage("You donated everything you had.");
      } else {
        setMessage("You cannot donate.");
      }
    } finally {
      setLoading(false);
    }
  }

  if (!user) {
    return (
      <main className="p-6">
        <p>You need to be logged in to donate to charity.</p>
      </main>
    );
  }

  return (
    <main className="flex flex-col gap-4 p-6">
      <h1 className="text-2xl font-semibold">Donate to charity</h1>

      <p>
        Current balance: ${user.money}
      </p>

      <p>
        Too RICH? donate your entire bank account to charity.
      </p>

      <Button
        onClick={donate}
        disabled={loading || user.money < 0}
      >
        <BanknoteX size={24} />
        {loading ? (
          <span>Processing...</span>
        ) : (
          <span>Donate EVERYTHING.</span>
        )}
      </Button>

      {message && <p className="font-semibold">{message}</p>}
    </main>
  );
}