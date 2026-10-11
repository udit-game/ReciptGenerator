import { useCallback } from 'react';
import * as SQLite from 'expo-sqlite';
import { generateRandomId } from '@/utils/Crypto';
import { TaxMode } from '@/types/InvoiceTypes';
import { safeGetAllAsync, safeGetFirstAsync, safeRunAsync } from '@/database/engine';
import { ClientQueries, ProductQueries } from '@/database/queries';
import { useSQLiteContext } from 'expo-sqlite';

export interface Client {
  id: string;
  name: string;
  address: string;
  gstin: string;
  tax_type: TaxMode;
}

export function useClientStorage() {
  const db = useSQLiteContext()
  const fetchAllClients = useCallback(async (): Promise<Client[]> => {
    return await safeGetAllAsync<void, Client>(db, ClientQueries.fetchAll);
  }, [db]);

  const insertNewClient = useCallback(async (name: string, address: string, gstin: string, taxType: TaxMode): Promise<Client> => {
    const newClient: Client = {
      id: generateRandomId(),
      name,
      address,
      gstin,
      tax_type: taxType
    };

    await safeRunAsync<Client>(db, ClientQueries.insert, newClient);
    return newClient;
  }, [db]);

  const getClientById = useCallback(async (id: string): Promise<Client | null> => {
    const result = await safeGetFirstAsync<{ id: string }, Client>(db, ClientQueries.getClientById, {id});
    return result;
  }, [db]);

  return { fetchAllClients, insertNewClient, getClientById };
}