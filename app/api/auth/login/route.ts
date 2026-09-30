import { NextResponse } from "next/server";
import db from "@/lib/db";
import { verifyPassword } from "@/lib/password";
import { createSession } from "@/lib/auth";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const email = String(body.email ?? "").trim().toLowerCase();
    const password = String(body.password ?? "");

    const user = db
      .prepare(`
        SELECT id, email, password_hash
        FROM users
        WHERE email = ?
      `)
      .get(email) as
      | {
          id: number;
          email: string;
          password_hash: string;
        }
      | undefined;

    if (!user) {
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 401 }
      );
    }

    const valid = await verifyPassword(
      password,
      user.password_hash
    );

    if (!valid) {
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 401 }
      );
    }

    await createSession(user.id);

    return NextResponse.json({
      success: true,
    });
  } catch {
    return NextResponse.json(
      { error: "Invalid request" },
      { status: 400 }
    );
  }
}