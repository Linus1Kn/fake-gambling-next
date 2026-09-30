import { cookies } from "next/headers";
import crypto from "crypto";
import db from "./db";

const SESSION_COOKIE = "session";
const SESSION_DURATION = 1000 * 60 * 60 * 24 * 30;

export type User = {
  id: number;
  email: string;
  name: string | null;
  money: number;
  created_at: string;
};

export async function createSession(userId: number) {
  const sessionId = crypto.randomBytes(32).toString("hex");
  const expiresAt = Date.now() + SESSION_DURATION;

  db.prepare(`
    INSERT INTO sessions (id, user_id, expires_at)
    VALUES (?, ?, ?)
  `).run(sessionId, userId, expiresAt);

  const cookieStore = await cookies();

  cookieStore.set(SESSION_COOKIE, sessionId, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    expires: new Date(expiresAt),
    path: "/",
  });

  return sessionId;
}

export async function deleteSession() {
  const cookieStore = await cookies();
  const sessionId = cookieStore.get(SESSION_COOKIE)?.value;

  if (sessionId) {
    db.prepare("DELETE FROM sessions WHERE id = ?").run(sessionId);
  }

  cookieStore.delete(SESSION_COOKIE);
}

export async function getCurrentUser(): Promise<User | null> {
  const cookieStore = await cookies();
  const sessionId = cookieStore.get(SESSION_COOKIE)?.value;

  if (!sessionId) {
    return null;
  }

  const session = db
    .prepare(`
      SELECT user_id, expires_at
      FROM sessions
      WHERE id = ?
    `)
    .get(sessionId) as
    | {
        user_id: number;
        expires_at: number;
      }
    | undefined;

  if (!session) {
    return null;
  }

  if (session.expires_at < Date.now()) {
    db.prepare("DELETE FROM sessions WHERE id = ?").run(sessionId);
    cookieStore.delete(SESSION_COOKIE);
    return null;
  }

  const user = db
    .prepare(`
      SELECT id, email, name, money, created_at
      FROM users
      WHERE id = ?
    `)
    .get(session.user_id) as User | undefined;

  return user ?? null;
}