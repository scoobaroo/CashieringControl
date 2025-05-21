import { IInputs } from "../generated/ManifestTypes";
import { IAddress } from "../interfaces/IAddress";
import { ICart } from "../interfaces/ICart";
import { ICartItem } from "../interfaces/ICartItem";
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

    public fetchCartItems = async (cartId: string): Promise<ICartItem[]> => {
      try {
        const query = `?$select=bjac_consigntype,bjac_cartitemid,_bjac_addressvehicletitledto_value,_bjac_cart_value,bjac_comments,bjac_commission,` +
        `bjac_documentationfee,bjac_drive,bjac_hammerprice,bjac_isinvoiced,bjac_name,bjac_ship,bjac_stage,bjac_taxfee,bjac_total,` +
        `bjac_totalamount,bjac_transactiontype,bjac_transporttype,_bjac_vehicle_value,bjac_vehicletitledto&$filter=_bjac_cart_value eq ${cartId}`;
        const result = await this.context.webAPI.retrieveMultipleRecords("bjac_cartitem", query);
        return result.entities.map((raw: any) => ({
          bjac_imageurl: raw["bjac_imageurl"],
          bjac_cartitemId: raw["bjac_cartitemid"],
          bjac_cartId: raw["_bjac_cart_value"],
          bjac_ship: raw["bjac_ship"],
          bjac_drive: raw["bjac_drive"],
          bjac_commission: raw["bjac_commission"],
          bjac_isinvoiced: raw["bjac_isinvoiced"],
          bjac_total: raw["bjac_total"],
          bjac_transactiontypeFormattedValue: raw["bjac_transactiontype@OData.Community.Display.V1.FormattedValue"] || "",
          bjac_transactiontype: raw["bjac_transactiontype"],
          bjac_comments: raw["bjac_comments"] || "",
          bjac_name: raw["bjac_name"],
          bjac_documentationfee: raw["bjac_documentationfee"],
          bjac_documentationfeeFormattedValue: raw["bjac_documentationfee@OData.Community.Display.V1.FormattedValue"] || "",
          bjac_vehicleName: raw["_bjac_vehicle_value@OData.Community.Display.V1.FormattedValue"] || "",
          bjac_vehicleId: raw["_bjac_vehicle_value"],
          bjac_stageFormattedValue: raw["bjac_stage@OData.Community.Display.V1.FormattedValue"] || "",
          bjac_stage: raw["bjac_stage"],
          bjac_hammerprice: raw["bjac_hammerprice"],
          bjac_totalamount: raw["bjac_totalamount"],
          bjac_consigntype: raw["bjac_consigntype"],
          bjac_consigntypeFormattedValue: raw["bjac_consigntype@OData.Community.Display.V1.FormattedValue"] || ""
        }));
      } catch (error) {
        console.error("Error fetching vehicle titling addresses:", error);
        return [];
      }
    }

    public fetchCart = async (accountId: string): Promise<ICart | null> => {
      try {
        const query = `?$select=bjac_cartid,_bjac_customer_value,_bjac_event_value,bjac_open&$filter=(_bjac_customer_value eq ${accountId} and bjac_open eq true)`;
        const result = await this.context.webAPI.retrieveMultipleRecords("bjac_cart", query);
        if(result.entities.length > 0){
          const firstCart = result.entities[0];
          return {
            bjac_eventName: firstCart["_bjac_event_value@OData.Community.Display.V1.FormattedValue"],
            bjac_eventId: firstCart["_bjac_event_value"],
            bjac_cartId: firstCart["bjac_cartid"],
            cartItems: []
          };
        }
        return null;
      } catch (error) {
        console.error("Error fetching vehicle titling addresses:", error);
        return null;
      }
    }

    public fetchOpportunities = async (accountId: string): Promise<IOpportunity[]> => {
      try {
        const query = `?$select=name,bjac_consignmenttype&$filter=_customerid_value eq ${accountId} and statecode eq 0`;
        const result = await this.context.webAPI.retrieveMultipleRecords("opportunity", query);
        return result.entities.map((entity: any) => ({
          opportunityId: entity.opportunityid,
          name: entity.name,
          bjac_consignmenttype: entity["bjac_consignmenttype@OData.Community.Display.V1.FormattedValue"],
          type: "",
          bjac_state: entity["bjac_state@OData.Community.Display.V1.FormattedValue"],
          status: entity["statuscode@OData.Community.Display.V1.FormattedValue"]
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