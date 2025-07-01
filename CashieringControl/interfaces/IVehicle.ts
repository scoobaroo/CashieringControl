import { IObjectWithKey } from "@fluentui/react";

export interface IVehicle extends IObjectWithKey {
  bjac_vehicleid: string;
  bjac_vehicle_checkin_mileage?: number;
  bjac_vehicle_checkin_mileage_formatted?: string;
  bjac_vehicle_cylinders_optionset?: number;
  bjac_vehicle_cylinders_optionset_formatted?: string;
  bjac_vehicle_engine?: string;
  bjac_vehicle_exterior_color?: string;
  bjac_vehicle_interior_color?: string;
  bjac_vehicle_longdescription?: string;
  _bjac_vehicle_maketable_value?: string;
  _bjac_vehicle_maketable_value_formatted?: string;
  _bjac_vehicle_maketable_value_lookuplogicalname?: string;
  _bjac_vehicle_modeltable_value?: string;
  _bjac_vehicle_modeltable_value_formatted?: string;
  _bjac_vehicle_modeltable_value_lookuplogicalname?: string;
  bjac_vehicle_number_of_cylinders_hybrid?: number;
  bjac_vehicle_number_of_cylinders_hybrid_formatted?: string;
  bjac_vehicle_power_source?: number;
  bjac_vehicle_power_source_formatted?: string;
  bjac_vehicle_shortdescription?: string;
  bjac_vehicle_style?: string;
  bjac_vehicle_transmissionspeeds_optionset?: number;
  bjac_vehicle_transmissionspeeds_optionset_formatted?: string;
  bjac_vehicle_transmission_type?: number;
  bjac_vehicle_transmission_type_formatted?: string;
  bjac_vehicle_vin?: string;
  bjac_vehicle_year?: string;

}