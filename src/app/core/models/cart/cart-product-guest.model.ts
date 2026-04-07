export interface ICartProductGuest {
  productId: string;
  count: number;
  price: number;
  product: IProduct;
}

interface IProduct {
  _id: string;
  id: string;
  title: string;
  imageCover: string;
  category: ICategory;
}

interface ICategory {
  name: string;
}
