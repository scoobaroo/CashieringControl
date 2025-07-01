import { IInputs, IOutputs } from "./generated/ManifestTypes";
import * as React from "react";
import { createRoot, Root } from "react-dom/client";
import { MainLayout } from "./components/MainLayout";
import PowerAppsIntegrationService from "./integrations/PowerAppsIntegrationService";
import { IOpportunity } from "./interfaces/IOpportunity";
import { ICart } from "./interfaces/ICart";
import { ICartItem } from "./interfaces/ICartItem";

export class CashieringControl implements ComponentFramework.StandardControl<IInputs, IOutputs> {
  private container: HTMLDivElement;
  private root: Root | null = null;
  private service: PowerAppsIntegrationService | null = null;
  private notifyOutputChanged: () => void;
  private cartItems: ICartItem[] = [];
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
        React.createElement(MainLayout, { cartItems: this.cartItems, totals: this.totals })
      );
    }
  }

  public async updateView(context: ComponentFramework.Context<IInputs>): Promise<void> {
    // Re-initialize the service with the updated context
    this.service = new PowerAppsIntegrationService(context);

    const accountId = (context.mode as any).contextInfo?.entityId;

    // Fetch cart and cart items
    const cart: ICart | undefined = await this.service?.fetchCart(accountId);
    if (cart !== undefined) {
      const cartItems: ICartItem[] = await this.service?.fetchCartItems(cart.bjac_cartId);
      cart.cartItems = cartItems;
      this.cartItems = cartItems;
    }
    console.log("Cart:", cart);
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