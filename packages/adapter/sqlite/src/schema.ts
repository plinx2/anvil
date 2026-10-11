/**
 * スキーマと、移行。`PRAGMA user_version` で管理する。
 * スキーマを変えるときは、配列の末尾に、移行を足す(既存の要素は、書き換えない)。
 */
export const MIGRATIONS: readonly string[] = [
  `
CREATE TABLE projects (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL UNIQUE,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);
CREATE TABLE repos (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  project_id INTEGER NOT NULL,
  name TEXT NOT NULL,
  path TEXT NOT NULL UNIQUE,
  default_branch TEXT NOT NULL,
  has_remote INTEGER NOT NULL,
  UNIQUE (project_id, name)
);
CREATE TABLE tickets (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  project_id INTEGER NOT NULL,
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  kind TEXT NOT NULL,
  state TEXT NOT NULL,
  awaiting INTEGER NOT NULL,
  auto_gate INTEGER NOT NULL,
  sp REAL,
  design_needed INTEGER NOT NULL,
  slug TEXT NOT NULL,
  target_repos TEXT NOT NULL,
  pr_urls TEXT NOT NULL,
  pr_error TEXT,
  launch_error TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  done_at TEXT,
  UNIQUE (project_id, slug)
);
CREATE TABLE entries (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  ticket_id INTEGER NOT NULL,
  state TEXT NOT NULL,
  role TEXT NOT NULL,
  author_kind TEXT NOT NULL,
  body TEXT NOT NULL,
  created_at TEXT NOT NULL
);
CREATE INDEX entries_ticket ON entries (ticket_id, id);
CREATE TABLE deps (
  ticket_id INTEGER NOT NULL,
  depends_on_id INTEGER NOT NULL,
  PRIMARY KEY (ticket_id, depends_on_id)
);
CREATE TABLE launches (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  ticket_id INTEGER,
  intake_item_id INTEGER,
  state TEXT,
  role TEXT NOT NULL,
  name TEXT NOT NULL,
  session_id TEXT NOT NULL,
  started_at TEXT NOT NULL,
  ended_at TEXT
);
CREATE TABLE history (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  ticket_id INTEGER NOT NULL,
  from_state TEXT,
  to_state TEXT NOT NULL,
  actor_kind TEXT NOT NULL,
  actor_role TEXT,
  created_at TEXT NOT NULL
);
CREATE TABLE reflections (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  ticket_id INTEGER,
  role TEXT NOT NULL,
  state TEXT,
  session_id TEXT,
  good TEXT NOT NULL,
  trouble TEXT NOT NULL,
  hypothesis TEXT NOT NULL,
  proposal TEXT NOT NULL,
  target TEXT NOT NULL,
  evidence TEXT NOT NULL,
  status TEXT NOT NULL,
  reject_reason TEXT,
  created_at TEXT NOT NULL,
  decided_at TEXT
);
CREATE TABLE intakes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  project_id INTEGER NOT NULL,
  source_ticket_id INTEGER,
  discard INTEGER NOT NULL,
  status TEXT NOT NULL,
  created_at TEXT NOT NULL
);
CREATE TABLE intake_items (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  intake_id INTEGER NOT NULL,
  seq INTEGER NOT NULL,
  wish TEXT NOT NULL,
  kind TEXT NOT NULL,
  start_state TEXT,
  slug TEXT,
  auto_gate INTEGER NOT NULL,
  depends_on TEXT NOT NULL,
  ticket_id INTEGER,
  status TEXT NOT NULL
);
CREATE TABLE branches (
  ticket_id INTEGER NOT NULL,
  repo_name TEXT NOT NULL,
  branch TEXT NOT NULL,
  worktree_path TEXT NOT NULL,
  PRIMARY KEY (ticket_id, repo_name)
);
`,
];
