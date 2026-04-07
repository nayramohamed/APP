import { Component, computed, effect, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { FeaturesSectionComponent } from '../../shared/components/features-section/features-section.component';
import { SearchHeaderComponent } from './components/search-header/search-header.component';
import { FilterToolbarComponent } from './components/filter-toolbar/filter-toolbar.component';
import { ProductService } from '../../core/services/product.service';
import { FilterSidebarComponent } from './components/filter-sidebar/filter-sidebar.component';
import { EmptyProductsSearchComponent } from './components/empty-products-search/empty-products-search.component';
import { IProduct } from '../../core/models/products/product.model';
import { ActiveFiltersComponent } from '../../shared/components/active-filters/active-filters.component';
import { ActivatedRoute, Router } from '@angular/router';
import { ItemsLoaderComponent } from '../../shared/components/items-loader/items-loader.component';
import { forkJoin } from 'rxjs';

import { IMetadata } from '../../core/models/products/products-response.model';
import { FiltersMap } from '../../shared/types/filters/filters-map.type';
import { getArrayFilterIds, isArrayFilterKey } from '../../shared/utils/filters/filters-utils';
import { FilterKey } from '../../shared/types/filters/filter-key.type';
import { ArrayFilters } from '../../shared/types/filters/array-filters.type';
import { ICategory } from '../../core/models/categories/category.model';
import { IBrand } from '../../core/models/brands/brand.model';

import { CategoryService } from '../../core/services/category.service';
import { BrandService } from '../../core/services/brand.service';
import { ArrayFilterKey } from '../../shared/types/filters/array-filter-key.type';
import { PaginationComponent } from '../../shared/components/pagination/pagination.component';
import { FilterProductsGridComponent } from './components/filter-products-grid/filter-products-grid.component';

@Component({
  selector: 'app-search',
  imports: [
    FormsModule,
    FeaturesSectionComponent,
    SearchHeaderComponent,
    FilterToolbarComponent,
    FilterSidebarComponent,
    EmptyProductsSearchComponent,
    ActiveFiltersComponent,
    ItemsLoaderComponent,
    PaginationComponent,
    FilterProductsGridComponent,
  ],
  templateUrl: './search.component.html',
  styleUrl: './search.component.css',
})
export class SearchComponent implements OnInit {
  private readonly productService = inject(ProductService);
  private readonly categoryService = inject(CategoryService);
  private readonly brandService = inject(BrandService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  searchQuery = signal('');
  isSearchingProducts = signal(false);
  products = signal<IProduct[]>([]);
  filters = signal<FiltersMap>({});
  categories = signal<ICategory[]>([]);
  brands = signal<IBrand[]>([]);
  isReady = signal(false);
  isListView = signal(false);
  toggleMobileFilters = signal(false);
  paginationData = signal<IMetadata | null>(null);
  pagesCount = computed(() => {
    return Number(this.paginationData()?.numberOfPages) || 1;
  });

  constructor() {
    this.route.queryParams.subscribe((params) => {
      this.searchQuery.set(params['q'] ?? '');

      this.loadProducts();
    });

    effect(() => {
      if (this.isReady()) this.setFilter();
    });
  }

  ngOnInit(): void {
    forkJoin({
      categories: this.loadCategories(),
      brandsResponse: this.loadBrands(),
    }).subscribe(({ categories, brandsResponse }) => {
      this.categories.set(categories);
      this.brands.set(brandsResponse.data);
      this.getCurrentFilters();
      this.isReady.set(true);
    });
  }

  getCurrentFilters() {
    const params = this.route.snapshot.queryParamMap;
    let data: FiltersMap = {};

    const arrayfiltersMap: ArrayFilters = {
      brand: this.brands(),
      category: this.categories(),
    };

    const filterKeys = Object.keys(arrayfiltersMap) as ArrayFilterKey[];

    filterKeys.forEach((filterKey) => {
      if (isArrayFilterKey(filterKey)) {
        const ids = params.getAll(filterKey);
        data[filterKey] = arrayfiltersMap[filterKey]!.filter((f) => ids.includes(f._id)) ?? null;
      }
    });

    this.filters.set(data);
  }

  setFilter() {
    const filters = this.filters();
    const searchQuery = this.searchQuery();

    const price = filters.price;
    const minPrice = price?.minPrice ?? 0;
    const maxPrice = price?.maxPrice ?? 0;

    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: {
        ...this.getArraysFiltersParams(filters),
        q: searchQuery.trim() || null,
        'price[gte]': minPrice > 0 ? minPrice : null,
        'price[lte]': maxPrice > 0 ? maxPrice : null,
        page: null,
      },
      queryParamsHandling: 'merge',
    });
  }

  getArraysFiltersParams(filtersMap: FiltersMap): any {
    const filterKeys = Object.keys(filtersMap) as FilterKey[];
    let arrayFiltersIds: Record<string, string[]> = {
      category: [],
      brand: [],
    };

    filterKeys.forEach((key) => {
      if (isArrayFilterKey(key)) {
        arrayFiltersIds[key] = getArrayFilterIds(this.filters(), key) ?? [];
      }
    });

    return arrayFiltersIds;
  }

  loadProducts(): void {
    this.isSearchingProducts.set(true);
    const limit = 12;
    const params = {
      ...this.route.snapshot.queryParams,
      limit,
    };

    this.productService.getProducts(params).subscribe({
      next: (response) => {
        this.paginationData.set(response.metadata);
        this.products.set(response.data);
        this.isSearchingProducts.set(false);
      },
      error: () => {
        this.isSearchingProducts.set(false);
      },
    });
  }

  loadCategories() {
    return this.categoryService.getCategories();
  }

  loadBrands() {
    return this.brandService.getBrands({});
  }

  clearAllFilters(): void {
    this.router.navigate(['/search']);
    this.filters.set({});
    this.searchQuery.set('');
  }
}
