import { ICartProductDetails } from "./cart-product-details.model";

export interface ICartProduct {
  count: number;
  _id: string;
  product: ICartProductDetails;
  price: number;
}
