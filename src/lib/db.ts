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
  database.exec(`
    CREATE TABLE IF NOT EXISTS references_table (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      code TEXT NOT NULL UNIQUE,
      nom TEXT NOT NULL,
      largeur_cm REAL NOT NULL,
      longueur_cm REAL NOT NULL,
      pieces_par_boite INTEGER NOT NULL,
      m2_par_boite REAL NOT NULL,
      prix_unitaire_m2 REAL NOT NULL DEFAULT 0,
      seuil_alerte INTEGER NOT NULL DEFAULT 5,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS calibres (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      reference_id INTEGER NOT NULL,
      nom TEXT NOT NULL,
      quantite_boites INTEGER NOT NULL DEFAULT 0,
      FOREIGN KEY (reference_id) REFERENCES references_table(id) ON DELETE CASCADE,
      UNIQUE(reference_id, nom)
    );

    CREATE TABLE IF NOT EXISTS stock_history (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      reference_id INTEGER NOT NULL,
      calibre_id INTEGER,
      type TEXT NOT NULL CHECK(type IN ('entree', 'sortie')),
      quantite_boites INTEGER NOT NULL,
      date_entry TEXT NOT NULL DEFAULT (datetime('now')),
      note TEXT,
      FOREIGN KEY (reference_id) REFERENCES references_table(id) ON DELETE CASCADE,
      FOREIGN KEY (calibre_id) REFERENCES calibres(id) ON DELETE SET NULL
    );

    CREATE TABLE IF NOT EXISTS stock_snapshots (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      date TEXT NOT NULL,
      total_m2 REAL NOT NULL,
      total_valeur REAL NOT NULL,
      total_boites INTEGER NOT NULL,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
  `);
}

export default getDb;
