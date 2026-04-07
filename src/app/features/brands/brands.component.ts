import { Component, computed, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { BreadcrumbHeaderComponent } from '../../shared/components/breadcrumb-header/breadcrumb-header.component';
import { IBrand } from '../../core/models/brands/brand.model';
import { BrandService } from '../../core/services/brand.service';
import { CategoryCardComponent } from '../../shared/components/category-card/category-card.component';
import { FeaturesSectionComponent } from '../../shared/components/features-section/features-section.component';
import { BrandCardComponent } from './components/brand-card/brand-card.component';
import { PaginationComponent } from '../../shared/components/pagination/pagination.component';
import { IBrandsResponse, IMetadata } from '../../core/models/brands/brands-response.model';
import { SimilarCategoryProductsSliderComponent } from '../product-details/components/similar-category-products-slider/similar-category-products-slider.component';
import { ItemsLoaderComponent } from '../../shared/components/items-loader/items-loader.component';
import { finalize, Observable, switchMap, tap } from 'rxjs';
import { ActivatedRoute } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
  selector: 'app-brands',
  imports: [
    BreadcrumbHeaderComponent,
    FeaturesSectionComponent,
    BrandCardComponent,
    PaginationComponent,
    ItemsLoaderComponent,
    TranslatePipe,
  ],
  templateUrl: './brands.component.html',
  styleUrl: './brands.component.css',
})
export class BrandsComponent implements OnInit {
  private readonly brandService = inject(BrandService);
  private readonly route = inject(ActivatedRoute);
  private destroyRef = inject(DestroyRef);

  isLoading = signal(false);
  brands = signal<IBrand[]>([]);
  paginationData = signal<IMetadata>({} as IMetadata);
  pagesCount = computed(() => {
    return this.paginationData().numberOfPages;
  });

  ngOnInit(): void {
    this.route.queryParams
      .pipe(
        tap(() => this.isLoading.set(true)),
        switchMap((params) => {
          return this.loadBrands(params);
        }),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: (brandsResponse) => {
          this.paginationData.set(brandsResponse.metadata);
          this.brands.set(brandsResponse.data);
          this.isLoading.set(false);
        },
        error: () => {
          this.isLoading.set(false);
        },
      });
  }

  loadBrands(params: any): Observable<IBrandsResponse> {
    const limit = 18;
    params = {
      ...params,
      limit,
    };
    return this.brandService.getBrands(params);
  }
}
