import * as SQLite from 'expo-sqlite';
import { generateRandomId } from '@/utils/Crypto';
import { TaxMode } from '@/types/InvoiceTypes';
import { safeGetAllAsync, safeRunAsync } from '@/database/engine';
import { ClientQueries } from '@/database/queries';
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
  const fetchAllClients = async (): Promise<Client[]> => {
    return await safeGetAllAsync<void, Client>(db, ClientQueries.fetchAll);
  };

  const insertNewClient = async (name: string, address: string, gstin: string, taxType: TaxMode): Promise<Client> => {
    const newClient: Client = {
      id: generateRandomId(),
      name,
      address,
      gstin,
      tax_type: taxType
    };

    await safeRunAsync<Client>(db, ClientQueries.insert, newClient);
    return newClient;
  };

  return { fetchAllClients, insertNewClient };
}