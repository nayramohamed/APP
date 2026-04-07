import { ISubcategory } from './subcategory.model';

export interface ISubcategoriesResponse {
  results: number;
  metadata: IMetadata;
  data: ISubcategory[];
}

export interface IMetadata {
  currentPage: number;
  numberOfPages: number;
  limit: number;
}
