import * as React from "react";
import { DetailsList, IColumn, Stack, Text, PrimaryButton, IDetailsListStyles, Image, Label, DefaultButton, Selection, SelectionMode, IObjectWithKey, Panel, PanelType, Pivot, PivotItem, TextField, Dropdown, IDropdownOption } from "@fluentui/react";
import { stackTokens } from "../styles";
import { IVehicle } from "../interfaces/IVehicle";

interface VehicleListProps {
  sortOption: string;
  filterOption: string;
  pivotKey: string;
  searchQuery: string; // Add searchQuery prop
  initialItems: IVehicle[];
  totals: any;
}

const columns: IColumn[] = [
  { key: "image", name: "Image", fieldName: "image", minWidth: 100 },
  { key: "lot", name: "Lot", fieldName: "lot", minWidth: 50 },
  { key: "name", name: "Vehicle", fieldName: "name", minWidth: 200 },
  { key: "status", name: "Current Status", fieldName: "status", minWidth: 100 },
  { key: "releaseStatus", name: "Release Status", fieldName: "releaseStatus", minWidth: 100 },
  { key: "hammerPrice", name: "Hammer Price", fieldName: "hammerPrice", minWidth: 100 },
  { key: "taxesFees", name: "Taxes & Fees", fieldName: "taxesFees", minWidth: 100 },
];

// Carrier options for the dropdown
const carrierOptions: IDropdownOption[] = [
  { key: "fedex", text: "FedEx Vehicle Transport" },
  { key: "ups", text: "UPS Auto Logistics" },
  { key: "reliable", text: "Reliable Carriers" },
  { key: "montway", text: "Montway Auto Transport" },
  { key: "sherpa", text: "Sherpa Auto Transport" },
  { key: "easycar", text: "Easy Car Shipping" },
  { key: "uship", text: "uShip Vehicle Transport" },
];

// Address options for the Delivery Address dropdown
const addressOptions: IDropdownOption[] = [
  { key: "address1", text: "123 Main St, Scottsdale, AZ 85251" },
  { key: "address2", text: "456 Oak Ave, Phoenix, AZ 85004" },
  { key: "address3", text: "789 Pine Rd, Tucson, AZ 85701" },
  { key: "address4", text: "321 Maple Dr, Mesa, AZ 85201" },
  { key: "address5", text: "654 Birch Ln, Chandler, AZ 85225" },
];

const detailsListStyles: Partial<IDetailsListStyles> = {
  root: { marginTop: 0 },
  headerWrapper: { display: "none" }, // Hide the column headers
};

export const VehicleList: React.FC<VehicleListProps> = ({ sortOption, filterOption, pivotKey, searchQuery, initialItems, totals }) => {
  const [selectedCount, setSelectedCount] = React.useState(0);
  const [refreshKey, setRefreshKey] = React.useState(0);
  const [isPanelOpen, setIsPanelOpen] = React.useState(false);
  const [selectedAddress, setSelectedAddress] = React.useState<string | undefined>(undefined);
  const [selectedCarrier, setSelectedCarrier] = React.useState<string | undefined>(undefined);
  const [comments, setComments] = React.useState("");

  const selection = React.useMemo(
    () =>
      new Selection({
        onSelectionChanged: () => {
          setSelectedCount(selection.getSelectedCount());
        },
        getKey: (item: IVehicle) => item.key,
      }),
    []
  );

  const handleSelectionToggle = (index: number) => {
    selection.toggleIndexSelected(index);
    setRefreshKey((prev) => prev + 1);
  };

  // Categorize consignments by status and type
  const categorizedItems = React.useMemo(() => {
    const boughtVehicles = initialItems.filter((item) => item.consignmentStatus === "Bought" && item.type === "Vehicle");
    const boughtAutomobilia = initialItems.filter((item) => item.consignmentStatus === "Bought" && item.type === "Automobilia");
    const soldVehicles = initialItems.filter((item) => item.consignmentStatus === "Sold" && item.type === "Vehicle");
    const unsoldVehicles = initialItems.filter((item) => item.consignmentStatus === "Unsold" && item.type === "Vehicle");
    const soldAutomobilia = initialItems.filter((item) => item.consignmentStatus === "Sold" && item.type === "Automobilia");
    const unsoldAutomobilia = initialItems.filter((item) => item.consignmentStatus === "Unsold" && item.type === "Automobilia");

    return {
      boughtVehicles,
      boughtAutomobilia,
      soldVehicles,
      unsoldVehicles,
      soldAutomobilia,
      unsoldAutomobilia,
    };
  }, [initialItems]);

  // Select the appropriate list based on the pivot key
  const pivotItems = React.useMemo(() => {
    switch (pivotKey) {
      case "boughtVehicles":
        return categorizedItems.boughtVehicles;
      case "boughtAutomobilia":
        return categorizedItems.boughtAutomobilia;
      case "soldVehicles":
        return categorizedItems.soldVehicles;
      case "unsoldVehicles":
        return categorizedItems.unsoldVehicles;
      case "soldAutomobilia":
        return categorizedItems.soldAutomobilia;
      case "unsoldAutomobilia":
        return categorizedItems.unsoldAutomobilia;
      case "salesCompleted":
        return initialItems.filter((item) => item.consignmentStatus === "Sold");
      default:
        return initialItems;
    }
  }, [pivotKey, categorizedItems, initialItems]);

  // Apply search filtering
  const searchedItems = React.useMemo(() => {
    if (!searchQuery) return pivotItems; // If no search query, return all items
    const query = searchQuery.toLowerCase();
    return pivotItems.filter((item) =>
      item.name.toLowerCase().includes(query) || item.lot.toLowerCase().includes(query)
    );
  }, [searchQuery, pivotItems]);

  // Apply status filtering
  const filteredItems = React.useMemo(() => {
    let filtered = [...searchedItems];
    if (filterOption === "paid") {
      filtered = filtered.filter((item) => item.status === "PAID");
    } else if (filterOption === "notPaid") {
      filtered = filtered.filter((item) => item.status === "NOT PAID");
    }
    return filtered;
  }, [filterOption, searchedItems]);

  // Apply sorting
  const sortedItems = React.useMemo(() => {
    const sorted = [...filteredItems];
    if (sortOption === "priceAsc") {
      sorted.sort((a, b) => {
        const priceA = parseFloat(a.hammerPrice.replace(/[^0-9.-]+/g, ""));
        const priceB = parseFloat(b.hammerPrice.replace(/[^0-9.-]+/g, ""));
        return priceA - priceB;
      });
    } else if (sortOption === "priceDesc") {
      sorted.sort((a, b) => {
        const priceA = parseFloat(a.hammerPrice.replace(/[^0-9.-]+/g, ""));
        const priceB = parseFloat(b.hammerPrice.replace(/[^0-9.-]+/g, ""));
        return priceB - priceA;
      });
    } else if (sortOption === "nameAsc") {
      sorted.sort((a, b) => a.name.localeCompare(b.name));
    } else if (sortOption === "nameDesc") {
      sorted.sort((a, b) => b.name.localeCompare(a.name));
    }
    return sorted;
  }, [sortOption, filteredItems]);

  const selectedVehicles = selection.getSelection() as IVehicle[];

  // Calculate totals for Purchase Report Breakdown
  const totalHammerPrice = selectedVehicles.reduce((sum, vehicle) => {
    const price = parseFloat(vehicle.hammerPrice.replace(/[^0-9.-]+/g, ""));
    return sum + price;
  }, 0);

  const totalTaxesFees = selectedVehicles.reduce((sum, vehicle) => {
    const fees = parseFloat(vehicle.taxesFees.replace(/[^0-9.-]+/g, ""));
    return sum + fees;
  }, 0);

  const totalAmount = totalHammerPrice + totalTaxesFees;

  return (
    <Stack tokens={stackTokens} styles={{ root: { padding: 10 } }}>
      <Stack horizontal horizontalAlign="space-between" tokens={{ childrenGap: 10 }}>
        <Text variant="medium">
          Selected Vehicles <Text styles={{ root: { fontWeight: "bold" } }}>{selectedCount}</Text>
        </Text>
        <PrimaryButton
          text="Deliver Selected Cars"
          disabled={selectedCount === 0}
          onClick={() => setIsPanelOpen(true)}
        />
      </Stack>

      <Stack horizontal tokens={{ childrenGap: 20 }}>
        {/* Left Section: Vehicle List */}
        <Stack.Item grow styles={{ root: { flex: 3 } }}>
          <DetailsList
            key={refreshKey}
            items={sortedItems}
            columns={columns}
            styles={detailsListStyles}
            selectionMode={SelectionMode.multiple}
            selection={selection as Selection<IObjectWithKey>}
            setKey="set"
            selectionPreservedOnEmptyClick={true}
            onRenderRow={(props) => {
              if (!props) return null;
              const item = props.item as IVehicle;
              const isSelected = props.selection.isIndexSelected(props.itemIndex);

              return (
                <Stack
                  horizontal
                  tokens={{ childrenGap: 20 }}
                  styles={{
                    root: {
                      borderRadius: 8,
                      padding: 16,
                      marginBottom: 10,
                      backgroundColor: "#fff",
                      boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
                    },
                  }}
                >
                  {/* Image */}
                  <Stack.Item>
                    <Image src={item.image} width={150} height={90} styles={{ root: { borderRadius: 4 } }} />
                  </Stack.Item>

                  {/* Main Content */}
                  <Stack.Item grow>
                    <Stack tokens={{ childrenGap: 8 }}>
                      <Stack
                        horizontal
                        tokens={{ childrenGap: 8 }}
                        verticalAlign="center"
                        styles={{ root: { marginBottom: 8 } }}
                      >
                        <Text variant="small" styles={{ root: { color: "#666" } }}>
                          Lot#: {item.lot}
                        </Text>
                        <Text variant="mediumPlus" styles={{ root: { fontWeight: "bold" } }}>
                          {item.name}
                        </Text>
                      </Stack>
                      <Stack horizontal tokens={{ childrenGap: 20 }}>
                        <Stack>
                          <Text
                            styles={{
                              root: {
                                backgroundColor: "#ff4d4f",
                                color: "#fff",
                                padding: "2px 12px",
                                borderRadius: 12,
                                fontSize: 12,
                                display: "inline-block",
                              },
                            }}
                          >
                            {item.status}
                          </Text>
                          <Text variant="small" styles={{ root: { color: "#666", marginTop: 4 } }}>
                            Current Status
                          </Text>
                        </Stack>
                        <Stack>
                          <Text
                            styles={{
                              root: {
                                backgroundColor: "#e6f7ff",
                                color: "#1890ff",
                                padding: "2px 12px",
                                borderRadius: 12,
                                fontSize: 12,
                                display: "inline-block",
                              },
                            }}
                          >
                            {item.releaseStatus}
                          </Text>
                          <Text variant="small" styles={{ root: { color: "#666", marginTop: 4 } }}>
                            Release Status
                          </Text>
                        </Stack>
                        <Stack>
                          <Text variant="medium">{item.hammerPrice}</Text>
                          <Text variant="small" styles={{ root: { color: "#666", marginTop: 4 } }}>
                            Hammer Price
                          </Text>
                        </Stack>
                        <Stack>
                          <Text variant="medium">{item.taxesFees}</Text>
                          <Text variant="small" styles={{ root: { color: "#666", marginTop: 4 } }}>
                            Taxes & Fees
                          </Text>
                        </Stack>
                      </Stack>
                    </Stack>
                  </Stack.Item>

                  {/* Buttons */}
                  <Stack.Item>
                    <Stack horizontal tokens={{ childrenGap: 8 }}>
                      <DefaultButton
                        text="View"
                        styles={{
                          root: {
                            border: "none !important",
                            borderRadius: 4,
                            height: 32,
                            fontSize: 14,
                            color: "#000",
                            backgroundColor: "transparent",
                            outline: "none",
                          },
                          rootHovered: {
                            border: "1px solid #d9d9d9 !important",
                          },
                          rootPressed: {
                            border: "1px solid #d9d9d9 !important",
                          },
                          rootFocused: {
                            border: "1px solid #d9d9d9 !important",
                            outline: "none",
                          },
                        }}
                      />
                      <DefaultButton
                        text={isSelected ? "Selected" : "Select"}
                        onClick={() => {
                          handleSelectionToggle(props.itemIndex);
                        }}
                        styles={{
                          root: {
                            border: isSelected ? "1px solid #1890ff !important" : "none !important",
                            borderRadius: 4,
                            height: 32,
                            fontSize: 14,
                            color: isSelected ? "#1890ff" : "#1890ff",
                            backgroundColor: "transparent",
                            outline: "none",
                          },
                          rootHovered: {
                            border: isSelected ? "1px solid #1890ff !important" : "1px solid #d9d9d9 !important",
                          },
                          rootFocused: {
                            border: isSelected ? "1px solid #1890ff !important" : "1px solid #d9d9d9 !important",
                            outline: "none",
                          },
                        }}
                      />
                    </Stack>
                  </Stack.Item>
                </Stack>
              );
            }}
          />
        </Stack.Item>

        {/* Right Section: Totals */}
        <Stack.Item styles={{ root: { flex: 1, paddingTop: 16 } }}>
          <Stack tokens={{ childrenGap: 16 }}>
            <Stack>
              <Text variant="large" styles={{ root: { fontWeight: "bold" } }}>
                {totals.totalOwed}
              </Text>
              <Text variant="medium" styles={{ root: { color: "#666" } }}>
                Total Owed to Barrett-Jackson
              </Text>
            </Stack>
            <Stack>
              <Text variant="medium">{totals.bidderDeposit}</Text>
              <Text variant="medium" styles={{ root: { color: "#666" } }}>
                Bidder Deposit
              </Text>
            </Stack>
            <Stack>
              <Text variant="medium">{totals.escrowAmount}</Text>
              <Text variant="medium" styles={{ root: { color: "#666" } }}>
                Escrow Amount
              </Text>
            </Stack>
            <Stack>
              <Text variant="medium">{totals.credits}</Text>
              <Text variant="medium" styles={{ root: { color: "black" } }}>
                Credits
              </Text>
            </Stack>
            <Stack>
              <Text variant="medium">{totals.totalHammerPrice}</Text>
              <Text variant="medium" styles={{ root: { color: "#666" } }}>
                Total Hammer Price
              </Text>
            </Stack>
            <Stack>
              <Text variant="medium">{totals.totalFees}</Text>
              <Text variant="medium" styles={{ root: { color: "#666" } }}>
                Total Fees
              </Text>
            </Stack>
          </Stack>
        </Stack.Item>
      </Stack>

      {/* Panel for Selected Vehicles */}
      <Panel
        isOpen={isPanelOpen}
        onDismiss={() => setIsPanelOpen(false)}
        type={PanelType.medium}
        isLightDismiss={true}
        headerText={`Deliver Selected Vehicles (${selectedVehicles.length})`}
        styles={{
          content: { padding: "0 20px 20px 20px" },
          main: { animation: "slideInRight 0.3s ease-in-out" },
          header: { padding: "16px 20px", borderBottom: "1px solid #e8e8e8" },
          navigation: { borderBottom: "1px solid #e8e8e8" },
        }}
      >
        <Pivot>
          <PivotItem headerText="Delivery">
            <Stack tokens={{ childrenGap: 20 }} styles={{ root: { paddingTop: 20 } }}>
              {/* Selected Vehicles List */}
              {selectedVehicles.length === 0 ? (
                <Text>No vehicles selected.</Text>
              ) : (
                selectedVehicles.map((vehicle) => (
                  <Stack
                    key={vehicle.key}
                    horizontal
                    tokens={{ childrenGap: 20 }}
                    styles={{
                      root: {
                        borderRadius: 8,
                        padding: 16,
                        marginBottom: 10,
                        backgroundColor: "#fff",
                        boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
                      },
                    }}
                  >
                    <Stack.Item>
                      <Image src={vehicle.image} width={150} height={90} styles={{ root: { borderRadius: 4 } }} />
                    </Stack.Item>
                    <Stack.Item grow>
                      <Stack tokens={{ childrenGap: 8 }}>
                        <Stack
                          horizontal
                          tokens={{ childrenGap: 8 }}
                          verticalAlign="center"
                          styles={{ root: { marginBottom: 8 } }}
                        >
                          <Text variant="small" styles={{ root: { color: "#666" } }}>
                            Lot#: {vehicle.lot}
                          </Text>
                          <Text variant="mediumPlus" styles={{ root: { fontWeight: "bold" } }}>
                            {vehicle.name}
                          </Text>
                        </Stack>
                        <Stack horizontal tokens={{ childrenGap: 20 }}>
                          <Stack>
                            <Text
                              styles={{
                                root: {
                                  backgroundColor: "#ff4d4f",
                                  color: "#fff",
                                  padding: "2px 12px",
                                  borderRadius: 12,
                                  fontSize: 12,
                                  display: "inline-block",
                                },
                              }}
                            >
                              {vehicle.status}
                            </Text>
                            <Text variant="small" styles={{ root: { color: "#666", marginTop: 4 } }}>
                              Current Status
                            </Text>
                          </Stack>
                          <Stack>
                            <Text
                              styles={{
                                root: {
                                  backgroundColor: "#e6f7ff",
                                  color: "#1890ff",
                                  padding: "2px 12px",
                                  borderRadius: 12,
                                  fontSize: 12,
                                  display: "inline-block",
                                },
                              }}
                            >
                              {vehicle.releaseStatus}
                            </Text>
                            <Text variant="small" styles={{ root: { color: "#666", marginTop: 4 } }}>
                              Release Status
                            </Text>
                          </Stack>
                          <Stack>
                            <Text variant="medium">{vehicle.hammerPrice}</Text>
                            <Text variant="small" styles={{ root: { color: "#666", marginTop: 4 } }}>
                              Hammer Price
                            </Text>
                          </Stack>
                          <Stack>
                            <Text variant="medium">{vehicle.taxesFees}</Text>
                            <Text variant="small" styles={{ root: { color: "#666", marginTop: 4 } }}>
                              Taxes & Fees
                            </Text>
                          </Stack>
                        </Stack>
                      </Stack>
                    </Stack.Item>
                  </Stack>
                ))
              )}

              {/* Delivery Address Dropdown */}
              {selectedVehicles.length > 0 && (
                <>
                  <Stack tokens={{ childrenGap: 8 }}>
                    <Label>Delivery Address</Label>
                    <Dropdown
                      placeholder="Select a delivery address"
                      options={addressOptions}
                      selectedKey={selectedAddress}
                      onChange={(e, option) => setSelectedAddress(option?.key as string)}
                      styles={{ root: { width: "100%" } }}
                    />
                  </Stack>

                  {/* Select a Carrier */}
                  <Stack tokens={{ childrenGap: 8 }}>
                    <Label>Select a Carrier</Label>
                    <Dropdown
                      placeholder="Select a carrier"
                      options={carrierOptions}
                      selectedKey={selectedCarrier}
                      onChange={(e, option) => setSelectedCarrier(option?.key as string)}
                      styles={{ root: { width: "100%" } }}
                    />
                  </Stack>

                  {/* Purchase Report Breakdown */}
                  <Stack tokens={{ childrenGap: 8 }}>
                    <Label>Purchase Report Breakdown</Label>
                    <Stack
                      styles={{
                        root: {
                          border: "1px solid #e8e8e8",
                          borderRadius: 4,
                          padding: 16,
                        },
                      }}
                    >
                      <Stack horizontal tokens={{ childrenGap: 20 }} styles={{ root: { marginBottom: 8 } }}>
                        <Stack.Item grow>
                          <Text variant="medium">Total Hammer Price</Text>
                        </Stack.Item>
                        <Text variant="medium">{`$${totalHammerPrice.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}</Text>
                      </Stack>
                      <Stack horizontal tokens={{ childrenGap: 20 }} styles={{ root: { marginBottom: 8 } }}>
                        <Stack.Item grow>
                          <Text variant="medium">Total Taxes & Fees</Text>
                        </Stack.Item>
                        <Text variant="medium">{`$${totalTaxesFees.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}</Text>
                      </Stack>
                      <Stack horizontal tokens={{ childrenGap: 20 }}>
                        <Stack.Item grow>
                          <Text variant="medium" styles={{ root: { fontWeight: "bold" } }}>
                            Total Amount
                          </Text>
                        </Stack.Item>
                        <Text variant="medium" styles={{ root: { fontWeight: "bold" } }}>
                          {`$${totalAmount.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
                        </Text>
                      </Stack>
                    </Stack>
                  </Stack>

                  {/* Comments */}
                  <Stack tokens={{ childrenGap: 8 }}>
                    <Label>Comments</Label>
                    <TextField
                      multiline
                      rows={3}
                      value={comments}
                      onChange={(e, newValue) => setComments(newValue || "")}
                      placeholder="Add any comments"
                      styles={{ root: { width: "100%" } }}
                    />
                  </Stack>

                  {/* Buttons */}
                  <Stack horizontal horizontalAlign="end" tokens={{ childrenGap: 10 }} styles={{ root: { marginTop: 20 } }}>
                    <DefaultButton
                      text="Cancel"
                      onClick={() => setIsPanelOpen(false)}
                      styles={{
                        root: {
                          border: "1px solid #d9d9d9",
                          borderRadius: 4,
                          height: 32,
                          fontSize: 14,
                          color: "#000",
                          backgroundColor: "transparent",
                        },
                      }}
                    />
                    <PrimaryButton
                      text="Confirm Delivery"
                      onClick={() => {
                        console.log("Delivering vehicles:", {
                          vehicles: selectedVehicles,
                          selectedAddress,
                          selectedCarrier,
                          comments,
                          totalAmount,
                        });
                        setIsPanelOpen(false);
                      }}
                      styles={{
                        root: {
                          borderRadius: 4,
                          height: 32,
                          fontSize: 14,
                        },
                      }}
                    />
                  </Stack>
                </>
              )}
            </Stack>
          </PivotItem>
          <PivotItem headerText="Billing">
            <Stack tokens={{ childrenGap: 20 }} styles={{ root: { paddingTop: 20 } }}>
              <Text>Billing information will be displayed here.</Text>
              {/* Add billing content as needed */}
            </Stack>
          </PivotItem>
          <PivotItem headerText="Notes">
            <Stack tokens={{ childrenGap: 20 }} styles={{ root: { paddingTop: 20 } }}>
              <Text>Notes will be displayed here.</Text>
              {/* Add notes content as needed */}
            </Stack>
          </PivotItem>
        </Pivot>
      </Panel>
    </Stack>
  );
};

// Export counts for use in Header.tsx
export const getConsignmentCounts = (items: IVehicle[]) => {
  const categorizedItems = {
    boughtVehicles: items.filter((item) => item.consignmentStatus === "Bought" && item.type === "Vehicle"),
    boughtAutomobilia: items.filter((item) => item.consignmentStatus === "Bought" && item.type === "Automobilia"),
    soldVehicles: items.filter((item) => item.consignmentStatus === "Sold" && item.type === "Vehicle"),
    unsoldVehicles: items.filter((item) => item.consignmentStatus === "Unsold" && item.type === "Vehicle"),
    soldAutomobilia: items.filter((item) => item.consignmentStatus === "Sold" && item.type === "Automobilia"),
    unsoldAutomobilia: items.filter((item) => item.consignmentStatus === "Unsold" && item.type === "Automobilia"),
  };

  return {
    boughtVehiclesCount: categorizedItems.boughtVehicles.length,
    boughtAutomobiliaCount: categorizedItems.boughtAutomobilia.length,
    soldVehiclesCount: categorizedItems.soldVehicles.length,
    unsoldVehiclesCount: categorizedItems.unsoldVehicles.length,
    soldAutomobiliaCount: categorizedItems.soldAutomobilia.length,
    unsoldAutomobiliaCount: categorizedItems.unsoldAutomobilia.length,
  };
};