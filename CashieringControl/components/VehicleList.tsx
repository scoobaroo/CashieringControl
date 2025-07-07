import * as React from "react";
import {
  DetailsList,
  IColumn,
  Stack,
  Text,
  PrimaryButton,
  IDetailsListStyles,
  Image,
  Label,
  DefaultButton,
  Selection,
  SelectionMode,
  IObjectWithKey,
  Panel,
  PanelType,
  Pivot,
  PivotItem,
  TextField,
  Dropdown,
  IDropdownOption,
} from "@fluentui/react";
import { stackTokens } from "../styles";
import { ICartItem } from "../interfaces/ICartItem";
import { VehicleDetailsPanel } from "./VehicleDetailsPanel";

interface VehicleListProps {
  sortOption: string;
  filterOption: string;
  pivotKey: string;
  searchQuery: string;
  initialItems: ICartItem[];
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

const carrierOptions: IDropdownOption[] = [
  { key: "fedex", text: "FedEx Vehicle Transport" },
  { key: "ups", text: "UPS Auto Logistics" },
  { key: "reliable", text: "Reliable Carriers" },
  { key: "montway", text: "Montway Auto Transport" },
  { key: "sherpa", text: "Sherpa Auto Transport" },
  { key: "easycar", text: "Easy Car Shipping" },
  { key: "uship", text: "uShip Vehicle Transport" },
];

const addressOptions: IDropdownOption[] = [
  { key: "address1", text: "123 Main St, Scottsdale, AZ 85251" },
  { key: "address2", text: "456 Oak Ave, Phoenix, AZ 85004" },
  { key: "address3", text: "789 Pine Rd, Tucson, AZ 85701" },
  { key: "address4", text: "321 Maple Dr, Mesa, AZ 85201" },
  { key: "address5", text: "654 Birch Ln, Chandler, AZ 85225" },
];

const detailsListStyles: Partial<IDetailsListStyles> = {
  root: { marginTop: 0 },
  headerWrapper: { display: "none" },
};

export const VehicleList: React.FC<VehicleListProps> = ({
  sortOption,
  filterOption,
  pivotKey,
  searchQuery,
  initialItems,
}) => {
  const [selectedCount, setSelectedCount] = React.useState(0);
  const [refreshKey, setRefreshKey] = React.useState(0);
  const [isPanelOpen, setIsPanelOpen] = React.useState(false);
  const [isDetailsPanelOpen, setIsDetailsPanelOpen] = React.useState(false);
  const [selectedVehicle, setSelectedVehicle] = React.useState<ICartItem | null>(null);
  const [selectedAddress, setSelectedAddress] = React.useState<string | undefined>(undefined);
  const [selectedCarrier, setSelectedCarrier] = React.useState<string | undefined>(undefined);
  const [comments, setComments] = React.useState("");

  const selection = React.useMemo(
    () =>
      new Selection({
        onSelectionChanged: () => {
          setSelectedCount(selection.getSelectedCount());
        },
        getKey: (item: ICartItem) => item.key,
      }),
    []
  );

  const handleSelectionToggle = (index: number) => {
    selection.toggleIndexSelected(index);
    setRefreshKey((prev) => prev + 1);
  };

  const categorizedItems = React.useMemo(() => {
    const boughtVehicles = initialItems.filter(
      (item) => item.bjac_transactiontypeFormattedValue === "Purchase" && item.bjac_consigntypeFormattedValue === "Vehicle"
    );
    const boughtAutomobilia = initialItems.filter(
      (item) => item.bjac_transactiontypeFormattedValue === "Purchase" && item.bjac_consigntypeFormattedValue === "Automobilia" && item.bjac_isinvoiced
    );
    const soldVehicles = initialItems.filter(
      (item) => item.bjac_transactiontypeFormattedValue === "Sale" && item.bjac_consigntypeFormattedValue === "Vehicle" && item.bjac_isinvoiced
    );
    const unsoldVehicles = initialItems.filter(
      (item) => item.bjac_transactiontypeFormattedValue === "Sale" && item.bjac_consigntypeFormattedValue === "Vehicle" && !item.bjac_isinvoiced
    );
    const soldAutomobilia = initialItems.filter(
      (item) => item.bjac_transactiontypeFormattedValue === "Sale" && item.bjac_consigntypeFormattedValue === "Automobilia" && item.bjac_isinvoiced
    );
    const unsoldAutomobilia = initialItems.filter(
      (item) => item.bjac_transactiontypeFormattedValue === "Sale" && item.bjac_consigntypeFormattedValue === "Automobilia" && !item.bjac_isinvoiced
    );

    console.log("Categorized Bought Vehicles:", boughtVehicles.map(item => item.bjac_name)); // Debug specific items
    return {
      boughtVehicles,
      boughtAutomobilia,
      soldVehicles,
      unsoldVehicles,
      soldAutomobilia,
      unsoldAutomobilia,
    };
  }, [initialItems]);

  const pivotItems = React.useMemo(() => {
    console.log("Pivot Key:", pivotKey);
    console.log("Initial Items Count:", initialItems.length);
    console.log("Pivot Items Count (before filter):", categorizedItems.boughtVehicles.length);

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
        return [];
      default:
        return initialItems;
    }
  }, [pivotKey, categorizedItems, initialItems]);

  const searchedItems = React.useMemo(() => {
    console.log("Searched Items Count:", pivotItems?.length || 0);
    if (!pivotItems) return [];
    if (!searchQuery) return pivotItems;
    const query = searchQuery.toLowerCase();
    return pivotItems.filter((item) =>
      item.bjac_name.toLowerCase().includes(query)
    );
  }, [searchQuery, pivotItems]);

  const filteredItems = React.useMemo(() => {
    console.log("Filtered Items Count:", searchedItems.length);
    let filtered = [...searchedItems];
    if (filterOption === "vehicle") {
      filtered = filtered.filter((item) => item.bjac_consigntypeFormattedValue === "Vehicle");
    } else if (filterOption === "automobilia") {
      filtered = filtered.filter((item) => item.bjac_consigntypeFormattedValue === "Automobilia");
    }
    return filtered;
  }, [filterOption, searchedItems]);

  const sortedItems = React.useMemo(() => {
    console.log("Sorted Items Count:", filteredItems.length);
    const sorted = [...filteredItems];
    if (sortOption === "priceAsc") {
      sorted.sort((a, b) => {
        const priceA = parseFloat(a.bjac_hammerprice.toString().replace(/[^0-9.-]+/g, ""));
        const priceB = parseFloat(b.bjac_hammerprice.toString().replace(/[^0-9.-]+/g, ""));
        return priceA - priceB;
      });
    } else if (sortOption === "priceDesc") {
      sorted.sort((a, b) => {
        const priceA = parseFloat(a.bjac_hammerprice.toString().replace(/[^0-9.-]+/g, ""));
        const priceB = parseFloat(b.bjac_hammerprice.toString().replace(/[^0-9.-]+/g, ""));
        return priceB - priceA;
      });
    } else if (sortOption === "nameAsc") {
      sorted.sort((a, b) => a.bjac_name.localeCompare(b.bjac_name));
    } else if (sortOption === "nameDesc") {
      sorted.sort((a, b) => b.bjac_name.localeCompare(a.bjac_name));
    }
    return sorted;
  }, [sortOption, filteredItems]);

  const selectedVehicles = selection.getSelection() as ICartItem[];

  // Function to calculate totals based on provided items
  const calculateTotals = (items: ICartItem[]) => {
    const totalOwed = items.reduce((sum, item) => sum + (item.bjac_total || 0), 0);
    const totalHammerPrice = items.reduce((sum, item) => sum + (item.bjac_hammerprice || 0), 0);
    const totalFees = items.reduce((sum, item) => sum + ((item.bjac_commission || 0) + (item.bjac_documentationfee || 0) + (item.bjac_taxfee || 0)), 0);

    return {
      totalOwed: `$${totalOwed.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      bidderDeposit: "$10,000.00", // Static value
      escrowAmount: "$5,000.00",  // Static value
      credits: "$0.00",          // Static value
      totalHammerPrice: `$${totalHammerPrice.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      totalFees: `$${totalFees.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
    };
  };

  // Compute display totals based on selection
  const displayTotals = selectedVehicles.length > 0 ? calculateTotals(selectedVehicles) : calculateTotals(sortedItems);

  // Log the number of items being rendered
  React.useEffect(() => {
    console.log("Rendered Items Count:", sortedItems.length);
    console.log("Sorted Items:", sortedItems.map(item => item.bjac_name)); // Log item names for debugging
  }, [sortedItems]);

  return (
    <Stack tokens={stackTokens} styles={{ root: { padding: 10 } }}>
      <Stack horizontal horizontalAlign="space-between" tokens={{ childrenGap: 10 }}>
        <Text variant="medium">
          Selected Items <Text styles={{ root: { fontWeight: "bold" } }}>{selectedCount}</Text>
        </Text>
        <PrimaryButton
          text="Deliver Selected Cars"
          disabled={selectedCount === 0}
          onClick={() => setIsPanelOpen(true)}
        />
      </Stack>

      <Stack horizontal tokens={{ childrenGap: 20 }}>
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
              const item = props.item as ICartItem;
              const isSelected = props.selection.isIndexSelected(props.itemIndex);
              console.log("Rendering Item:", item.bjac_name); // Debug each rendered item

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
                  <Stack.Item>
                    <Image
                      src={item.bjac_imageurl}
                      width={150}
                      height={90}
                      styles={{ root: { borderRadius: 4 } }}
                    />
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
                          Lot#: {item.bjac_lot || "0"}
                        </Text>
                        <Text variant="mediumPlus" styles={{ root: { fontWeight: "bold" } }}>
                          {item.bjac_name}
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
                            {item.bjac_stageFormattedValue || "Unknown"}
                          </Text>
                          <Text
                            variant="small"
                            styles={{ root: { color: "#666", marginTop: 4 } }}
                          >
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
                            {item.bjac_stageFormattedValue || "Unknown"}
                          </Text>
                          <Text
                            variant="small"
                            styles={{ root: { color: "#666", marginTop: 4 } }}
                          >
                            Release Status
                          </Text>
                        </Stack>
                        <Stack>
                          <Text variant="medium">{item.bjac_hammerprice ? `$${item.bjac_hammerprice.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : "$0.00"}</Text>
                          <Text
                            variant="small"
                            styles={{ root: { color: "#666", marginTop: 4 } }}
                          >
                            Hammer Price
                          </Text>
                        </Stack>
                        <Stack>
                          <Text variant="medium">{item.bjac_taxfee ? `$${item.bjac_taxfee.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : "$0.00"}</Text>
                          <Text
                            variant="small"
                            styles={{ root: { color: "#666", marginTop: 4 } }}
                          >
                            Taxes & Fees
                          </Text>
                        </Stack>
                      </Stack>
                    </Stack>
                  </Stack.Item>
                  <Stack.Item>
                    <Stack horizontal tokens={{ childrenGap: 8 }}>
                      <DefaultButton
                        text="View"
                        onClick={() => {
                          setSelectedVehicle(item);
                          setIsDetailsPanelOpen(true);
                        }}
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
                            border: isSelected
                              ? "1px solid #1890ff !important"
                              : "none !important",
                            borderRadius: 4,
                            height: 32,
                            fontSize: 14,
                            color: isSelected ? "#1890ff" : "#1890ff",
                            backgroundColor: "transparent",
                            outline: "none",
                          },
                          rootHovered: {
                            border: isSelected
                              ? "1px solid #1890ff !important"
                              : "1px solid #d9d9d9 !important",
                          },
                          rootFocused: {
                            border: isSelected
                              ? "1px solid #1890ff !important"
                              : "1px solid #d9d9d9 !important",
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
        <Stack.Item styles={{ root: { flex: 1, paddingTop: 16 } }}>
          <Stack tokens={{ childrenGap: 16 }}>
            <Stack>
              <Text variant="large" styles={{ root: { fontWeight: "bold" } }}>
                {displayTotals.totalOwed}
              </Text>
              <Text variant="medium" styles={{ root: { color: "#666" } }}>
                Total Owed to Barrett-Jackson
              </Text>
            </Stack>
            <Stack>
              <Text variant="medium">{displayTotals.bidderDeposit}</Text>
              <Text variant="medium" styles={{ root: { color: "#666" } }}>
                Bidder Deposit
              </Text>
            </Stack>
            <Stack>
              <Text variant="medium">{displayTotals.escrowAmount}</Text>
              <Text variant="medium" styles={{ root: { color: "#666" } }}>
                Escrow Amount
              </Text>
            </Stack>
            <Stack>
              <Text variant="medium">{displayTotals.credits}</Text>
              <Text variant="medium" styles={{ root: { color: "black" } }}>
                Credits
              </Text>
            </Stack>
            <Stack>
              <Text variant="medium">{displayTotals.totalHammerPrice}</Text>
              <Text variant="medium" styles={{ root: { color: "#666" } }}>
                Total Hammer Price
              </Text>
            </Stack>
            <Stack>
              <Text variant="medium">{displayTotals.totalFees}</Text>
              <Text variant="medium" styles={{ root: { color: "#666" } }}>
                Total Fees
              </Text>
            </Stack>
          </Stack>
        </Stack.Item>
      </Stack>

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
                      <Image
                        src={vehicle.bjac_imageurl}
                        width={150}
                        height={90}
                        styles={{ root: { borderRadius: 4 } }}
                      />
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
                            Lot#: {vehicle.bjac_lot || "0"}
                          </Text>
                          <Text
                            variant="mediumPlus"
                            styles={{ root: { fontWeight: "bold" } }}
                          >
                            {vehicle.bjac_name}
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
                              {vehicle.bjac_stageFormattedValue || "Unknown"}
                            </Text>
                            <Text
                              variant="small"
                              styles={{ root: { color: "#666", marginTop: 4 } }}
                            >
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
                              {vehicle.bjac_stageFormattedValue || "Unknown"}
                            </Text>
                            <Text
                              variant="small"
                              styles={{ root: { color: "#666", marginTop: 4 } }}
                            >
                              Release Status
                            </Text>
                          </Stack>
                          <Stack>
                            <Text variant="medium">{vehicle.bjac_hammerprice ? `$${vehicle.bjac_hammerprice.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : "$0.00"}</Text>
                            <Text
                              variant="small"
                              styles={{ root: { color: "#666", marginTop: 4 } }}
                            >
                              Hammer Price
                            </Text>
                          </Stack>
                          <Stack>
                            <Text variant="medium">{vehicle.bjac_taxfee ? `$${vehicle.bjac_taxfee.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : "$0.00"}</Text>
                            <Text
                              variant="small"
                              styles={{ root: { color: "#666", marginTop: 4 } }}
                            >
                              Taxes & Fees
                            </Text>
                          </Stack>
                        </Stack>
                      </Stack>
                    </Stack.Item>
                  </Stack>
                ))
              )}
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
                      <Stack
                        horizontal
                        tokens={{ childrenGap: 20 }}
                        styles={{ root: { marginBottom: 8 } }}
                      >
                        <Stack.Item grow>
                          <Text variant="medium">Total Hammer Price</Text>
                        </Stack.Item>
                        <Text variant="medium">{displayTotals.totalHammerPrice}</Text>
                      </Stack>
                      <Stack
                        horizontal
                        tokens={{ childrenGap: 20}}
                        styles={{ root: { marginBottom: 8 } }}
                      >
                        <Stack.Item grow>
                          <Text variant="medium">Total Taxes & Fees</Text>
                        </Stack.Item>
                        <Text variant="medium">{displayTotals.totalFees}</Text>
                      </Stack>
                      <Stack horizontal tokens={{ childrenGap: 20 }}>
                        <Stack.Item grow>
                          <Text
                            variant="medium"
                            styles={{ root: { fontWeight: "bold" } }}
                          >
                            Total Amount
                          </Text>
                        </Stack.Item>
                        <Text variant="medium" styles={{ root: { fontWeight: "bold" } }}>
                          {displayTotals.totalOwed}
                        </Text>
                      </Stack>
                    </Stack>
                  </Stack>
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
                  <Stack
                    horizontal
                    horizontalAlign="end"
                    tokens={{ childrenGap: 10 }}
                    styles={{ root: { marginTop: 20 } }}
                  >
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
            </Stack>
          </PivotItem>
          <PivotItem headerText="Notes">
            <Stack tokens={{ childrenGap: 20 }} styles={{ root: { paddingTop: 20 } }}>
              <Text>Notes will be displayed here.</Text>
            </Stack>
          </PivotItem>
        </Pivot>
      </Panel>

      <VehicleDetailsPanel
        isOpen={isDetailsPanelOpen}
        onDismiss={() => {
          setIsDetailsPanelOpen(false);
          setSelectedVehicle(null);
        }}
        vehicle={selectedVehicle}
      />
    </Stack>
  );
};

export const getConsignmentCounts = (items: ICartItem[]) => {
  const categorizedItems = {
    boughtVehicles: items.filter(
      (item) => item.bjac_transactiontypeFormattedValue === "Purchase" && item.bjac_consigntypeFormattedValue === "Vehicle"
    ),
    boughtAutomobilia: items.filter(
      (item) => item.bjac_transactiontypeFormattedValue === "Purchase" && item.bjac_isinvoiced && item.bjac_consigntypeFormattedValue === "Automobilia"
    ),
    soldVehicles: items.filter(
      (item) => item.bjac_transactiontypeFormattedValue === "Sale" && item.bjac_isinvoiced && item.bjac_consigntypeFormattedValue === "Vehicle"
    ),
    unsoldVehicles: items.filter(
      (item) => item.bjac_transactiontypeFormattedValue === "Sale" && item.bjac_consigntypeFormattedValue === "Vehicle" && !item.bjac_isinvoiced
    ),
    soldAutomobilia: items.filter(
      (item) => item.bjac_transactiontypeFormattedValue === "Sale" && item.bjac_isinvoiced && item.bjac_consigntypeFormattedValue === "Automobilia"
    ),
    unsoldAutomobilia: items.filter(
      (item) => item.bjac_transactiontypeFormattedValue === "Sale" && item.bjac_consigntypeFormattedValue === "Automobilia" && !item.bjac_isinvoiced
    ),
  };
  console.log("Categorized Items:", categorizedItems);
  return {
    boughtVehiclesCount: categorizedItems.boughtVehicles.length,
    boughtAutomobiliaCount: categorizedItems.boughtAutomobilia.length,
    soldVehiclesCount: categorizedItems.soldVehicles.length,
    unsoldVehiclesCount: categorizedItems.unsoldVehicles.length,
    soldAutomobiliaCount: categorizedItems.soldAutomobilia.length,
    unsoldAutomobiliaCount: categorizedItems.unsoldAutomobilia.length,
  };
};