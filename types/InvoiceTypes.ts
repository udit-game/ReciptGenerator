export enum TaxMode {
  IGST = "IGST",
  CGST_SGST = "CGST_SGST",
}

export interface GoodsItem {
  productId: string;
  desc: string;
  hsn: string;
  qty: number;
  rate: number;
}

export interface InvoiceData {
  invoiceNo: string;
  invoiceDate: string;
  billToName: string;
  billToAddress: string;
  billToGstin: string;
  billToState: string;
  billToCode: string;
  taxMode: TaxMode;
  freight: number;
  goods: GoodsItem[];
}

export interface SavedInvoiceSummary {
  id: string;
  invoice_number: string;
  client_id: string;
  client_name: string;
  billToAddress: string;
  billToGstin: string;
  billToState: string;
  billToCode: string;
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
