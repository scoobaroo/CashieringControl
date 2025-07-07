import { IInvoiceDetail } from "./IInvoiceDetail";

export interface IInvoice {
    invoiceid: string;
    bjac_status?: string;
    extendedamount?: number;
    priceperunit?: number;
    statuscode?: string;
    invoicedetails?: IInvoiceDetail[];
}