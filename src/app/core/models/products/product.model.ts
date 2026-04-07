import { IBrand } from "../brands/brand.model";
import { ICategory } from "../categories/category.model";
import { ISubcategory } from "../subcategories/subcategory.model";

export interface IProduct {
  sold?: number;
  images: string[];
  subcategory: ISubcategory[];
  ratingsQuantity: number;
  _id: string;
  title: string;
  slug: string;
  description: string;
  quantity: number;
  price: number;
  imageCover: string;
  category: ICategory;
  brand: IBrand;
  ratingsAverage: number;
  createdAt: string;
  updatedAt: string;
  id: string;
  priceAfterDiscount?: number;
  availableColors?: any[];
}
