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
