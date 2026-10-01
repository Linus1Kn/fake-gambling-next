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

  const { bet } = await request.json();
  const amount = Number(bet);

  if (!Number.isFinite(amount) || amount < 5) {
    return NextResponse.json(
      { error: "Bet must be at least $5." },
      { status: 400 }
    );
  }

  // Check balance and deduct bet atomically.
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

    db.prepare(`
      UPDATE users
      SET money = money - ?
      WHERE id = ?
    `).run(amount, user.id);

    // 25% chance.
    const won = crypto.randomInt(0, 100) < 25;

    const prize = won ? amount * 3 : 0;

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
      prize,
      money: updatedUser.money,
    };
  })();

  return NextResponse.json(gamble);
}