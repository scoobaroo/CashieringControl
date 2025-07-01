export interface IAccountDetails {
  accountid: string;

  bjac_account_taxid?: string;
  bjac_customer_dealer_name?: string;

  bjac_account_taxidexpiration?: string; // ISO 8601 format
  bjac_account_taxidexpiration_formatted?: string;

  bjac_account_dealerlicenseexpiration?: string;
  bjac_account_dealerlicenseexpiration_formatted?: string;

  // Tax ID State Lookup
  _bjac_account_taxid_state_value?: string;
  _bjac_account_taxid_state_value_formatted?: string;

  // Default Address Lookup
  _bjac_account_defaultaddresstable_value?: string;
  _bjac_account_defaultaddresstable_value_formatted?: string;
  // Default Email Lookup
  _bjac_account_defaultemail_value?: string | null;
  // (no formatted or logical name info in this sample)

  // Default Phone Lookup
  _bjac_account_defaultphone_value?: string;
  _bjac_account_defaultphone_value_formatted?: string;
}
