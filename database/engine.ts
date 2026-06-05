import * as SQLite from 'expo-sqlite';

export const DB_NAME = 'ssi_invoices.db';

export interface QueryContract<T> {
  sql: string;
  requiredFields: (keyof T)[];
  prepareArgs: (data: T) => any[];
}

/**
 * Validates data against a contract. Handles optional payloads smoothly.
 */
function validateAndPrepare<T>(contract: QueryContract<T>, payload?: T): any[] {
  // Bypasses strict compile checks internally by treating the runtime payload object as 'any'
  const safePayload = (payload ?? {}) as any;

  // 1. The Checker can now inspect fields safely without 'undefined' or 'void' blockages
  for (const field of contract.requiredFields) {
    if (safePayload[field] === undefined) {
      throw new Error(
        `[DB VALIDATION CRASH]: Missing mandatory field "${String(field)}" inside query payload.`
      );
    }
  }

  // 2. The Giver maps arguments cleanly
  return contract.prepareArgs(safePayload).map(value => (value === undefined ? null : value));
}

/**
 * Executes a safe, validated database mutation query.
 */
export async function safeRunAsync<T>(
  db: SQLite.SQLiteDatabase,
  contract: QueryContract<T>,
  payload?: T // Made optional
): Promise<SQLite.SQLiteRunResult> {
  const sanitizedArgs = validateAndPrepare(contract, payload);
  return await db.runAsync(contract.sql, sanitizedArgs);
}

/**
 * Executes a safe, validated select query returning all matching rows.
 */
export async function safeGetAllAsync<T, R>(
  db: SQLite.SQLiteDatabase,
  contract: QueryContract<T>,
  payload?: T // Made optional
): Promise<R[]> {
  const sanitizedArgs = validateAndPrepare(contract, payload);
  return await db.getAllAsync<R>(contract.sql, sanitizedArgs);
}

/**
 * Executes a safe, validated select query returning the first matching row.
 */
export async function safeGetFirstAsync<T, R>(
  db: SQLite.SQLiteDatabase,
  contract: QueryContract<T>,
  payload?: T // Made optional
): Promise<R | null> {
  const sanitizedArgs = validateAndPrepare(contract, payload);
  return await db.getFirstAsync<R>(contract.sql, sanitizedArgs);
}