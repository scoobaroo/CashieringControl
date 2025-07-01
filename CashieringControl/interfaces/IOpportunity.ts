import { IInvoice } from "./IInvoice";

export interface IOpportunity {
    _parentaccountid_value: string;
    opportunityid: string;
    name: string;
    invoices?: IInvoice[];
}