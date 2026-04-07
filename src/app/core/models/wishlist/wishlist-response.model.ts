import { IProduct } from '../products/product.model';

export interface IWishlistResponse {
  status: string;
  count: number;
  data: IProduct[];
}
