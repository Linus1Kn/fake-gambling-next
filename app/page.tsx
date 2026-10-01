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
  const [bet, setBet] = useState(5)

  async function gamble() {
    if (gambling) return;
    if (bet < 5) {
      setMessage({
        text: "Bet must be at least $5",
        won: null,
      });
      return;
    }

    setWon(null);
    setMessage(null);
    setGambleId((id) => id + 1);
    setGambling(true);

    try {
      const currentBet = bet
      const response = await fetch("/api/gamble", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ bet }),
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
        text: data.won ? `You won $${data.prize ?? "?"}!` : `You lost $${currentBet}.`,
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

      <div className="flex flex-col gap-4">
        <Slots
          key={gambleId}
          gambling={gambling}
          won={won}
        />

        <div className="flex flex-col gap-2">

          <div className="flex gap-2 items-center">
            <p className="font-semibold">Bet: </p>
            <input
              type="number"
              placeholder="$"
              className="bg-slate-900 p-1 flex-1"
              value={bet}
              onChange={(e) => {
                setBet(Math.floor(Math.min(user.money, Math.max(0, Number(e.target.value)))))
              }}
              min={0}
              max={user.money}
            />
          </div>

          <Button
            onClick={gamble}
            disabled={gambling || user.money < 50 || (bet < 5)}
          >
            {gambling ? (
              <>
                <LoaderCircle size={24} className="animate-spin" />
                <span>Spinning...</span>
              </>
            ) : (
              <>
                <BanknoteArrowDown size={24} />
                <span>Gamble ${bet}</span>
              </>
            )}
          </Button>
        </div>
      </div>

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