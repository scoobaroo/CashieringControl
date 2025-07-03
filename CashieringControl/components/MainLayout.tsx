import * as React from "react";
import { Stack } from "@fluentui/react";
import { Header } from "./Header";
import { VehicleList, getConsignmentCounts } from "./VehicleList";
import { ICartItem } from "../interfaces/ICartItem";
// Define IVehicle interface for type safety

interface MainLayoutProps {
  cartItems: ICartItem[];
  totals: any;
}

export const MainLayout: React.FC<MainLayoutProps> = ({ cartItems, totals }) => {
  const [sortOption, setSortOption] = React.useState<string>("nameAsc"); // Default sort to "A-Z"
  const [filterOption, setFilterOption] = React.useState<string>("all"); // Default filter to "All"
  const [pivotKey, setPivotKey] = React.useState<string>("salesCompleted");
  const [searchQuery, setSearchQuery] = React.useState<string>("");

  // Calculate counts for PivotItem itemCount using the consignments prop
  const counts = getConsignmentCounts(cartItems);

  return (
    <Stack styles={{ root: { height: "100vh" } }}>
      <Header
        onSortChange={setSortOption}
        onFilterChange={setFilterOption}
        onPivotChange={setPivotKey}
        onSearchChange={setSearchQuery}
        boughtVehiclesCount={counts.boughtVehiclesCount}
        boughtAutomobiliaCount={counts.boughtAutomobiliaCount}
        soldVehiclesCount={counts.soldVehiclesCount}
        unsoldVehiclesCount={counts.unsoldVehiclesCount}
        soldAutomobiliaCount={counts.soldAutomobiliaCount}
        unsoldAutomobiliaCount={counts.unsoldAutomobiliaCount}
      />
      <VehicleList
        sortOption={sortOption}
        filterOption={filterOption}
        pivotKey={pivotKey}
        searchQuery={searchQuery}
        initialItems={cartItems}
        totals={totals}
      />
    </Stack>
  );
};