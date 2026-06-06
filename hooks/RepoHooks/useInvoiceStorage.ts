import { InvoiceData, GoodsItem } from '@/types/InvoiceTypes';
import { generateRandomId } from '@/utils/Crypto';
import { InvoiceQueries } from '../../database/queries';
import { safeGetAllAsync } from '@/database/engine';
import { useSQLiteContext } from 'expo-sqlite';

export interface SavedInvoiceSummary {
  id: string;
  invoice_number: string;
  client_id: string;
  client_name: string;
  invoice_date: string;
  taxable_amount: number;
  freight_amount: number;
  tax_type: string;
  total_amount: number;
  paid_amount: number;
  created_at: string;
}

export interface InvoiceFilters {
  searchQuery?: string;
  clientId?: string;
  productId?: string;
  startDate?: string;
  endDate?: string;
}

export function useInvoiceStorage() {
  const db = useSQLiteContext()
  const saveInvoice = async (data: InvoiceData, clientId: string) => {
    const invoiceId = generateRandomId();
    const taxableAmount = data.goods.reduce((acc, item) => acc + (item.qty * item.rate), 0);
    const totalAmount = taxableAmount + data.freight;
      await db.withTransactionAsync(async () => {
        // 1. Validate and write main invoice record safely
        const sanitizedInvoicePayload = {
          ...data,
          id: invoiceId,
          clientId,
          taxableAmount,
          totalAmount
        };
        
        for (const field of InvoiceQueries.insertInvoice.requiredFields) {
          if ((sanitizedInvoicePayload as any)[field] === undefined) {
            throw new Error(`[DB VALIDATION ERROR]: Missing invoice field: ${String(field)}`);
          }
        }
        await db.runAsync(
          InvoiceQueries.insertInvoice.sql, 
          InvoiceQueries.insertInvoice.prepareArgs(sanitizedInvoicePayload)
        );

        // 2. Write line items safely
        for (const item of data.goods) {
          const sanitizedItemPayload = {
            ...item,
            id: generateRandomId(),
            invoiceId
          };
          
          // Fixed: Cast as 'any' to allow dynamic string indexing here as well
          for (const field of InvoiceQueries.insertItem.requiredFields) {
            if ((sanitizedItemPayload as any)[field] === undefined) {
              throw new Error(`[DB VALIDATION ERROR]: Missing line item field: ${String(field)}`);
            }
          }
          await db.runAsync(
            InvoiceQueries.insertItem.sql, 
            InvoiceQueries.insertItem.prepareArgs(sanitizedItemPayload)
          );
        }
      });
      return invoiceId;
    
  };

  const getInvoices = async (filters?: InvoiceFilters): Promise<SavedInvoiceSummary[]> => {
    const { sql, args } = InvoiceQueries.buildFilteredQuery(filters);
    return await db.getAllAsync<SavedInvoiceSummary>(sql, args);
  };

  const getInvoiceItems = async (invoiceId: string): Promise<GoodsItem[]> => {
    const rows = await safeGetAllAsync<{ invoiceId: string }, any>(
      db, 
      InvoiceQueries.fetchItemsByInvoiceId, 
      { invoiceId }
    );
    
    return rows.map(row => ({
      productId: row.product_id || '',
      desc: row.snapshot_name,
      hsn: row.snapshot_hsn,
      qty: row.quantity,
      rate: row.applied_rate,
    }));
  };

  return { saveInvoice, getInvoices, getInvoiceItems };
}