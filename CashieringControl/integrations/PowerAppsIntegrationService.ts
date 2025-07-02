// CashieringControl/integrations/PowerAppsIntegrationService.ts
import { IInputs } from "../generated/ManifestTypes";
import { IAccountDetails } from "../interfaces/IAccountDetails";
import { IAddress } from "../interfaces/IAddress";
import { ICart } from "../interfaces/ICart";
import { ICartItem } from "../interfaces/ICartItem";
import { IInvoice } from "../interfaces/IInvoice";
import { IOpportunity } from "../interfaces/IOpportunity";
import { IVehicle } from "../interfaces/IVehicle";

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
        `bjac_documentationfee,bjac_drive,bjac_hammerprice,bjac_isinvoiced,bjac_name,bjac_ship,bjac_stage,bjac_total,bjac_taxfee,bjac_imageurl,` +
        `bjac_totalamount,bjac_transactiontype,bjac_transporttype,_bjac_vehicle_value,bjac_vehicletitledto&$filter=_bjac_cart_value eq ${cartId}`;
      const result = await this.context.webAPI.retrieveMultipleRecords("bjac_cartitem", query);
      return await Promise.all(result.entities.map(async (raw: any, index: number) => {
        const vehicle = await this.fetchVehicle(raw["_bjac_vehicle_value"]);
        const opportunity = await this.fetchOpportunityRelatedToVehicleToFindSeller(raw["_bjac_vehicle_value"]);
        console.log("Opportunity found:", opportunity);
        const seller = opportunity ? await this.fetchAccountDetails(opportunity._parentaccountid_value) : null;
        console.log("Seller found:", seller);
        const item: ICartItem = {
          bjac_lot: opportunity!.bjac_lot || "",
          key: index.toString(),
          bjac_taxfee: raw.bjac_taxfee,
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
          bjac_hammerprice: raw["bjac_hammerprice"  ],
          bjac_totalamount: raw["bjac_totalamount"],
          bjac_consigntype: raw["bjac_consigntype"],
          bjac_consigntypeFormattedValue: raw["bjac_consigntype@OData.Community.Display.V1.FormattedValue"] || "",
          vehicle: vehicle,
          seller: seller || null,
        };
        return item;
      }));
    } catch (error) {
      console.error("Error fetching cart items:", error);
      return [];
    }
  }

  public fetchCart = async (accountId: string): Promise<ICart | undefined> => {
    try {
      const query = `?$select=bjac_cartid,_bjac_customer_value,_bjac_event_value,bjac_open&$filter=(_bjac_customer_value eq ${accountId} and bjac_open eq true)`;
      const result = await this.context.webAPI.retrieveMultipleRecords("bjac_cart", query);
      if (result.entities.length > 0) {
        const firstCart = result.entities[0];
        return {
          bjac_eventName: firstCart["_bjac_event_value@OData.Community.Display.V1.FormattedValue"],
          bjac_eventId: firstCart["_bjac_event_value"],
          bjac_cartId: firstCart["bjac_cartid"],
          cartItems: []
        };
      }
    } catch (error) {
      console.error("Error fetching vehicle titling addresses:", error);
      return undefined;
    }
  }

  public fetchAccountDetails = async (accountId: string): Promise<IAccountDetails | null> => {
    try {
      const result = await this.context.webAPI.retrieveRecord("account", accountId);
      if(result) {
        return result as IAccountDetails;
      }
      return null;
    } catch (error) {
      console.error("Error fetching account details:", error);
      return null;
    }
  }

  public fetchOpportunityRelatedToVehicleToFindSeller = async (vehicleId: string): Promise<IOpportunity | null> => {
    try {
      const query = `?$filter=_bjac_vehicle_value eq ${vehicleId}`;
      const result = await this.context.webAPI.retrieveMultipleRecords("opportunity", query);
      if (result.entities.length > 0) {
        return result.entities[0] as IOpportunity;
      }
      return null;
    } catch (error) {
      console.error("Error fetching opportunity related to vehicle:", error);
      return null;
    }
  }

  public fetchVehiclePhoto = async (vehicleId: string): Promise<string> => {
    try {
      const query = `bjac_consignment_photos?$select=bjac_consignment_photo_fullpath,bjac_consignment_photo_phototype,_bjac_vehicleid_value&$filter=(bjac_consignment_photo_phototype eq 5 and _bjac_vehicleid_value eq ${vehicleId} and statecode eq 0)&$top=1`;
      const result = await this.context.webAPI.retrieveMultipleRecords("bjac_consignment_photos", query);
      if (result.entities.length > 0) {
        const photo = result.entities[0];
        return photo["bjac_consignment_photo_fullpath"] || "https://cdn.motor1.com/images/mgl/W8M4Go/s1/2015-lamborghini-veneno-roadster.jpg"; // Fallback image
      }
      return "https://cdn.motor1.com/images/mgl/W8M4Go/s1/2015-lamborghini-veneno-roadster.jpg"; // Fallback image
    } catch (error) {
      console.error("Error fetching vehicle photo:", error);
      return "https://cdn.motor1.com/images/mgl/W8M4Go/s1/2015-lamborghini-veneno-roadster.jpg"; // Fallback image
    }
  }

  public fetchVehicle = async (vehicleId: string): Promise<IVehicle | null> => {
  try {
    const query = `?$select=bjac_vehicle_checkin_mileage,bjac_vehicle_cylinders_optionset,bjac_vehicle_engine,bjac_vehicle_exterior_color,
      bjac_vehicle_interior_color,bjac_vehicle_longdescription,_bjac_vehicle_maketable_value,_bjac_vehicle_modeltable_value,
      bjac_vehicle_number_of_cylinders_hybrid,bjac_vehicle_power_source,bjac_vehicle_shortdescription,bjac_vehicle_style,
      bjac_vehicle_transmissionspeeds_optionset,bjac_vehicle_transmission_type,bjac_vehicle_vin,bjac_vehicle_year
      &$filter=bjac_vehicleid eq ${vehicleId}`;
      const result = await this.context.webAPI.retrieveMultipleRecords("bjac_vehicle", query);
      if (result.entities.length > 0) {
        const v = result.entities[0];
        const vehicle: IVehicle = {
          bjac_vehicleid: v.bjac_vehicleid,
          bjac_vehicle_checkin_mileage: v.bjac_vehicle_checkin_mileage ?? undefined,
          bjac_vehicle_cylinders_optionset: v.bjac_vehicle_cylinders_optionset ?? undefined,
          bjac_vehicle_cylinders_optionset_formatted: v["bjac_vehicle_cylinders_optionset@OData.Community.Display.V1.FormattedValue"],
          bjac_vehicle_engine: v.bjac_vehicle_engine,
          bjac_vehicle_exterior_color: v.bjac_vehicle_exterior_color,
          bjac_vehicle_interior_color: v.bjac_vehicle_interior_color,
          bjac_vehicle_longdescription: v.bjac_vehicle_longdescription,
          _bjac_vehicle_maketable_value: v._bjac_vehicle_maketable_value,
          _bjac_vehicle_maketable_value_formatted: v["_bjac_vehicle_maketable_value@OData.Community.Display.V1.FormattedValue"],
          _bjac_vehicle_modeltable_value: v._bjac_vehicle_modeltable_value,
          _bjac_vehicle_modeltable_value_formatted: v["_bjac_vehicle_modeltable_value@OData.Community.Display.V1.FormattedValue"],
          bjac_vehicle_number_of_cylinders_hybrid: v.bjac_vehicle_number_of_cylinders_hybrid ?? undefined,
          bjac_vehicle_number_of_cylinders_hybrid_formatted: v["bjac_vehicle_number_of_cylinders_hybrid@OData.Community.Display.V1.FormattedValue"],
          bjac_vehicle_power_source: v.bjac_vehicle_power_source,
          bjac_vehicle_power_source_formatted: v["bjac_vehicle_power_source@OData.Community.Display.V1.FormattedValue"],
          bjac_vehicle_shortdescription: v.bjac_vehicle_shortdescription,
          bjac_vehicle_style: v.bjac_vehicle_style,
          bjac_vehicle_transmissionspeeds_optionset: v.bjac_vehicle_transmissionspeeds_optionset,
          bjac_vehicle_transmissionspeeds_optionset_formatted: v["bjac_vehicle_transmissionspeeds_optionset@OData.Community.Display.V1.FormattedValue"],
          bjac_vehicle_transmission_type: v.bjac_vehicle_transmission_type,
          bjac_vehicle_transmission_type_formatted: v["bjac_vehicle_transmission_type@OData.Community.Display.V1.FormattedValue"],
          bjac_vehicle_vin: v.bjac_vehicle_vin,
          bjac_vehicle_year: v.bjac_vehicle_year
        };
        return vehicle;
      }
      return null;
    } catch (error) {
      console.error("Error fetching vehicle:", error);
      return null;
    }
  };

}