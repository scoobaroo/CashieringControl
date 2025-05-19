import { IInvoice } from "./IInvoice";

export interface IOpportunity {
    opportunityId: string;
    name: string;
    bjac_consignmenttype: string;
    bjac_state: string;
    status: string;
    type: string;
    invoices?: IInvoice[];
}