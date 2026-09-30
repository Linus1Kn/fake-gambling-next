import { NextResponse } from "next/server";
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

  const result = db
    .prepare(`
      UPDATE users
      SET money = 100
      WHERE id = ?
        AND money <= 0
    `)
    .run(user.id);

  const updatedUser = db
    .prepare(`
      SELECT money
      FROM users
      WHERE id = ?
    `)
    .get(user.id) as { money: number };

  return NextResponse.json({
    success: true,
    loanGiven: result.changes > 0,
    money: updatedUser.money,
  });
}