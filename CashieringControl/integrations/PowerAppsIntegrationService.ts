import { IInputs } from "../generated/ManifestTypes";
import { IAddress } from "../interfaces/IAddress";
import { IInvoice } from "../interfaces/IInvoice";
import { IOpportunity } from "../interfaces/IOpportunity";

export default class PowerAppsIntegrationService {

    private context: ComponentFramework.Context<IInputs>;
    public constructor(context: ComponentFramework.Context<IInputs>) {
        this.context = context;
    }

    public fetchVehicleTitlingAddresses = async (accountId: string): Promise<IAddress[]> => {
      try {
        const query = `?$filter=(_bjac_address_account_value eq ${accountId} and Microsoft.Dynamics.CRM.In(PropertyName='bjac_address_type',PropertyValues=['694020002']) and statecode eq 0)`;
        const result = await this.context.webAPI.retrieveMultipleRecords("bjac_address", query);
        return result.entities.map((entity: any) => ({
          bjac_addressid: entity.bjac_addressid,
          bjac_address1: entity.bjac_address1,
          bjac_address2: entity.bjac_address2,
          bjac_city: entity.bjac_city,
          bjac_address1_postalcode: entity.bjac_address1_postalcode,
          stateProvince: entity["_bjac_address_stateprovince_value@OData.Community.Display.V1.FormattedValue"],
          county: entity["_bjac_address_county_value@OData.Community.Display.V1.FormattedValue"],
          country: entity["_bjac_address_country_value@OData.Community.Display.V1.FormattedValue"],
          bjac_address_status: entity.bjac_address_status,
          statuscode: entity.statuscode,
          bjac_address_default: entity.bjac_address_default,
          bjac_address_type: entity.bjac_address_type,
        }));
      } catch (error) {
        console.error("Error fetching vehicle titling addresses:", error);
        return [];
      }
    };

    public fetchOpportunities = async (accountId: string): Promise<IOpportunity[]> => {
      try {
        const query = `?$select=name,bjac_consignmenttype&$filter=_customerid_value eq ${accountId} and statecode eq 0`;
        const result = await this.context.webAPI.retrieveMultipleRecords("opportunity", query);
        return result.entities.map((entity: any) => ({
          opportunityId: entity.opportunityid,
          name: entity.name,
          bjac_consignmenttype: entity["bjac_consignmenttype@OData.Community.Display.V1.FormattedValue"],
          type: ""
        }));
      } catch (error) {
        console.error("Error fetching vehicle titling addresses:", error);
        return [];
      }
    };

    public fetchInvoices = async (opportunityId: string): Promise<IInvoice[]> => {
      try {
        const query = `?$select=invoiceid,statuscode&$expand=invoice_details($select=invoicedetailid,baseamount,_productid_value,extendedamount,priceperunit,quantity)&$filter=_opportunityid_value eq ${opportunityId}`;
        const result = await this.context.webAPI.retrieveMultipleRecords("invoice", query);
        return result.entities.map((entity: any) => ({
          invoiceId: entity.invoiceid,
          invoiceStatus: entity["statuscode@OData.Community.Display.V1.FormattedValue"],
          invoiceDetails: entity.invoice_details ? entity.invoice_details.map((detail: any) => ({
            invoiceDetailId: detail.invoicedetailid,
            extendedamount: detail.extendedamount,
            priceperunit: detail.priceperunit,
            quantity: detail.quantity,
          })) : []
        }));
      } catch (error) {
        console.error("Error fetching invoices:", error);
        return [];
      }
    };  
}