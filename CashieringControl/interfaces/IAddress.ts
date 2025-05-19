
export interface IAddress {
    bjac_addressid: string;
    bjac_address1: string;
    bjac_address2?: string | null;
    bjac_city: string;
    bjac_address1_postalcode: string;
    stateProvince: string; // Formatted value from _bjac_address_stateprovince_value@OData.Community.Display.V1.FormattedValue
    county: string; // Formatted value from _bjac_address_county_value@OData.Community.Display.V1.FormattedValue
    country: string; // Formatted value from _bjac_address_country_value@OData.Community.Display.V1.FormattedValue
    bjac_address_status: number;
    statuscode: number;
    bjac_address_default: boolean;
    bjac_address_type: string; // Vehicle Titling = 694020002
  }