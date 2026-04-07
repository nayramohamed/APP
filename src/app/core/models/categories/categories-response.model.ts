import { ICategory } from './category.model';

export interface ICategoriesResponse {
  results: number;
  metadata: IMetadata;
  data: ICategory[];
}

export interface IMetadata {
  currentPage: number;
  numberOfPages: number;
  limit: number;
}
