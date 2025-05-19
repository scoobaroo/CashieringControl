import * as React from "react";
import { Stack } from "@fluentui/react";
import { Header } from "./Header";
import { VehicleList, getConsignmentCounts } from "./VehicleList";

// Define IVehicle interface for type safety
interface IVehicle {
  key: string;
  image: string;
  lot: string;
  name: string;
  status: string;
  releaseStatus: string;
  hammerPrice: string;
  taxesFees: string;
  consignmentStatus: string;
  type: string;
}

interface MainLayoutProps {
  consignments: IVehicle[];
  totals: any;
}

export const MainLayout: React.FC<MainLayoutProps> = ({ consignments, totals }) => {
  const [sortOption, setSortOption] = React.useState<string>("nameAsc"); // Default sort to "A-Z"
  const [filterOption, setFilterOption] = React.useState<string>("all"); // Default filter to "All"
  const [pivotKey, setPivotKey] = React.useState<string>("salesCompleted");
  const [searchQuery, setSearchQuery] = React.useState<string>("");

  // Calculate counts for PivotItem itemCount using the consignments prop
  const counts = getConsignmentCounts(consignments);

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
        initialItems={consignments}
        totals={totals}
      />
    </Stack>
  );
};