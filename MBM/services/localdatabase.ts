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

    CREATE TABLE IF NOT EXISTS pending_logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      userID TEXT NOT NULL,
      name TEXT NOT NULL,
      logDate TEXT NOT NULL,
      ingressTime TEXT,
      exitTime TEXT,
      description TEXT,
      image TEXT,
      created_at TEXT NOT NULL,
      synced INTEGER DEFAULT 0,
      server_id TEXT
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

// ============== LOCAL LOG STORAGE FUNCTIONS ==============

export const savePendingLog = async (log: any): Promise<number> => {
  try {
    await initDatabase();
    if (!db) db = SQLite.openDatabaseSync("localdatabase.db");
    
    const escape = (s: any) => String(s ?? "").replace(/'/g, "''");
    const now = new Date().toISOString();
    
    db.execSync(`
      INSERT INTO pending_logs (userID, name, logDate, ingressTime, exitTime, description, image, created_at, synced)
      VALUES (
        '${escape(log.userID)}',
        '${escape(log.name)}',
        '${escape(log.logDate)}',
        ${log.ingressTime ? `'${escape(log.ingressTime)}'` : 'NULL'},
        ${log.exitTime ? `'${escape(log.exitTime)}'` : 'NULL'},
        ${log.description ? `'${escape(log.description)}'` : 'NULL'},
        ${log.image ? `'${escape(log.image)}'` : 'NULL'},
        '${escape(now)}',
        0
      );
    `);
    
    const result = db.getFirstSync<{ id: number }>(
      "SELECT id FROM pending_logs ORDER BY id DESC LIMIT 1"
    );
    
    return result?.id ?? 0;
  } catch (error) {
    console.error("savePendingLog error:", error);
    throw error;
  }
};

export const getPendingLogs = async (): Promise<any[]> => {
  try {
    await initDatabase();
    if (!db) db = SQLite.openDatabaseSync("localdatabase.db");
    
    const results = db.getAllSync<any>(
      "SELECT * FROM pending_logs WHERE synced = 0 ORDER BY created_at ASC"
    );
    return results || [];
  } catch (error) {
    console.error("getPendingLogs error:", error);
    return [];
  }
};

export const markLogAsSynced = async (logId: number, serverId: string): Promise<void> => {
  try {
    await initDatabase();
    if (!db) db = SQLite.openDatabaseSync("localdatabase.db");
    
    const escape = (s: string) => s.replace(/'/g, "''");
    db.execSync(`
      UPDATE pending_logs
      SET synced = 1, server_id = '${escape(serverId)}'
      WHERE id = ${logId};
    `);
  } catch (error) {
    console.error("markLogAsSynced error:", error);
    throw error;
  }
};

export const deletePendingLog = async (logId: number): Promise<void> => {
  try {
    await initDatabase();
    if (!db) db = SQLite.openDatabaseSync("localdatabase.db");
    
    db.execSync(`DELETE FROM pending_logs WHERE id = ${logId};`);
  } catch (error) {
    console.error("deletePendingLog error:", error);
    throw error;
  }
};

export const getLocalUserLogs = async (userID: string): Promise<any[]> => {
  try {
    await initDatabase();
    if (!db) db = SQLite.openDatabaseSync("localdatabase.db");
    
    const results = db.getAllSync<any>(
      `SELECT * FROM pending_logs WHERE userID = '${userID.replace(/'/g, "''")}' ORDER BY logDate DESC`
    );
    return results || [];
  } catch (error) {
    console.error("getLocalUserLogs error:", error);
    return [];
  }
};