import { MapPin } from "@/Modelo/MapPins";
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
      zoneType TEXT
    );
  `);
  try {
    db.getFirstSync("SELECT user_id FROM user_data LIMIT 1");
  } catch (err) {
    try {
      db.execSync(`BEGIN TRANSACTION;
        CREATE TABLE IF NOT EXISTS new_user_data (
          user_id TEXT PRIMARY KEY NOT NULL,
          name TEXT,
          nVisits TEXT,
          dateRegistered TEXT,
          lastVisit TEXT,
          role TEXT,
          startSessionTime TEXT
        );
        INSERT INTO new_user_data (role)
          SELECT role FROM user_data;
        DROP TABLE user_data;
        ALTER TABLE new_user_data RENAME TO user_data;
      COMMIT;`);
    } catch (migrateError) {
      console.error("user_data migration error:", migrateError);
    }
  }
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
    await initDatabase();
    if (!db) db = SQLite.openDatabaseSync("localdatabase.db");
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
    await initDatabase();
    if (!db) db = SQLite.openDatabaseSync("localdatabase.db");
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
    await initDatabase();
    if (!db) db = SQLite.openDatabaseSync("localdatabase.db");

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

export const getUserName = async (): Promise<string> => {
  try {
    db = SQLite.openDatabaseSync("localdatabase.db");
    const result = db.getFirstSync<{ name?: string }>(
      "SELECT name FROM user_data LIMIT 1"
    );
    if (result && result.name) {
      return result.name;
    }
    return "";
  } catch (error) {
    console.error("getUserName error:", error);
    return "";
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

export const addPinsLocations = async (pins: MapPin[]) => {
  try {
    db = SQLite.openDatabaseSync("localdatabase.db");

    const escape = (s: any) =>
      String(s ?? "").replace(/'/g, "''");

    for (const pin of pins) {
      db.execSync(`
        INSERT OR REPLACE INTO locations (name, latitude, longitude, zoneType)
        VALUES (
          '${escape(pin?.name)}',
          ${pin?.latitude ?? 0},
          ${pin?.longitude ?? 0},
          '${escape(pin?.zoneType)}'
        );
      `);
    }
  } catch (error) {
    console.error("addPinsLocations error:", error);
  }
};


export const getPinsLocations = async (): Promise<MapPin[]> => {
  try {
    db = SQLite.openDatabaseSync("localdatabase.db");
    const results = db.getAllSync<{
      location_id: number;
      name: string;
      latitude: number;
      longitude: number;
      zoneType?: string;
    }>(
      "SELECT location_id, name, latitude, longitude, zoneType FROM locations"
    );
    return results.map((row) => ({
      id: String(row.location_id),
      name: row.name,
      latitude: row.latitude,
      longitude: row.longitude,
      zoneType: row.zoneType,
    }));
  } catch (error) {
    console.error("getPinsLocations error:", error);
    return [];
  }
};