import { IProduct } from './product.model';

export interface IProductsResponse {
  results: number;
  metadata: IMetadata;
  data: IProduct[];
}

export interface IMetadata {
  currentPage: number;
  numberOfPages: number;
  limit: number;
  nextPage?: number;
  prevPage?: number;
}
