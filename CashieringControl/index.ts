import { IInputs, IOutputs } from "./generated/ManifestTypes";
import * as React from "react";
import { createRoot, Root } from "react-dom/client";
import { MainLayout } from "./components/MainLayout";
import PowerAppsIntegrationService from "./integrations/PowerAppsIntegrationService";
import { ICart } from "./interfaces/ICart";
import { ICartItem } from "./interfaces/ICartItem";
import { Spinner, SpinnerSize } from "@fluentui/react"; // Import Spinner
import { IOpportunity } from "./interfaces/IOpportunity";
import { IInvoice } from "./interfaces/IInvoice";

export class CashieringControl implements ComponentFramework.StandardControl<IInputs, IOutputs> {
  private container: HTMLDivElement;
  private root: Root | null = null;
  private service: PowerAppsIntegrationService | null = null;
  private notifyOutputChanged: () => void;
  private cartItems: ICartItem[] = [];
  private isLoading = true; // Loading state

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

    // Initial render
    this.renderControl();
  }

  private renderControl(): void {
    if (this.root) {
      this.root.render(
        React.createElement(MainLayout, {
          cartItems: this.cartItems,
          isLoading: this.isLoading,
          notifyOutputChanged: this.notifyOutputChanged,
        })
      );
    }
  }

  public async updateView(context: ComponentFramework.Context<IInputs>): Promise<void> {
    // Re-initialize the service with the updated context
    this.service = new PowerAppsIntegrationService(context);
    this.renderControl(); // Render with spinner immediately

    const accountId = (context.mode as any).contextInfo?.entityId;

    try {
      // Fetch cart and cart items
      const cart: ICart | undefined = await this.service?.fetchCart(accountId);
      if (cart !== undefined) {
        const cartItems: ICartItem[] = await this.service?.fetchCartItems(cart.bjac_cartId);
        cart.cartItems = cartItems;
        this.cartItems = cartItems;
      }
      const consignments: IOpportunity[] | null = await this.service?.fetchOpportunities(accountId);
      consignments?.map(async (consignment) => {
        if (this.service && consignment.opportunityid) {
          const invoices: IInvoice[] = await this.service.fetchInvoices(consignment.opportunityid);
          consignment.invoices = invoices;
          // Fetch vehicle details for each consignment
          const vehicle = await this.service.fetchVehicle(consignment._bjac_vehicle_value!);
          consignment.vehicle = vehicle;
        }
      });
      
      console.log("Consignments:", consignments);
      console.log("Cart:", cart);
    } catch (error) {
      console.error("Error fetching data:", error);
      // Optionally set default values or handle error state
      this.cartItems = [];
    } finally {
      this.isLoading = false; // Set loading state to false after fetching
      this.renderControl(); // Render with fetched data or error state
    }
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

export default CashieringControl;