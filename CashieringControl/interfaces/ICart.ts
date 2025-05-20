import { ICartItem } from "./ICartItem";

export interface ICart {
    bjac_eventName: string;
    bjac_eventId: string;
    bjac_cartId: string;
    cartItems?: ICartItem[];
}