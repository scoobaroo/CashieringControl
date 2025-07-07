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
  Cell,
} from "recharts";

interface VehicleDetailsPanelProps {
  isOpen: boolean;
  onDismiss: () => void;
  vehicle: ICartItem | null;
}

// Error Boundary to catch rendering errors
class ErrorBoundary extends React.Component<{ children: React.ReactNode }, { hasError: boolean }> {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      console.log("ErrorBoundary caught an error"); // Debug log
      return <Text>An error occurred. Please try again.</Text>;
    }
    return this.props.children;
  }
}

export const VehicleDetailsPanel: React.FC<VehicleDetailsPanelProps> = ({
  isOpen,
  onDismiss,
  vehicle,
}) => {
  if (!vehicle) {
    console.log("Vehicle is null, returning null"); // Debug log
    return null;
  }

  const [selectedTab, setSelectedTab] = React.useState<string>("Lot Details");
  const [breakdownData, setBreakdownData] = React.useState<ICostBreakdownItem[]>([]);

  React.useEffect(() => {
    console.log("Updating breakdownData for vehicle:", vehicle.bjac_name); // Debug log
    const breakdown: ICostBreakdownItem[] = [
      {
        name: "Hammer Price",
        value: Number(vehicle.bjac_hammerprice) || 0,
        color: "#0078D4", // Blue for Hammer Price
      },
      {
        name: "Commission",
        value: Number(vehicle.bjac_commission) || 0,
        color: "#0078D4", // Blue for Commission
      },
      {
        name: "Taxes",
        value: Number(vehicle.bjac_taxfee) || 0,
        color: "#BBAEFF", // Keep existing color for Taxes
      },
      {
        name: "Shipping",
        value: 1000,
        color: "#FFC107", // Yellow for Shipping
      },
      {
        name: "Documentation Fee",
        value: Number(vehicle.bjac_documentationfee) || 0,
        color: "#4FC3F7", // Light Blue for Documentation Fee
      },
      {
        name: "Buyer Fee",
        value: 500,
        color: "#FF5722", // Orange for Buyer Fee
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

  const formattedPhone =
    vehicle?.seller?.["_bjac_account_defaultphone_value@OData.Community.Display.V1.FormattedValue"] ??
    "N/A";
  const formattedAddress =
    vehicle?.seller?.["_bjac_account_defaultaddresstable_value@OData.Community.Display.V1.FormattedValue"] ??
    "N/A";

  return (
    <ErrorBoundary>
      <Panel
        isOpen={isOpen}
        onDismiss={onDismiss}
        type={PanelType.custom}
        customWidth="600px"
        isLightDismiss={true}
        headerText={`Vehicle Details: ${vehicle.bjac_name || "N/A"}`}
        styles={{
          main: { minHeight: "400px" }, // Ensure enough height for tabs and content
          content: { padding: "20px" }, // Simplified padding
          header: { padding: "16px 20px", borderBottom: "1px solid #e8e8e8" },
          navigation: { padding: "12px 0", minHeight: 48 }, // Ensure tabs are visible
        }}
      >
        <Pivot
          aria-label="Vehicle Details Tabs"
          linkSize="large"
          linkFormat="tabs"
          selectedKey={selectedTab}
          onLinkClick={(item) => {
            if (item?.props.itemKey) {
              console.log("Switching to tab:", item.props.itemKey); // Debug log
              setSelectedTab(item.props.itemKey);
            }
          }}
          styles={{
            root: { marginBottom: 20, minHeight: 48 }, // Ensure tabs are not clipped
            link: { margin: "0 12px", padding: "10px 16px", fontSize: 16, lineHeight: "24px" },
            linkIsSelected: {
              margin: "0 12px",
              padding: "10px 16px",
              fontSize: 16,
              lineHeight: "24px",
              selectors: {
                ":after": {
                  backgroundColor: "#0078D4", // Blue underline for selected tab
                  height: "3px",
                },
              },
            },
          }}
        >
          <PivotItem
            headerText="Lot Details"
            itemKey="Lot Details"
            key="Lot Details"
            headerButtonProps={{ "data-testid": "lot-details-tab" }}
          >
            <Stack tokens={stackTokens} styles={{ root: { paddingTop: 20 } }}>
              <Stack.Item>
                <Label>Lot Number</Label>
                <Text>{vehicle.bjac_lot || "0"}</Text>
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
                  }`.trim() || "N/A"}
                </Text>
              </Stack.Item>
              <Stack.Item>
                <Label>Cost Breakdown</Label>
                    <ResponsiveContainer width="100%" height={250}>
                    <BarChart layout="vertical" data={breakdownData}>
                        <XAxis type="number" tickFormatter={(val) => `$${val.toLocaleString()}`} />
                        <YAxis type="category" dataKey="name" width={150} />
                        <Tooltip formatter={(val) => `$${val.toLocaleString()}`} />
                        <Bar dataKey="value" barSize={30}>
                        {breakdownData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                        <LabelList
                            dataKey="value"
                            position="right"
                            formatter={(val) => `$${val!.toLocaleString()}`}
                        />
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
                <Text>{formatCurrency(vehicle.bjac_hammerprice)}</Text>
              </Stack.Item>
              <Stack.Item>
                <Label>Commissions</Label>
                <Text>{formatCurrency(vehicle.bjac_commission)}</Text>
              </Stack.Item>
              <Stack.Item>
                <Label>Fees</Label>
                <Text>{formatCurrency(vehicle.bjac_taxfee)}</Text>
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
          <PivotItem
            headerText="Property"
            itemKey="Property"
            key="Property"
            headerButtonProps={{ "data-testid": "property-tab" }}
          >
            <Stack tokens={stackTokens} styles={{ root: { paddingTop: 20 } }}>
              <Stack.Item>
                <Label>Long Description</Label>
                <Text>{vehicle.vehicle?.bjac_vehicle_longdescription || "No description available"}</Text>
              </Stack.Item>
            </Stack>
          </PivotItem>
          <PivotItem
            headerText="Seller"
            itemKey="Seller"
            key="Seller"
            headerButtonProps={{ "data-testid": "seller-tab" }}
          >
            <Stack tokens={stackTokens} styles={{ root: { paddingTop: 20 } }}>
              <Stack.Item>
                <Label>Name</Label>
                <Text>{vehicle.seller?.name || "N/A"}</Text>
              </Stack.Item>
              <Stack.Item>
                <Label>Phone</Label>
                <Text>
                  {vehicle.seller?._bjac_account_defaultphone_value_formatted ||
                    vehicle.seller?._bjac_account_defaultphone_value ||
                    "N/A"}
                </Text>
              </Stack.Item>
              <Stack.Item>
                <Label>Formatted Phone</Label>
                <Text>{formattedPhone}</Text>
              </Stack.Item>
              <Stack.Item>
                <Label>Address</Label>
                <Text>
                  {vehicle.seller?._bjac_account_defaultaddresstable_value_formatted ||
                    vehicle.seller?._bjac_account_defaultaddresstable_value ||
                    "N/A"}
                </Text>
              </Stack.Item>
              <Stack.Item>
                <Label>Formatted Address</Label>
                <Text>{formattedAddress}</Text>
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
                <Text>{vehicle.seller?.bjac_account_dealerlicenseexpiration_formatted || "N/A"}</Text>
              </Stack.Item>
            </Stack>
          </PivotItem>
        </Pivot>
        <Stack
          horizontal
          horizontalAlign="end"
          tokens={{ childrenGap: 10 }}
          styles={{ root: { marginTop: 20 } }}
        >
          <PrimaryButton text="Close" onClick={onDismiss} styles={{ root: { borderRadius: 4 } }} />
        </Stack>
      </Panel>
    </ErrorBoundary>
  );
};