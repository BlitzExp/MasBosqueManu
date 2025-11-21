import * as SQLite from "expo-sqlite";

let db: SQLite.SQLiteDatabase | null = null;

export const initDatabase = async () => {
  if (db) return;

  db = SQLite.openDatabaseSync("localdatabase.db");

  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS user_data (
      user_id TEXT PRIMARY KEY NOT NULL,
      name TEXT,
      nVisits TEXT,
      dateRegistered TEXT,
      lastVisit TEXT,
      role TEXT,
      startSessionTime TEXT
    );

    CREATE TABLE IF NOT EXISTS records (
      record_id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id TEXT,
      arrivalTime TEXT,
      departureTime TEXT,
      image TEXT,
      description TEXT,
      location TEXT,
      userName TEXT
    );

    CREATE TABLE IF NOT EXISTS emergencies (
      emergency_id INTEGER PRIMARY KEY AUTOINCREMENT,
      timeAlert TEXT,
      location TEXT,
      description TEXT,
      date TEXT
    );

    CREATE TABLE IF NOT EXISTS arrival (
      arrival_id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT,
      arrivalTime TEXT,
      departureTime TEXT,
      accepted INTEGER,
      user_id TEXT
    );

    CREATE TABLE IF NOT EXISTS locations (
      location_id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT,
      latitude REAL,
      longitude REAL,
      zoneTipe TEXT
    );
  `);
};

export const saveUser = async (
  userId: string,
  name: string,
  nVisits: string,
  dateRegistered: string,
  lastVisit: string,
  role: string
) => {
  try {
    db = SQLite.openDatabaseSync("localdatabase.db");
    const escape = (s: string) => s.replace(/'/g, "''");
    db.execSync(
      `
      INSERT OR REPLACE INTO user_data (user_id, name, nVisits, dateRegistered, lastVisit, role)
      VALUES ('${escape(userId)}', '${escape(name)}', '${escape(nVisits)}', '${escape(dateRegistered)}', '${escape(lastVisit)}', '${escape(role)}');
    `
    );
  } catch (error) {
    console.error("saveUser error:", error);
  }
};

export const getUserType: () => Promise<string> = async () => {
  try {
    db = SQLite.openDatabaseSync("localdatabase.db");
    db.execSync(`
      CREATE TABLE IF NOT EXISTS user_data (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        role TEXT
      );
    `);
    const result = db.getFirstSync<{ role?: string }>(
      "SELECT role FROM user_data LIMIT 1"
    );

    if (result && result.role) {
      return result.role;
    }
    return "user";
  } catch (error) {
    console.error("getUserType error:", error);
    return "user"; 
  }
};

export const getUser = async (): Promise<{
  userId?: string;
  name?: string;
  nvisits?: string;
  dateRegistered?: string;
  lastVisit?: string;
  role?: string;
} | null> => {
  try {
    db = SQLite.openDatabaseSync("localdatabase.db");
    db.execSync(`
      CREATE TABLE IF NOT EXISTS user_data (
        user_id TEXT PRIMARY KEY NOT NULL,
        name TEXT,
        nVisits TEXT,
        dateRegistered TEXT,
        lastVisit TEXT,
        role TEXT
      );
    `);

    const result = db.getFirstSync<{
      user_id?: string;
      name?: string;
      nVisits?: string;
      dateRegistered?: string;
      lastVisit?: string;
      role?: string;
    }>(
      "SELECT user_id, name, nVisits, dateRegistered, lastVisit, role FROM user_data LIMIT 1"
    );

    if (result) {
      return {
        userId: result.user_id,
        name: result.name,
        nvisits: result.nVisits,
        dateRegistered: result.dateRegistered,
        lastVisit: result.lastVisit,
        role: result.role,
      };
    }

    return null;
  } catch (error) {
    console.error("getUser error:", error);
    return null;
  }
};

export const clearUserData = async (): Promise<void> => {
  try {
    db = SQLite.openDatabaseSync("localdatabase.db");
    db.execSync(`DELETE FROM user_data;`);
  } catch (error) {
    console.error("clearUserData error:", error);
  }
};