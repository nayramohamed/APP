import { IOrder } from './order.model';

export interface IOrdersResponse {
  results: number;
  metadata: IMetadata;
  data: IOrder[];
}

export interface IMetadata {
  currentPage: number;
  numberOfPages: number;
  limit: number;
  nextPage: number;
}
