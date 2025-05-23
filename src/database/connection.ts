import sqlite3 from 'sqlite3';
import { promisify } from 'util';

class Database {
  private db: sqlite3.Database;

  constructor() {
    const dbPath = process.env.DATABASE_URL || ':memory:';
    this.db = new sqlite3.Database(dbPath, (err) => {
      if (err) {
        console.error('Error opening database:', err);
      } else {
        console.log('Connected to database');
      }
    });
  }

  async run(sql: string, params: any[] = []): Promise<sqlite3.RunResult> {
    return new Promise((resolve, reject) => {
      this.db.run(sql, params, function(err) {
        if (err) reject(err);
        else resolve(this);
      });
    });
  }

  async get<T>(sql: string, params: any[] = []): Promise<T | undefined> {
    return new Promise((resolve, reject) => {
      this.db.get(sql, params, (err, row) => {
        if (err) reject(err);
        else resolve(row as T);
      });
    });
  }

  async all<T>(sql: string, params: any[] = []): Promise<T[]> {
    return new Promise((resolve, reject) => {
      this.db.all(sql, params, (err, rows) => {
        if (err) reject(err);
        else resolve(rows as T[]);
      });
    });
  }

  async close(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.db.close((err) => {
        if (err) reject(err);
        else resolve();
      });
    });
  }
}

const db = new Database();

export async function initializeDatabase() {
  // Create events table
  await db.run(`
    CREATE TABLE IF NOT EXISTS events (
      id TEXT PRIMARY KEY,
      userId TEXT NOT NULL,
      title TEXT NOT NULL,
      eventTime TEXT NOT NULL,
      createdAt TEXT NOT NULL
    )
  `);

  // Create devices table
  await db.run(`
    CREATE TABLE IF NOT EXISTS devices (
      id TEXT PRIMARY KEY,
      userId TEXT NOT NULL,
      pushToken TEXT NOT NULL,
      createdAt TEXT NOT NULL,
      UNIQUE(userId, pushToken)
    )
  `);

  // Create indexes for better performance
  await db.run(`
    CREATE INDEX IF NOT EXISTS idx_events_userId ON events(userId)
  `);

  await db.run(`
    CREATE INDEX IF NOT EXISTS idx_events_eventTime ON events(eventTime)
  `);

  await db.run(`
    CREATE INDEX IF NOT EXISTS idx_events_userId_eventTime ON events(userId, eventTime)
  `);

  await db.run(`
    CREATE INDEX IF NOT EXISTS idx_devices_userId ON devices(userId)
  `);

  await db.run(`
    CREATE INDEX IF NOT EXISTS idx_devices_pushToken ON devices(pushToken)
  `);

  console.log('Database initialized with tables and indexes');
}

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('Closing database connection...');
  await db.close();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('Closing database connection...');
  await db.close();
  process.exit(0);
});

export { db };