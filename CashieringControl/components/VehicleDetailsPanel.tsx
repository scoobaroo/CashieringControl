import * as React from "react";
import {
  Panel,
  PanelType,
  Pivot,
  PivotItem,
  Stack,
  Text,
  Label,
  PrimaryButton,
  IStackTokens,
} from "@fluentui/react";
import { ICartItem } from "../interfaces/ICartItem";
import { ICostBreakdownItem } from "../interfaces/ICostBreakdownItem";
import { stackTokens } from "../styles";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  LabelList,
} from "recharts";


interface VehicleDetailsPanelProps {
  isOpen: boolean;
  onDismiss: () => void;
  vehicle: ICartItem | null;
  breakdownData?: ICostBreakdownItem;
}

export const VehicleDetailsPanel: React.FC<VehicleDetailsPanelProps> = ({
  isOpen,
  onDismiss,
  vehicle,
}) => {
  if (!vehicle) return null;
  const [breakdownData, setBreakdownData] = React.useState<ICostBreakdownItem[]>([]);

  React.useEffect(() => {
    if (!vehicle) {
      setBreakdownData([]);
      return;
    }

    const breakdown: ICostBreakdownItem[] = [
      {
        name: "Hammer Price",
        value: vehicle.bjac_hammerprice ?? 0,
        color: "#7A5FFF",
      },
      {
        name: "Commission",
        value: vehicle.bjac_commission ?? 0,
        color: "#9E82FF",
      },
      {
        name: "Taxes",
        value: vehicle.bjac_taxfee ?? 0,
        color: "#BBAEFF",
      },
      {
        name: "Shipping",
        value: 1000, // Placeholder or pull real value
        color: "#D5CEFF",
      },
      {
        name: "Documentation Fee",
        value: vehicle.bjac_documentationfee ?? 0,
        color: "#ECE7FF",
      },
      {
        name: "Buyer Fee",
        value: 500, // Static or dynamic if available
        color: "#F7F5FF",
      },
    ];

    setBreakdownData(breakdown);
  }, [vehicle]);

  const formatCurrency = (value: number | undefined) =>
    value !== undefined
      ? `$${value.toLocaleString("en-US", {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })}`
      : "$0.00";

  return (
    <Panel
      isOpen={isOpen}
      onDismiss={onDismiss}
      type={PanelType.custom}
      customWidth="600px"
      isLightDismiss={true}
      headerText={`Vehicle Details: ${vehicle.bjac_name}`}
      styles={{
        main: { animation: "slideInRight 0.3s ease-in-out" },
        content: { padding: "0 20px 20px 20px" },
        header: { padding: "16px 20px", borderBottom: "1px solid #e8e8e8" },
        navigation: { borderBottom: "1px solid #e8e8e8" },
      }}
    >
      <Pivot>
        {/* Tab 1: Lot Details */}
        <PivotItem headerText="Lot Details">
          <Stack tokens={stackTokens} styles={{ root: { paddingTop: 20 } }}>
            <Stack.Item>
              <Label>Lot Number</Label>
              <Text>0</Text> {/* Static as per existing UI */}
            </Stack.Item>
            <Stack.Item>
              <Label>Payment Status</Label>
              <Text>{vehicle.bjac_isinvoiced ? "Invoiced" : "Not Invoiced"}</Text>
            </Stack.Item>
            <Stack.Item>
              <Label>Vehicle Year / Make / Model / Style</Label>
              <Text>
                {`${vehicle.vehicle?.bjac_vehicle_year || ""} ${
                  vehicle.vehicle?._bjac_vehicle_maketable_value_formatted || ""
                } ${vehicle.vehicle?._bjac_vehicle_modeltable_value_formatted || ""} ${
                  vehicle.vehicle?.bjac_vehicle_style || ""
                }`}
              </Text>
            </Stack.Item>
            <Stack.Item>
                <Label>Cost Breakdown</Label>
                <ResponsiveContainer width="100%" height={250}>
                    <BarChart layout="vertical" data={breakdownData}>
                    <XAxis type="number" tickFormatter={(val) => `$${val.toLocaleString()}`} />
                    <YAxis type="category" dataKey="name" width={150} />
                    <Tooltip formatter={(val) => `$${val.toLocaleString()}`} />
                    <Bar dataKey="value">
                        <LabelList dataKey="value" position="right" formatter={(val) => `$${val!.toLocaleString()}`} />
                    </Bar>
                    </BarChart>
                </ResponsiveContainer>
            </Stack.Item>
            <Stack.Item>
              <Label>Total Price</Label>
              <Text>{formatCurrency(vehicle.bjac_total)}</Text>
            </Stack.Item>
            <Stack.Item>
              <Label>Hammer Price</Label>
              <Text>${formatCurrency(vehicle.bjac_hammerprice)}</Text>
            </Stack.Item>
            <Stack.Item>
              <Label>Commissions</Label>
              <Text>${formatCurrency(vehicle.bjac_commission)}</Text>
            </Stack.Item>
            <Stack.Item>
              <Label>Fees</Label>
              <Text>${formatCurrency(vehicle.bjac_taxfee)}</Text>
            </Stack.Item>
            <Stack.Item>
              <Label>Car Details</Label>
              <Stack tokens={{ childrenGap: 8 }}>
                <Text>Mileage: {vehicle.vehicle?.bjac_vehicle_checkin_mileage || "N/A"}</Text>
                <Text>Int Color: {vehicle.vehicle?.bjac_vehicle_interior_color || "N/A"}</Text>
                <Text>Ext Color: {vehicle.vehicle?.bjac_vehicle_exterior_color || "N/A"}</Text>
                <Text>VIN: {vehicle.vehicle?.bjac_vehicle_vin || "N/A"}</Text>
                <Text>
                  Cylinders: {vehicle.vehicle?.bjac_vehicle_cylinders_optionset_formatted || "N/A"}
                </Text>
                <Text>
                  Transmission: {vehicle.vehicle?.bjac_vehicle_transmission_type_formatted || "N/A"}
                </Text>
                <Text>Engine Size: {vehicle.vehicle?.bjac_vehicle_engine || "N/A"}</Text>
                <Text>
                  Power Source: {vehicle.vehicle?.bjac_vehicle_power_source_formatted || "N/A"}
                </Text>
                <Text>Year: {vehicle.vehicle?.bjac_vehicle_year || "N/A"}</Text>
                <Text>
                  Make: {vehicle.vehicle?._bjac_vehicle_maketable_value_formatted || "N/A"}
                </Text>
                <Text>
                  Model: {vehicle.vehicle?._bjac_vehicle_modeltable_value_formatted || "N/A"}
                </Text>
                <Text>Style: {vehicle.vehicle?.bjac_vehicle_style || "N/A"}</Text>
              </Stack>
            </Stack.Item>
          </Stack>
        </PivotItem>

        {/* Tab 2: Property */}
        <PivotItem headerText="Property">
          <Stack tokens={stackTokens} styles={{ root: { paddingTop: 20 } }}>
            <Stack.Item>
              <Label>Long Description</Label>
              <Text>{vehicle.vehicle?.bjac_vehicle_longdescription || "No description available"}</Text>
            </Stack.Item>
          </Stack>
        </PivotItem>

        {/* Tab 3: Seller */}
        <PivotItem headerText="Seller">
          <Stack tokens={stackTokens} styles={{ root: { paddingTop: 20 } }}>
            <Stack.Item>
              <Label>Name</Label>
              <Text>{vehicle.seller?.name || "N/A"}</Text>
            </Stack.Item>
            <Stack.Item>
              <Label>Phone</Label>
              <Text>{vehicle.seller?._bjac_account_defaultphone_value_formatted || "N/A"}</Text>
            </Stack.Item>
            <Stack.Item>
              <Label>Address</Label>
              <Text>{"N/A"}</Text>
            </Stack.Item>
            <Stack.Item>
              <Label>Tax ID / Expiration Date</Label>
              <Text>
                {vehicle.seller?.bjac_account_taxid
                  ? `${vehicle.seller.bjac_account_taxid} / ${
                      vehicle.seller.bjac_account_taxidexpiration_formatted || "N/A"
                    }`
                  : "N/A"}
              </Text>
            </Stack.Item>
            <Stack.Item>
              <Label>Dealer Number / Expiration Date</Label>
              <Text>
                {vehicle.seller?.bjac_account_dealerlicenseexpiration_formatted
                  ? `${vehicle.seller.bjac_account_dealerlicenseexpiration_formatted}: "N/A"
                    }`
                  : "N/A"}
              </Text>
            </Stack.Item>
          </Stack>
        </PivotItem>
      </Pivot>

      {/* Close Button */}
      <Stack
        horizontal
        horizontalAlign="end"
        tokens={{ childrenGap: 10 }}
        styles={{ root: { marginTop: 20 } }}
      >
        <PrimaryButton text="Close" onClick={onDismiss} styles={{ root: { borderRadius: 4 } }} />
      </Stack>
    </Panel>
  );
};