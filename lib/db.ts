import Database from "better-sqlite3";
import path from "path";

const dbPath = path.join(process.cwd(), "data", "app.db");

const db = new Database(dbPath);

db.pragma("journal_mode = WAL");

db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    name TEXT,
    money INTEGER NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS sessions (
    id TEXT PRIMARY KEY,
    user_id INTEGER NOT NULL,
    expires_at INTEGER NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
  );

  CREATE INDEX IF NOT EXISTS idx_sessions_user_id
    ON sessions(user_id);

  CREATE INDEX IF NOT EXISTS idx_sessions_expires_at
    ON sessions(expires_at);
`);

// Add money to existing databases that don't have the column yet.
const columns = db
  .prepare("PRAGMA table_info(users)")
  .all() as { name: string }[];

const hasMoneyColumn = columns.some(
  (column) => column.name === "money"
);

if (!hasMoneyColumn) {
  db.exec(`
    ALTER TABLE users
    ADD COLUMN money INTEGER NOT NULL DEFAULT 0
  `);
}

export default db;