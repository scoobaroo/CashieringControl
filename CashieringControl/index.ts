import { IInputs, IOutputs } from "./generated/ManifestTypes";
import * as React from "react";
import { createRoot, Root } from "react-dom/client";
import { MainLayout } from "./components/MainLayout";
import PowerAppsIntegrationService from "./integrations/PowerAppsIntegrationService";
import { IOpportunity } from "./interfaces/IOpportunity";
import { ICart } from "./interfaces/ICart";
import { ICartItem } from "./interfaces/ICartItem";
import { IVehicle } from "./interfaces/IVehicle";

export class CashieringControl implements ComponentFramework.StandardControl<IInputs, IOutputs> {
  private container: HTMLDivElement;
  private root: Root | null = null;
  private service: PowerAppsIntegrationService | null = null;
  private notifyOutputChanged: () => void;
  private consignments: IVehicle[] = [];
  private totals: any = {};

  public async init(
    context: ComponentFramework.Context<IInputs>,
    notifyOutputChanged: () => void,
    state: ComponentFramework.Dictionary,
    container: HTMLDivElement
  ): Promise<void> {
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

    // Fetch opportunities and their invoices
    const opportunities: IOpportunity[] = await this.service.fetchConsignments(accountId);
    await Promise.all(
      opportunities.map(async (opportunity: IOpportunity) => {
        const invoices = await this.service?.fetchInvoices(opportunity.opportunityId);
        opportunity.invoices = invoices;
      })
    );
    console.log("Opportunities with invoices:", opportunities);

    // Fetch cart and cart items
    const cart: ICart | null = await this.service?.fetchCart(accountId);
    if (cart !== null) {
      const cartItems: ICartItem[] = await this.service?.fetchCartItems(cart.bjac_cartId);
      cart.cartItems = cartItems;
    }
    console.log("Cart:", cart);

    // Map cart items to IVehicle interface
    this.consignments = cart?.cartItems?.map((item: ICartItem, index: number) => ({
      key: item.bjac_cartitemId,
      image: item.bjac_imageurl || "https://cdn.motor1.com/images/mgl/W8M4Go/s1/2015-lamborghini-veneno-roadster.jpg", // Fallback image
      lot: `LOT${index + 1}`, // Generate a lot number since cart item doesn't provide one
      name: item.bjac_name,
      status: item.bjac_isinvoiced ? "PAID" : "NOT PAID",
      releaseStatus: item.bjac_stageFormattedValue,
      hammerPrice: `$${item.bjac_hammerprice.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      taxesFees: `$${(item.bjac_commission + item.bjac_documentationfee).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      consignmentStatus: "Bought",
      type: item.bjac_consigntypeFormattedValue,
    })) || [];
    console.log("Mapped consignments:", this.consignments);
    // Calculate totals based on cart items
    this.totals = {
      totalOwed: cart?.cartItems
        ? `$${cart.cartItems
            .reduce((sum, item) => sum + (item.bjac_total || 0), 0)
            .toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
        : "$0.00",
      bidderDeposit: "$10,000.00", // Static for now; replace with real data if available
      escrowAmount: "$5,000.00", // Static for now
      credits: "$0.00", // Static for now
      totalHammerPrice: cart?.cartItems
        ? `$${cart.cartItems
            .reduce((sum, item) => sum + (item.bjac_hammerprice || 0), 0)
            .toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
        : "$0.00",
      totalFees: cart?.cartItems
        ? `$${cart.cartItems
            .reduce((sum, item) => sum + (item.bjac_commission + item.bjac_documentationfee || 0), 0)
            .toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
        : "$0.00",
    };

    // Render the control with updated data
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