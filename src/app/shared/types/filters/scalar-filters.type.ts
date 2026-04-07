export type ScalarFilters = {
  q?: string;
  price?: PriceRange;
};

type PriceRange = {
  minPrice: number;
  maxPrice: number;
};
