import { IInvoice } from "./IInvoice";

export interface IOpportunity {
    _parentaccountid_value: string;
    bjac_lot: string;
    opportunityid: string;
    name: string;
    invoices?: IInvoice[];
}