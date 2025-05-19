import { IInvoiceDetail } from "./IInvoiceDetail";

export interface IInvoice {
    invoiceId: string;
    invoiceStatus: string;
    invoiceDetails?: IInvoiceDetail[];
}