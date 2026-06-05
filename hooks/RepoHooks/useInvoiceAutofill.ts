import { GoodsItem } from '@/types/InvoiceTypes';
import { safeGetAllAsync } from '@/database/engine';
import { InvoiceQueries } from '@/database/queries';
import { useSQLiteContext } from 'expo-sqlite';
import { useErrorLog } from './useErrorLog';

type HistoricalRow = {
  product_id: string | null;
  snapshot_name: string;
  snapshot_hsn: string;
  quantity: number;
  applied_rate: number;
};

export function useInvoiceAutofill() {
  const db = useSQLiteContext()
  const { recordError } = useErrorLog();
  const fetchHistoricalLineItemsByClientId = async (clientId: string): Promise<GoodsItem[] | null> => {
    
    try {
      const rows = await safeGetAllAsync<{ clientId: string }, HistoricalRow>(
        db, 
        InvoiceQueries.fetchAutofill, 
        { clientId }
      );

      if (!rows || rows.length === 0) return null;

      return rows.map(row => ({
        productId: row.product_id ?? '',
        desc: row.snapshot_name,
        hsn: row.snapshot_hsn,
        qty: row.quantity,
        rate: row.applied_rate
      }));
    } catch (error) {
      await recordError('useInvoiceAutofill.ts, 34', error);
      return null;
    }
  };

  return { fetchHistoricalLineItems: fetchHistoricalLineItemsByClientId };
}