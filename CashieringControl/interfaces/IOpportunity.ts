import { IInvoice } from "./IInvoice";
import { IVehicle } from "./IVehicle";

export interface IOpportunity {
    _parentaccountid_value: string;
    bjac_lot: string;
    opportunityid: string;
    name: string;
    invoices?: IInvoice[];
    _bjac_vehicle_value?: string;
    vehicle?: IVehicle | null;
}