import { ICart } from './cart.model';

export interface ICartResponse {
  status: string;
  message: string;
  numOfCartItems: number;
  cartId: string;
  data: ICart;
}
