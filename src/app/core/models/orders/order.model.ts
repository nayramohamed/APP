import { IUser } from '../auth/user.model';
import { ICartProduct } from '../cart/cart-product-model';
import { IShippingAddress } from './shipping-address.model';

export interface IOrder {
  shippingAddress?: IShippingAddress;
  taxPrice: number;
  shippingPrice: number;
  totalOrderPrice: number;
  paymentMethodType: PaymentMethodType;
  isPaid: boolean;
  isDelivered: boolean;
  _id: string;
  user: IUser;
  cartItems: ICartProduct[];
  createdAt: Date;
  updatedAt: Date;
  id: number;
}

enum PaymentMethodType {
  Card = 'card',
  Cash = 'cash',
}
