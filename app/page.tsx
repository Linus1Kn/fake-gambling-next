"use client";

import { useState } from "react";
import { LoaderCircle, BanknoteArrowDown } from "lucide-react";
import { useAtomValue, useSetAtom } from "jotai";
import { userAtom } from "../lib/auth-store";
import Button from "./components/button";
import Slots from "./components/slots";

type Message = {
  text: string;
  won: boolean | null;
};

export default function Home() {
  const user = useAtomValue(userAtom);
  const setUser = useSetAtom(userAtom);

  const [gambling, setGambling] = useState(false);
  const [gambleId, setGambleId] = useState(0);
  const [won, setWon] = useState<boolean | null>(null);
  const [message, setMessage] = useState<Message | null>(null);

  async function gamble() {
    if (gambling) return;

    setWon(null);
    setMessage(null);
    setGambleId((id) => id + 1);
    setGambling(true);

    try {
      const response = await fetch("/api/gamble", {
        method: "POST",
      });

      const data = await response.json();

      if (!response.ok) {
        setMessage({
          text: data.error ?? "Gamble failed.",
          won: null,
        });

        setGambling(false);
        return;
      }

      setWon(data.won);

      // Keep the slots running for 2 seconds.
      await new Promise((resolve) => setTimeout(resolve, 2500));

      setUser((current) =>
        current
          ? {
              ...current,
              money: data.money,
            }
          : current
      );

      setMessage({
        text: data.won ? "You won $200!" : "You lost $50.",
        won: data.won,
      });

      setGambling(false);
    } finally {
      setGambling(false);
    }
  }

  if (!user) {
    return (
      <main>
        <h1>Welcome</h1>
        <p>Log in to play.</p>
      </main>
    );
  }

  return (
    <main className="flex flex-col gap-4 p-6">
      <h1 className="font-semibold text-2xl">GAMBLING</h1>

      <p>
        Money: ${user.money}
      </p>

      <Slots
        key={gambleId}
        gambling={gambling}
        won={won}
      />

      <Button
        onClick={gamble}
        disabled={gambling || user.money < 50}
      >
        {gambling ? (
          <>
            <LoaderCircle size={24} className="animate-spin" />
            <span>Spinning...</span>
          </>
        ) : (
          <>
            <BanknoteArrowDown size={24} />
            <span>Gamble $50</span>
          </>
        )}
      </Button>

      {message && (
        <p
          className={
            message.won === true
              ? "text-emerald-500 font-semibold"
              : message.won === false
                ? "text-yellow-500"
                : ""
          }
        >
          {message.text}
        </p>
      )}
    </main>
  );
}