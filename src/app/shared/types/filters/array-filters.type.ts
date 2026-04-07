import { IBrand } from '../../../core/models/brands/brand.model';
import { ICategory } from '../../../core/models/categories/category.model';
import { ISubcategory } from '../../../core/models/subcategories/subcategory.model';

export type ArrayFilters = {
  category?: ICategory[];
  subcategory?: ISubcategory[];
  brand?: IBrand[];
};
