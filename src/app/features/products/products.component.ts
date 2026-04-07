import { Component, computed, DestroyRef, inject, signal } from '@angular/core';
import { FeaturesSectionComponent } from '../../shared/components/features-section/features-section.component';
import { BreadcrumbHeaderComponent } from '../../shared/components/breadcrumb-header/breadcrumb-header.component';
import { IProduct } from '../../core/models/products/product.model';
import { ProductCardComponent } from '../../shared/components/product-card/product-card.component';
import { ProductService } from '../../core/services/product.service';
import { filter, finalize, forkJoin, of, switchMap, tap } from 'rxjs';
import { ItemsLoaderComponent } from '../../shared/components/items-loader/items-loader.component';
import { ActivatedRoute, NavigationEnd, Router, RouterLink } from '@angular/router';
import { ProductsEmptyComponent } from './components/products-empty/products-empty.component';
import { CategoryService } from '../../core/services/category.service';
import { BrandService } from '../../core/services/brand.service';
import { ICategory } from '../../core/models/categories/category.model';
import { IBrand } from '../../core/models/brands/brand.model';
import { ISubcategory } from '../../core/models/subcategories/subcategory.model';
import { SubCategoryService } from '../../core/services/sub-category.service';
import { AuthService } from '../../core/services/auth.service';
import { WishlistService } from '../../core/services/wishlist.service';
import { ActiveFiltersComponent } from '../../shared/components/active-filters/active-filters.component';
import { FiltersMap } from '../../shared/types/filters/filters-map.type';
import { IMetadata } from '../../core/models/products/products-response.model';
import { PaginationComponent } from '../../shared/components/pagination/pagination.component';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-products',
  imports: [
    FeaturesSectionComponent,
    BreadcrumbHeaderComponent,
    ProductCardComponent,
    ItemsLoaderComponent,
    ProductsEmptyComponent,
    ActiveFiltersComponent,
    PaginationComponent,
    TranslatePipe,
  ],
  templateUrl: './products.component.html',
  styleUrl: './products.component.css',
})
export class ProductsComponent {
  private readonly productService = inject(ProductService);
  private readonly categoryService = inject(CategoryService);
  private readonly brandService = inject(BrandService);
  private readonly subcategoryService = inject(SubCategoryService);
  private readonly authService = inject(AuthService);
  private readonly wishlistService = inject(WishlistService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly translateService = inject(TranslateService);
  private destroyRef = inject(DestroyRef);

  isLoading = signal(true);
  products = signal<IProduct[]>([]);
  productsCount = signal(0);
  activeFilters = signal<FiltersMap>({});
  parentRoutes = signal<string[]>([]);
  parentLabels = signal<string[]>([]);
  paginationData = signal<IMetadata>({} as IMetadata);
  pagesCount = computed(() => {
    return this.paginationData().numberOfPages;
  });
  isFiltersEmpty = computed(() => {
    const filters = this.activeFilters();
    return !filters['category'] && !filters['brand'] && !filters['subcategory'];
  });
  isLoggedIn = this.authService.isLoggedIn;
  InWishListSet = signal<Set<string>>(new Set());

  ngOnInit(): void {
    this.initComponent();
    this.loadWishlist();
  }

  initComponent(): void {
    this.route.queryParams
      .pipe(
        tap(() => this.isLoading.set(true)),
        switchMap((params) => {
          const categoryId = params['category'] ?? null;
          const brandId = params['brand'] ?? null;
          const subcategoryId = params['subcategory'] ?? null;

          return forkJoin({
            category: this.loadCategory(categoryId),
            brand: this.loadBrand(brandId),
            subcategory: this.loadSubCategory(subcategoryId),
            productsResponse: this.loadFilteredProducts(params),
          });
        }),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: ({ category, brand, subcategory, productsResponse }) => {
          this.activeFilters.update((current) => ({
            ...current,
            category: category ? [category] : undefined,
            brand: brand ? [brand] : undefined,
            subcategory: subcategory ? [subcategory] : undefined,
          }));

          this.products.set(productsResponse.data);
          this.paginationData.set(productsResponse.metadata);
          this.productsCount.set(productsResponse.results);
          this.initParentRoutes();
          this.isLoading.set(false);
        },
        error: () => {
          this.isLoading.set(false);
        },
      });
  }

  initParentRoutes(): void {
    const category = this.activeFilters()['category']?.[0];
    const brand = this.activeFilters()['brand']?.[0];
    const subcategory = this.activeFilters()['subcategory']?.[0];

    const routes: string[] = [];
    const labels: string[] = [];

    routes.push('/home');
    labels.push('breadcrumb.home');

    if (category || subcategory) {
      const validFilter = category ?? subcategory;

      routes.push('/categories', validFilter!._id);
      labels.push('breadcrumb.categories', validFilter!.name);
    }

    if (brand) {
      routes.push('/brand', brand._id);
      labels.push('breadcrumb.brands', brand.name);
    }

    if (!brand && !category && !subcategory) {
      routes.push('All Products');
      labels.push('breadcrumb.allProducts');
    }

    this.parentRoutes.set(routes);
    this.parentLabels.set(labels);
  }

  loadCategory(categoryId: string) {
    if (!categoryId) return of(null);
    return this.categoryService.getCategoryById(categoryId);
  }

  loadBrand(brandId: string) {
    if (!brandId) return of(null);
    return this.brandService.getBrandById(brandId);
  }

  loadSubCategory(subcategoryId: string) {
    if (!subcategoryId) return of(null);
    return this.subcategoryService.getSubcategoriesById(subcategoryId);
  }
  loadFilteredProducts(params: any) {
    const limit = 15;
    params = {
      ...params,
      limit,
    };
    return this.productService.getProducts(params);
  }

  loadWishlist(): void {
    this.isLoggedIn() ? this.loadWishListAsUser() : this.loadWishListAsGuest();
  }

  loadWishListAsUser(): void {
    this.wishlistService.getCurrentWishlist().subscribe({
      next: (response) => {
        this.setWishlistState(response.data);
      },
    });
  }

  loadWishListAsGuest(): void {
    const wishlist = this.wishlistService.getGuestWishlist() ?? [];
    this.setWishlistState(wishlist);
  }

  setWishlistState(products: IProduct[]): void {
    const productsIds = products.map((p) => p._id);
    this.InWishListSet.set(new Set(productsIds));
  }

  clearAll(): void {
    this.router.navigate(['/products']);
  }
}
