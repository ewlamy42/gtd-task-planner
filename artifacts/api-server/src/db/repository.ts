import Database from "better-sqlite3";
import path from "path";
import fs from "fs";

const DATA_DIR = process.env["SQLITE_DB_PATH"]
  ? path.dirname(process.env["SQLITE_DB_PATH"])
  : path.resolve(process.cwd(), "data");

if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

const DB_PATH = process.env["SQLITE_DB_PATH"] ?? path.join(DATA_DIR, "tasks.db");

let _db: Database.Database | null = null;

function getDb(): Database.Database {
  if (!_db) {
    _db = new Database(DB_PATH);
    _db.pragma("journal_mode = WAL");
    _db.pragma("foreign_keys = ON");
    initSchema(_db);
  }
  return _db;
}

function initSchema(db: Database.Database): void {
  db.exec(`
    CREATE TABLE IF NOT EXISTS environments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL UNIQUE,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS tasks (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      description TEXT,
      environment_id INTEGER REFERENCES environments(id) ON DELETE SET NULL,
      urgency TEXT NOT NULL DEFAULT 'later' CHECK(urgency IN ('now', 'soon', 'later')),
      rank INTEGER NOT NULL DEFAULT 100,
      status TEXT NOT NULL DEFAULT 'inbox' CHECK(status IN ('inbox', 'next_action', 'project', 'waiting_for', 'someday_maybe')),
      due_date TEXT,
      tags TEXT NOT NULL DEFAULT '[]',
      completed INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
  `);
}

export function seedDefaultEnvironments(): void {
  const db = getDb();
  const defaults = ["Work", "Side Gig", "Personal"];
  const insert = db.prepare(
    "INSERT OR IGNORE INTO environments (name) VALUES (?)"
  );
  for (const name of defaults) {
    insert.run(name);
  }
}

export interface Environment {
  id: number;
  name: string;
  createdAt: string;
}

export interface Task {
  id: number;
  title: string;
  description: string | null;
  environmentId: number | null;
  environmentName: string | null;
  urgency: "now" | "soon" | "later";
  rank: number;
  status: "inbox" | "next_action" | "project" | "waiting_for" | "someday_maybe";
  dueDate: string | null;
  tags: string[];
  completed: boolean;
  createdAt: string;
  updatedAt: string;
}

interface DbTask {
  id: number;
  title: string;
  description: string | null;
  environment_id: number | null;
  environment_name: string | null;
  urgency: string;
  rank: number;
  status: string;
  due_date: string | null;
  tags: string;
  completed: number;
  created_at: string;
  updated_at: string;
}

function mapTask(row: DbTask): Task {
  return {
    id: row.id,
    title: row.title,
    description: row.description,
    environmentId: row.environment_id,
    environmentName: row.environment_name,
    urgency: row.urgency as Task["urgency"],
    rank: row.rank,
    status: row.status as Task["status"],
    dueDate: row.due_date,
    tags: JSON.parse(row.tags || "[]"),
    completed: Boolean(row.completed),
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export interface GetTasksOptions {
  environmentIds?: string;
  status?: string;
  urgency?: string;
  search?: string;
  tags?: string;
  includeCompleted?: boolean;
}

export function getTasks(opts: GetTasksOptions = {}): Task[] {
  const db = getDb();

  const conditions: string[] = [];
  const params: (string | number)[] = [];

  if (!opts.includeCompleted) {
    conditions.push("t.completed = 0");
  }

  if (opts.environmentIds) {
    const ids = opts.environmentIds
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
    if (ids.length > 0) {
      conditions.push(
        `t.environment_id IN (${ids.map(() => "?").join(",")})`
      );
      params.push(...ids.map(Number));
    }
  }

  if (opts.status) {
    const statuses = opts.status
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
    if (statuses.length > 0) {
      conditions.push(
        `t.status IN (${statuses.map(() => "?").join(",")})`
      );
      params.push(...statuses);
    }
  }

  if (opts.urgency) {
    const urgencies = opts.urgency
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
    if (urgencies.length > 0) {
      conditions.push(
        `t.urgency IN (${urgencies.map(() => "?").join(",")})`
      );
      params.push(...urgencies);
    }
  }

  if (opts.search) {
    conditions.push(
      "(LOWER(t.title) LIKE ? OR LOWER(t.description) LIKE ?)"
    );
    const pattern = `%${opts.search.toLowerCase()}%`;
    params.push(pattern, pattern);
  }

  if (opts.tags) {
    const tagList = opts.tags
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);
    for (const tag of tagList) {
      conditions.push(`t.tags LIKE ?`);
      params.push(`%"${tag}"%`);
    }
  }

  const where = conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";

  const urgencyOrder = `CASE t.urgency WHEN 'now' THEN 0 WHEN 'soon' THEN 1 WHEN 'later' THEN 2 ELSE 3 END`;

  const rows = db
    .prepare(
      `SELECT t.*, e.name AS environment_name
       FROM tasks t
       LEFT JOIN environments e ON t.environment_id = e.id
       ${where}
       ORDER BY ${urgencyOrder} ASC, t.rank ASC, t.created_at ASC`
    )
    .all(...params) as DbTask[];

  return rows.map(mapTask);
}

export function getTask(id: number): Task | null {
  const db = getDb();
  const row = db
    .prepare(
      `SELECT t.*, e.name AS environment_name
       FROM tasks t
       LEFT JOIN environments e ON t.environment_id = e.id
       WHERE t.id = ?`
    )
    .get(id) as DbTask | undefined;
  return row ? mapTask(row) : null;
}

export interface CreateTaskInput {
  title: string;
  description?: string | null;
  environmentId?: number | null;
  urgency?: "now" | "soon" | "later";
  rank?: number;
  status?: "inbox" | "next_action" | "project" | "waiting_for" | "someday_maybe";
  dueDate?: string | null;
  tags?: string[];
  completed?: boolean;
}

export function createTask(input: CreateTaskInput): Task {
  const db = getDb();
  const result = db
    .prepare(
      `INSERT INTO tasks (title, description, environment_id, urgency, rank, status, due_date, tags, completed)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`
    )
    .run(
      input.title,
      input.description ?? null,
      input.environmentId ?? null,
      input.urgency ?? "later",
      input.rank ?? 100,
      input.status ?? "inbox",
      input.dueDate ?? null,
      JSON.stringify(input.tags ?? []),
      input.completed ? 1 : 0
    );

  const task = getTask(result.lastInsertRowid as number);
  if (!task) throw new Error("Failed to retrieve created task");
  return task;
}

export interface UpdateTaskInput {
  title?: string;
  description?: string | null;
  environmentId?: number | null;
  urgency?: "now" | "soon" | "later";
  rank?: number;
  status?: "inbox" | "next_action" | "project" | "waiting_for" | "someday_maybe";
  dueDate?: string | null;
  tags?: string[];
  completed?: boolean;
}

export function updateTask(id: number, input: UpdateTaskInput): Task | null {
  const db = getDb();
  const existing = getTask(id);
  if (!existing) return null;

  const fields: string[] = [];
  const values: (string | number | null)[] = [];

  if (input.title !== undefined) {
    fields.push("title = ?");
    values.push(input.title);
  }
  if (input.description !== undefined) {
    fields.push("description = ?");
    values.push(input.description);
  }
  if (input.environmentId !== undefined) {
    fields.push("environment_id = ?");
    values.push(input.environmentId);
  }
  if (input.urgency !== undefined) {
    fields.push("urgency = ?");
    values.push(input.urgency);
  }
  if (input.rank !== undefined) {
    fields.push("rank = ?");
    values.push(input.rank);
  }
  if (input.status !== undefined) {
    fields.push("status = ?");
    values.push(input.status);
  }
  if (input.dueDate !== undefined) {
    fields.push("due_date = ?");
    values.push(input.dueDate);
  }
  if (input.tags !== undefined) {
    fields.push("tags = ?");
    values.push(JSON.stringify(input.tags));
  }
  if (input.completed !== undefined) {
    fields.push("completed = ?");
    values.push(input.completed ? 1 : 0);
  }

  if (fields.length === 0) return existing;

  fields.push("updated_at = datetime('now')");
  values.push(id);

  db.prepare(`UPDATE tasks SET ${fields.join(", ")} WHERE id = ?`).run(
    ...values
  );

  return getTask(id);
}

export function deleteTask(id: number): boolean {
  const db = getDb();
  const result = db.prepare("DELETE FROM tasks WHERE id = ?").run(id);
  return result.changes > 0;
}

export function getEnvironments(): Environment[] {
  const db = getDb();
  const rows = db
    .prepare("SELECT id, name, created_at FROM environments ORDER BY id ASC")
    .all() as { id: number; name: string; created_at: string }[];
  return rows.map((r) => ({ id: r.id, name: r.name, createdAt: r.created_at }));
}

export function createEnvironment(name: string): Environment {
  const db = getDb();
  const result = db
    .prepare("INSERT INTO environments (name) VALUES (?)")
    .run(name);
  const row = db
    .prepare("SELECT id, name, created_at FROM environments WHERE id = ?")
    .get(result.lastInsertRowid) as { id: number; name: string; created_at: string };
  return { id: row.id, name: row.name, createdAt: row.created_at };
}

export function updateEnvironment(
  id: number,
  name: string
): Environment | null {
  const db = getDb();
  const result = db
    .prepare("UPDATE environments SET name = ? WHERE id = ?")
    .run(name, id);
  if (result.changes === 0) return null;
  const row = db
    .prepare("SELECT id, name, created_at FROM environments WHERE id = ?")
    .get(id) as { id: number; name: string; created_at: string } | undefined;
  if (!row) return null;
  return { id: row.id, name: row.name, createdAt: row.created_at };
}

export function deleteEnvironment(id: number): { deleted: boolean; hasTasks: boolean } {
  const db = getDb();
  const taskCount = (
    db
      .prepare("SELECT COUNT(*) AS cnt FROM tasks WHERE environment_id = ?")
      .get(id) as { cnt: number }
  ).cnt;

  if (taskCount > 0) {
    return { deleted: false, hasTasks: true };
  }

  const result = db
    .prepare("DELETE FROM environments WHERE id = ?")
    .run(id);
  return { deleted: result.changes > 0, hasTasks: false };
}

export interface TaskStats {
  total: number;
  completed: number;
  byStatus: { status: string; count: number }[];
  byUrgency: { urgency: string; count: number }[];
}

export function getTaskStats(): TaskStats {
  const db = getDb();

  const total = (
    db.prepare("SELECT COUNT(*) AS cnt FROM tasks").get() as { cnt: number }
  ).cnt;

  const completed = (
    db
      .prepare("SELECT COUNT(*) AS cnt FROM tasks WHERE completed = 1")
      .get() as { cnt: number }
  ).cnt;

  const byStatus = db
    .prepare(
      "SELECT status, COUNT(*) AS count FROM tasks WHERE completed = 0 GROUP BY status"
    )
    .all() as { status: string; count: number }[];

  const byUrgency = db
    .prepare(
      "SELECT urgency, COUNT(*) AS count FROM tasks WHERE completed = 0 GROUP BY urgency"
    )
    .all() as { urgency: string; count: number }[];

  return { total, completed, byStatus, byUrgency };
}
