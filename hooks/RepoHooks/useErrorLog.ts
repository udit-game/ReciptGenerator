import * as SQLite from 'expo-sqlite';
import { generateRandomId } from '@/utils/Crypto';
import { DB_NAME, safeGetAllAsync, safeRunAsync } from '@/database/engine';
import { LogQueries } from '@/database/queries';
import { ErrorLogPayload, SavedErrorLog, LogFilterPayload } from '@/types/LogsTypes';
import { useSQLiteContext } from 'expo-sqlite';

export function useErrorLog() {
  const db = useSQLiteContext()
  
  const recordError = async (error: any): Promise<void> => {
    try {
      const payload: ErrorLogPayload = {
        id: generateRandomId(),
        error_message: error instanceof Error ? error.message : String(error),
        error_stack: error instanceof Error ? error.stack : null,
      };

      await safeRunAsync<ErrorLogPayload>(db, LogQueries.insert, payload);
    } catch (loggingSystemCrash) {
      console.error("CRITICAL: Log writing mechanism failed on-device:", loggingSystemCrash);
    }
  };

  const getLogsByDate = async (dateIsoString: string): Promise<SavedErrorLog[]> => {
    return await safeGetAllAsync<LogFilterPayload, SavedErrorLog>(
      db, 
      LogQueries.fetchByDate, 
      { targetDate: dateIsoString }
    );
  };

  const getAllLogs = async (): Promise<SavedErrorLog[]> => {
    return await safeGetAllAsync<void, SavedErrorLog>(db, LogQueries.fetchAll);
  };

  return { recordError, getLogsByDate, getAllLogs };
}