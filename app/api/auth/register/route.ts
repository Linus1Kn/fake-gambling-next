import { NextResponse } from "next/server";
import db from "@/lib/db";
import { hashPassword } from "@/lib/password";
import { createSession } from "@/lib/auth";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const email = String(body.email ?? "").trim().toLowerCase();
    const password = String(body.password ?? "");
    const name = String(body.name ?? "").trim();

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 }
      );
    }

    if (password.length < 8) {
      return NextResponse.json(
        { error: "Password must be at least 8 characters" },
        { status: 400 }
      );
    }

    const existingUser = db
      .prepare("SELECT id FROM users WHERE email = ?")
      .get(email);

    if (existingUser) {
      return NextResponse.json(
        { error: "An account with that email already exists" },
        { status: 409 }
      );
    }

    const passwordHash = await hashPassword(password);

    const result = db
      .prepare(`
        INSERT INTO users (email, password_hash, name)
        VALUES (?, ?, ?)
      `)
      .run(email, passwordHash, name || null);

    await createSession(Number(result.lastInsertRowid));

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