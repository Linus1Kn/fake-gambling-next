import { NextResponse } from "next/server";
import crypto from "crypto";
import db from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

export async function POST(request: Request) {
  const user = await getCurrentUser();

  if (!user) {
    return NextResponse.json(
      { error: "Not logged in" },
      { status: 401 }
    );
  }

  const { bet, mult } = await request.json();

  const amount = Number(bet);
  const multiplier = Number(mult);

  if (!Number.isFinite(amount) || amount < 1) {
    return NextResponse.json(
      { error: "Bet must be at least $1." },
      { status: 400 }
    );
  }

  // Server-side validation. Never trust the client's multiplier.
  if (
    !Number.isFinite(multiplier) ||
    multiplier < 1 ||
    multiplier > 10
  ) {
    return NextResponse.json(
      { error: "Multiplier must be between 1 and 10." },
      { status: 400 }
    );
  }

  // Base chance is 25%.
  // Higher multipliers reduce the chance proportionally.
  const winChance = 50 / multiplier;

  // Base prize is 3x the bet.
  // Higher multipliers increase the prize proportionally.
  const prizeMultiplier = multiplier;

  const gamble = db.transaction(() => {
    const currentUser = db
      .prepare(`
        SELECT money
        FROM users
        WHERE id = ?
      `)
      .get(user.id) as { money: number } | undefined;

    if (!currentUser) {
      throw new Error("User not found");
    }

    if (currentUser.money < amount) {
      return {
        success: false,
        error: "You don't have enough money for this bet.",
        money: currentUser.money,
      };
    }

    // Deduct the bet.
    db.prepare(`
      UPDATE users
      SET money = money - ?
      WHERE id = ?
    `).run(amount, user.id);

    // Generate a value from 0 to 999999 so fractional
    // probabilities work accurately.
    const roll = crypto.randomInt(0, 1_000_000);
    const won = roll < winChance * 10_000;

    const prize = won
      ? amount * prizeMultiplier
      : 0;

    if (won) {
      db.prepare(`
        UPDATE users
        SET money = money + ?
        WHERE id = ?
      `).run(prize, user.id);
    }

    const updatedUser = db
      .prepare(`
        SELECT money
        FROM users
        WHERE id = ?
      `)
      .get(user.id) as { money: number };

    return {
      success: true,
      won,
      bet: amount,
      mult: multiplier,
      winChance,
      prizeMultiplier,
      prize,
      money: updatedUser.money,
    };
  })();

  return NextResponse.json(gamble);
}