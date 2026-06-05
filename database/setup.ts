import * as SQLite from 'expo-sqlite';

export async function initializeDatabase(db: SQLite.SQLiteDatabase): Promise<void> {
  await db.execAsync(`
    PRAGMA foreign_keys = OFF;

    CREATE TABLE IF NOT EXISTS clients (
      id TEXT,
      name TEXT,
      address TEXT,
      gstin TEXT,
      tax_type TEXT
    );

    CREATE TABLE IF NOT EXISTS products (
      id TEXT,
      name TEXT,
      hsn_code TEXT,
      default_rate REAL
    );

    CREATE TABLE IF NOT EXISTS invoices (
      id TEXT,
      invoice_number TEXT,
      client_id TEXT,
      snapshot_client_name TEXT,
      snapshot_client_address TEXT,
      snapshot_client_gstin TEXT,
      snapshot_client_state TEXT,
      snapshot_client_code TEXT,
      invoice_date TEXT,
      taxable_amount REAL,
      freight_amount REAL,
      tax_type TEXT,
      total_amount REAL,
      paid_amount REAL,
      created_at TEXT
    );

    CREATE TABLE IF NOT EXISTS invoice_items (
      id TEXT,
      invoice_id TEXT,
      product_id TEXT,
      snapshot_name TEXT,
      snapshot_hsn TEXT,
      quantity INTEGER,
      applied_rate REAL
    );

    CREATE TABLE IF NOT EXISTS error_logs (
        id TEXT,
        context_tag TEXT,
        error_message TEXT,
        error_stack TEXT,
        created_at TEXT
    );

  `);
}