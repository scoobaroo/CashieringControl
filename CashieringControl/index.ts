import { IInputs, IOutputs } from "./generated/ManifestTypes";
import * as React from "react";
import { createRoot, Root } from "react-dom/client";
import { MainLayout } from "./components/MainLayout";
import PowerAppsIntegrationService from "./integrations/PowerAppsIntegrationService";
import { IOpportunity } from "./interfaces/IOpportunity";
import { ICart } from "./interfaces/ICart";
import { ICartItem } from "./interfaces/ICartItem";

// Simulated consignment data (replace with actual data fetching in a real PCF control)
const mockConsignments: any[] = [
  {
    key: "1",
    image: "https://cdn.motor1.com/images/mgl/W8M4Go/s1/2015-lamborghini-veneno-roadster.jpg",
    lot: "3454",
    name: "2019 Chevrolet Corvette ZR1",
    status: "NOT PAID",
    releaseStatus: "Processing Release",
    hammerPrice: "$148,125.00",
    taxesFees: "$6,925.00",
    consignmentStatus: "Bought",
    type: "Vehicle",
  },
  {
    key: "2",
    image: "https://cdn.motor1.com/images/mgl/W8M4Go/s1/2015-lamborghini-veneno-roadster.jpg",
    lot: "3455",
    name: "2020 Ford Mustang Shelby",
    status: "PAID",
    releaseStatus: "Released",
    hammerPrice: "$95,000.00",
    taxesFees: "$4,500.00",
    consignmentStatus: "Bought",
    type: "Vehicle",
  },
  {
    key: "3",
    image: "https://cdn.motor1.com/images/mgl/W8M4Go/s1/2015-lamborghini-veneno-roadster.jpg",
    lot: "3456",
    name: "2018 Dodge Challenger SRT",
    status: "NOT PAID",
    releaseStatus: "Processing Release",
    hammerPrice: "$82,500.00",
    taxesFees: "$3,750.00",
    consignmentStatus: "Sold",
    type: "Vehicle",
  },
  {
    key: "4",
    image: "https://cdn.motor1.com/images/mgl/W8M4Go/s1/2015-lamborghini-veneno-roadster.jpg",
    lot: "3457",
    name: "2021 Porsche 911 Turbo",
    status: "PAID",
    releaseStatus: "Released",
    hammerPrice: "$210,000.00",
    taxesFees: "$10,000.00",
    consignmentStatus: "Unsold",
    type: "Vehicle",
  },
  {
    key: "5",
    image: "https://cdn.motor1.com/images/mgl/W8M4Go/s1/2015-lamborghini-veneno-roadster.jpg",
    lot: "3458",
    name: "Vintage Steering Wheel",
    status: "PAID",
    releaseStatus: "Released",
    hammerPrice: "$2,500.00",
    taxesFees: "$150.00",
    consignmentStatus: "Bought",
    type: "Automobilia",
  },
  {
    key: "6",
    image: "https://cdn.motor1.com/images/mgl/W8M4Go/s1/2015-lamborghini-veneno-roadster.jpg",
    lot: "3459",
    name: "Classic Car Poster",
    status: "NOT PAID",
    releaseStatus: "Processing Release",
    hammerPrice: "$1,200.00",
    taxesFees: "$75.00",
    consignmentStatus: "Sold",
    type: "Automobilia",
  },
  {
    key: "7",
    image: "https://cdn.motor1.com/images/mgl/W8M4Go/s1/2015-lamborghini-veneno-roadster.jpg",
    lot: "3460",
    name: "Model Car Kit",
    status: "PAID",
    releaseStatus: "Released",
    hammerPrice: "$800.00",
    taxesFees: "$50.00",
    consignmentStatus: "Unsold",
    type: "Automobilia",
  },
];

// Simulated totals data (replace with actual data fetching in a real PCF control)
const mockTotals = {
  totalOwed: "$620,000.00",
  bidderDeposit: "$10,000.00",
  escrowAmount: "$5,000.00",
  credits: "$322,812.00",
  totalHammerPrice: "$4,614,950.00",
  totalFees: "$322,812.00",
};

export class CashieringControl implements ComponentFramework.StandardControl<IInputs, IOutputs> {
  private container: HTMLDivElement;
  private root: Root | null = null; // Store the root instance
  private service: PowerAppsIntegrationService | null = null;
  private notifyOutputChanged: () => void;
  private consignments: any[] = [];
  private totals: any = {};

  public async init(context: ComponentFramework.Context<IInputs>, notifyOutputChanged: () => void, state: ComponentFramework.Dictionary, container: HTMLDivElement): Promise<void> {
    this.container = container;
    this.notifyOutputChanged = notifyOutputChanged;

    // Initialize the root for React 18
    this.root = createRoot(this.container);

    // Initialize the PowerAppsIntegrationService
    this.service = new PowerAppsIntegrationService(context);
    
  }

  private renderControl(): void {
    if (this.root) {
      this.root.render(
        React.createElement(MainLayout, { consignments: this.consignments, totals: this.totals })
      );
    }
  }

  public async updateView(context: ComponentFramework.Context<IInputs>): Promise<void> {
    // Re-initialize the service with the updated context
    this.service = new PowerAppsIntegrationService(context);

    const accountId = (context.mode as any).contextInfo?.entityId;
    const opportunities: IOpportunity[]  = await this.service.fetchOpportunities(accountId);
    opportunities.map(async (opportunity: IOpportunity) => {
      const invoices = await this.service?.fetchInvoices(opportunity.opportunityId);
      opportunity.invoices = invoices;
    });
    console.log("Opportunities with invoices:", opportunities);

    const cart: ICart | null = await this.service?.fetchCart(accountId);
    if(cart !== null){
      const cartItems :ICartItem[] = await this.service?.fetchCartItems(cart.bjac_cartId);
      cart.cartItems = cartItems;
    }
    console.log("Cart:", cart);
   
    this.consignments = mockConsignments;
    this.totals = mockTotals;

    // Initial render
    this.renderControl();
    // Fetch updated data (simulated for now; in a real PCF control, use this.service to fetch data)
    this.consignments = mockConsignments;
    this.totals = mockTotals;

    // Re-render with updated data
    this.renderControl();
  }

  public getOutputs(): IOutputs {
    return {};
  }

  public destroy(): void {
    if (this.root) {
      this.root.unmount();
      this.root = null;
    }
  }
}