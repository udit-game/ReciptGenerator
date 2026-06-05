import { generateRandomId } from '@/utils/Crypto';
import { safeGetAllAsync, safeRunAsync, safeGetFirstAsync } from '@/database/engine';
import { ProductQueries } from '@/database/queries';
import { useSQLiteContext } from 'expo-sqlite';

export interface Product {
  id: string;
  name: string;
  hsn_code: string;
  default_rate: number;
}

export function useProductStorage() {
  const db = useSQLiteContext()
  const fetchAllProducts = async (): Promise<Product[]> => {
    return await safeGetAllAsync<void, Product>(db, ProductQueries.fetchAll);
  };

  const insertNewProduct = async (name: string, hsnCode: string, defaultRate: number): Promise<Product> => {
    const newProduct: Product = {
      id: generateRandomId(),
      name,
      hsn_code: hsnCode,
      default_rate: defaultRate
    };

    await safeRunAsync<Product>(db, ProductQueries.insert, newProduct);
    return newProduct;
  };

  const getProductById = async (id: string): Promise<Product | null> => {
    return await safeGetFirstAsync<{ id: string }, Product>(db, ProductQueries.findById, { id });
  };

  return { fetchAllProducts, insertNewProduct, getProductById };
}