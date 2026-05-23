import Database from "better-sqlite3";
import path from "path";
import fs from "fs";

const DATA_DIR = path.join(process.cwd(), "data");
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

const DB_PATH = path.join(DATA_DIR, "ceramore.db");

let db: Database.Database;

function getDb(): Database.Database {
  if (!db) {
    db = new Database(DB_PATH);
    db.pragma("journal_mode = WAL");
    db.pragma("foreign_keys = ON");
    initializeDb(db);
  }
  return db;
}

function initializeDb(database: Database.Database) {
  // Check if old schema exists and migrate
  const tableInfo = database.prepare(`PRAGMA table_info(stock_history)`).all() as { name: string }[];
  const hasOldColumn = tableInfo.some((col) => col.name === "quantite_boites");

  if (hasOldColumn) {
    database.exec(`DROP TABLE IF EXISTS stock_history`);
    database.exec(`DROP TABLE IF EXISTS stock_snapshots`);
    database.exec(`DROP TABLE IF EXISTS calibres`);
    database.exec(`DROP TABLE IF EXISTS references_table`);
  }

  // Also check for missing columns on references_table
  const refInfo = database.prepare(`PRAGMA table_info(references_table)`).all() as { name: string }[];
  if (refInfo.length > 0) {
    const hasType = refInfo.some((col) => col.name === "type");
    if (!hasType) {
      database.exec(`DROP TABLE IF EXISTS stock_history`);
      database.exec(`DROP TABLE IF EXISTS stock_snapshots`);
      database.exec(`DROP TABLE IF EXISTS calibres`);
      database.exec(`DROP TABLE IF EXISTS references_table`);
    }
  }

  database.exec(`
    CREATE TABLE IF NOT EXISTS references_table (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      code TEXT NOT NULL DEFAULT '',
      nom TEXT NOT NULL DEFAULT '',
      largeur_cm REAL NOT NULL DEFAULT 0,
      longueur_cm REAL NOT NULL DEFAULT 0,
      pieces_par_boite INTEGER NOT NULL DEFAULT 0,
      m2_par_boite REAL NOT NULL DEFAULT 0,
      prix_unitaire REAL NOT NULL DEFAULT 0,
      quantite INTEGER NOT NULL DEFAULT 0,
      total_m2 REAL NOT NULL DEFAULT 0,
      valeur_stock REAL NOT NULL DEFAULT 0,
      type TEXT NOT NULL DEFAULT 'carrelage' CHECK(type IN ('carrelage', 'produit')),
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS stock_history (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      reference_id INTEGER NOT NULL,
      type TEXT NOT NULL CHECK(type IN ('entree', 'sortie')),
      quantite INTEGER NOT NULL,
      date_entry TEXT NOT NULL DEFAULT (datetime('now')),
      note TEXT,
      FOREIGN KEY (reference_id) REFERENCES references_table(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS stock_snapshots (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      date TEXT NOT NULL,
      total_m2 REAL NOT NULL,
      total_valeur REAL NOT NULL,
      total_quantite INTEGER NOT NULL,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
  `);
}

export default getDb;
