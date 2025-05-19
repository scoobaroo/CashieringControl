import { IObjectWithKey } from "@fluentui/react";

export interface IVehicle extends IObjectWithKey {
  key: string;
  image: string;
  lot: string;
  name: string;
  status: string; // e.g., "PAID", "NOT PAID"
  releaseStatus: string; // e.g., "Processing Release", "Released"
  hammerPrice: string;
  taxesFees: string;
  consignmentStatus: string; // e.g., "Bought", "Sold", "Unsold"
  type: string; // e.g., "Vehicle", "Automobilia"
}