import { IBrand } from "../brands/brand.model";
import { ICategory } from "../categories/category.model";
import { ISubcategory } from "../subcategories/subcategory.model";

export interface ICartProductDetails {
  subcategory: ISubcategory[];
  _id: string;
  title: string;
  slug: string;
  quantity: number;
  imageCover: string;
  category: ICategory;
  brand: IBrand;
  ratingsAverage: number;
  id: string;
}
