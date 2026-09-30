"use client";

import { useState } from "react";
import { useAtomValue, useSetAtom } from "jotai";
import { userAtom } from "../../lib/auth-store";
import { Landmark } from "lucide-react";
import Button from "../components/button";

export default function LoanPage() {
  const user = useAtomValue(userAtom);
  const setUser = useSetAtom(userAtom);

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  async function takeLoan() {
    if (loading || !user || user.money > 0) {
      return;
    }

    setLoading(true);
    setMessage("");

    try {
      const response = await fetch("/api/loan", {
        method: "POST",
      });

      const data = await response.json();

      if (!response.ok) {
        setMessage(data.error ?? "Loan failed.");
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
        setMessage("You received a $100 loan.");
      } else {
        setMessage("You don't qualify for a loan.");
      }
    } finally {
      setLoading(false);
    }
  }

  if (!user) {
    return (
      <main className="p-6">
        <p>You need to be logged in to take a loan.</p>
      </main>
    );
  }

  return (
    <main className="flex flex-col gap-4 p-6">
      <h1 className="text-2xl font-semibold">Loan</h1>

      <p>
        Current balance: ${user.money}
      </p>

      <div>
        <p>
          Gambled all your money away? Just take a loan!
        </p>
        <p className="italic text-gray-400">
          (don't worry, you don't have to pay it back)
        </p>
      </div>

      <Button
        onClick={takeLoan}
        disabled={loading || user.money > 0}
      >
        <Landmark size={24} />
        {loading ? (
          <span>Processing...</span>
        ) : (
          <span>Take $100 Loan</span>
        )}
      </Button>

      {message && <p className="font-semibold">{message}</p>}
    </main>
  );
}