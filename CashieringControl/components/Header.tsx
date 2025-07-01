import * as React from "react";
import { Pivot, PivotItem, SearchBox, IconButton, Stack, Dropdown, IDropdownOption } from "@fluentui/react";
import { stackTokens } from "../styles";

interface HeaderProps {
  onSortChange: (sortOption: string) => void;
  onFilterChange: (filterOption: string) => void;
  onPivotChange: (pivotKey: string) => void;
  onSearchChange: (searchQuery: string) => void; // Add onSearchChange callback
  boughtVehiclesCount: number;
  boughtAutomobiliaCount: number;
  soldVehiclesCount: number;
  unsoldVehiclesCount: number;
  soldAutomobiliaCount: number;
  unsoldAutomobiliaCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  onSortChange,
  onFilterChange,
  onPivotChange,
  onSearchChange,
  boughtVehiclesCount,
  boughtAutomobiliaCount,
  soldVehiclesCount,
  unsoldVehiclesCount,
  soldAutomobiliaCount,
  unsoldAutomobiliaCount,
}) => {
  const filterOptions: IDropdownOption[] = [
    { key: "all", text: "All" },
    { key: "vehicle", text: "Vehicle" },
    { key: "automobilia", text: "Automobilia" },
  ];

  const sortOptions: IDropdownOption[] = [
    { key: "priceAsc", text: "Price (Low to High)" },
    { key: "priceDesc", text: "Price (High to Low)" },
    { key: "nameAsc", text: "Name (A-Z)" },
    { key: "nameDesc", text: "Name (Z-A)" },
  ];

  return (
    <Stack tokens={stackTokens} styles={{ root: { padding: 10 } }}>
      <Stack horizontal horizontalAlign="space-between">
        <Stack horizontal tokens={stackTokens}>
          <h2>Customer Profile - Scottsdale 2025</h2>
        </Stack>
        <Stack horizontal tokens={stackTokens}>
          <SearchBox
            placeholder="Search"
            styles={{ root: { width: 200 } }}
            onChange={(event, newValue) => onSearchChange(newValue || "")} // Call onSearchChange with the new value
          />
          <Dropdown
            placeholder="Filter"
            options={filterOptions}
            onChange={(e, option) => onFilterChange(option?.key as string)}
            styles={{ root: { width: 100 } }}
          />
          <Dropdown
            placeholder="Sort By"
            options={sortOptions}
            onChange={(e, option) => onSortChange(option?.key as string)}
            styles={{ root: { width: 150 } }}
          />
        </Stack>
      </Stack>
      <Pivot onLinkClick={(item) => onPivotChange(item?.props.itemKey || "boughtVehicles")}>
        <PivotItem headerText="Sales Completed" itemKey="salesCompleted" />
        <PivotItem headerText="Bought Vehicles" itemKey="boughtVehicles" itemCount={boughtVehiclesCount} />
        <PivotItem headerText="Bought Automobilia" itemKey="boughtAutomobilia" itemCount={boughtAutomobiliaCount} />
        <PivotItem headerText="Sold Vehicles" itemKey="soldVehicles" itemCount={soldVehiclesCount} />
        <PivotItem headerText="Unsold Vehicles" itemKey="unsoldVehicles" itemCount={unsoldVehiclesCount} />
        <PivotItem headerText="Sold Automobilia" itemKey="soldAutomobilia" itemCount={soldAutomobiliaCount} />
        <PivotItem headerText="Unsold Automobilia" itemKey="unsoldAutomobilia" itemCount={unsoldAutomobiliaCount} />
      </Pivot>
    </Stack>
  );
};