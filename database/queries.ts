import { Client } from '@/hooks/RepoHooks/useClientStorage';
import { QueryContract } from './engine';
import { Product } from '@/hooks/RepoHooks/useProductStorage';
import { ErrorLogPayload, LogFilterPayload } from '@/types/LogsTypes';

export const ClientQueries = {
  insert: {
    sql: `INSERT INTO clients (id, name, address, gstin, tax_type) VALUES (?, ?, ?, ?, ?);`,
    requiredFields: ['id', 'name', 'address', 'gstin', 'tax_type'],
    prepareArgs: (c: Client) => [c.id, c.name, c.address, c.gstin, c.tax_type]
  } as QueryContract<Client>,

  fetchAll: {
    sql: `SELECT * FROM clients ORDER BY name ASC;`,
    requiredFields: [],
    prepareArgs: () => []
  } as QueryContract<void>
};

export const ProductQueries = {
  insert: {
    sql: `INSERT INTO products (id, name, hsn_code, default_rate) VALUES (?, ?, ?, ?);`,
    requiredFields: ['id', 'name', 'hsn_code', 'default_rate'],
    prepareArgs: (p: Product) => [p.id, p.name, p.hsn_code, p.default_rate]
  } as QueryContract<Product>,

  fetchAll: {
    sql: `SELECT * FROM products ORDER BY name ASC;`,
    requiredFields: [],
    prepareArgs: () => []
  } as QueryContract<void>,

  findById: {
    sql: `SELECT * FROM products WHERE id = ?;`,
    requiredFields: ['id'],
    prepareArgs: (p: { id: string }) => [p.id]
  } as QueryContract<{ id: string }>
};

export const InvoiceQueries = {
  insertInvoice: {
    sql: `
      INSERT INTO invoices (
        id, invoice_number, client_id, invoice_date, taxable_amount, 
        freight_amount, tax_type, total_amount, paid_amount, 
        snapshot_client_name, snapshot_client_address, snapshot_client_gstin, 
        snapshot_client_state, snapshot_client_code
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);
    `,
    requiredFields: [
      'id', 'invoiceNo', 'clientId', 'invoiceDate', 'taxableAmount',
      'freight', 'taxMode', 'totalAmount', 'billToName', 'billToAddress',
      'billToGstin', 'billToState', 'billToCode'
    ],
    prepareArgs: (data: any) => [
      data.id, data.invoiceNo, data.clientId, data.invoiceDate, data.taxableAmount,
      data.freight ?? 0, data.taxMode, data.totalAmount, 0,
      data.billToName, data.billToAddress, data.billToGstin, data.billToState, data.billToCode
    ]
  } as QueryContract<any>,

  insertItem: {
    sql: `
      INSERT INTO invoice_items (id, invoice_id, product_id, snapshot_name, snapshot_hsn, quantity, applied_rate)
      VALUES (?, ?, ?, ?, ?, ?, ?);
    `,
    requiredFields: ['id', 'invoiceId', 'desc', 'hsn', 'qty', 'rate'],
    prepareArgs: (item: any) => [
      item.id, item.invoiceId, item.productId ?? null, item.desc, item.hsn, item.qty, item.rate
    ]
  } as QueryContract<any>,

  fetchAutofill: {
    sql: `
      SELECT ii.product_id, ii.snapshot_name, ii.snapshot_hsn, ii.quantity, ii.applied_rate
      FROM invoices i
      JOIN invoice_items ii ON i.id = ii.invoice_id
      WHERE i.client_id = ?
      ORDER BY i.created_at DESC
      LIMIT 10;
    `,
    requiredFields: ['clientId'],
    prepareArgs: (p: { clientId: string }) => [p.clientId]
  } as QueryContract<{ clientId: string }>,

  fetchItemsByInvoiceId: {
    sql: `SELECT product_id, snapshot_name, snapshot_hsn, quantity, applied_rate FROM invoice_items WHERE invoice_id = ?;`,
    requiredFields: ['invoiceId'],
    prepareArgs: (p: { invoiceId: string }) => [p.invoiceId]
  } as QueryContract<{ invoiceId: string }>
};


export const LogQueries = {
  insert: {
    sql: `INSERT INTO error_logs (id, context_tag, error_message, error_stack) VALUES (?, ?, ?, ?);`,
    requiredFields: ['id', 'context_tag', 'error_message'],
    prepareArgs: (l: ErrorLogPayload) => [l.id, l.context_tag, l.error_message, l.error_stack ?? null]
  } as QueryContract<ErrorLogPayload>,

  fetchByDate: {
    // Strips out the time component from created_at and compares it directly
    sql: `
      SELECT * FROM error_logs 
      WHERE strftime('%Y-%m-%d', created_at) = ? 
      ORDER BY created_at DESC;
    `,
    requiredFields: ['targetDate'],
    prepareArgs: (f: LogFilterPayload) => [f.targetDate]
  } as QueryContract<LogFilterPayload>,

  fetchAll: {
    sql: `SELECT * FROM error_logs ORDER BY created_at DESC LIMIT 100;`,
    requiredFields: [],
    prepareArgs: () => []
  } as QueryContract<void>
};