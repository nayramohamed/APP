import { IBrand } from './brand.model';

export interface IBrandsResponse {
  results: number;
  metadata: IMetadata;
  data: IBrand[];
}

export interface IMetadata {
  currentPage: number;
  numberOfPages: number;
  limit: number;
  nextPage: number;
}
