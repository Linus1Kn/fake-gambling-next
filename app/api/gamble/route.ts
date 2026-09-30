import { NextResponse } from "next/server";
import crypto from "crypto";
import db from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

export async function POST() {
  const user = await getCurrentUser();

  if (!user) {
    return NextResponse.json(
      { error: "Not logged in" },
      { status: 401 }
    );
  }

  // Check balance and deduct $50 atomically.
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

    if (currentUser.money < 50) {
      return {
        success: false,
        error: "You need at least $50 to gamble.",
        money: currentUser.money,
      };
    }

    db.prepare(`
      UPDATE users
      SET money = money - 50
      WHERE id = ?
    `).run(user.id);

    // 25% chance.
    const won = crypto.randomInt(0, 100) < 25;

    if (won) {
      db.prepare(`
        UPDATE users
        SET money = money + 200
        WHERE id = ?
      `).run(user.id);
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
      prize: won ? 200 : 0,
      money: updatedUser.money,
    };
  })();

  return NextResponse.json(gamble);
}