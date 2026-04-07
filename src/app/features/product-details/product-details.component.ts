import { Component, inject, OnInit, signal } from '@angular/core';
import { FeaturesSectionComponent } from '../../shared/components/features-section/features-section.component';
import { ActivatedRoute } from '@angular/router';
import { CurrentProductComponent } from './components/current-product/current-product.component';
import { ProductService } from '../../core/services/product.service';
import { IProduct } from '../../core/models/products/product.model';
import { Subject, takeUntil } from 'rxjs';
import { SimilarCategoryProductsSliderComponent } from './components/similar-category-products-slider/similar-category-products-slider.component';
import { DetailsReviewComponent } from './components/details-review/details-review.component';
import { ReviewService } from '../../core/services/review.service';
import { IReview } from '../../core/models/reviews/review.model';

@Component({
  selector: 'app-product-details',
  imports: [
    FeaturesSectionComponent,
    CurrentProductComponent,
    SimilarCategoryProductsSliderComponent,
    DetailsReviewComponent,
  ],
  templateUrl: './product-details.component.html',
  styleUrl: './product-details.component.css',
})
export class ProductDetailsComponent implements OnInit {
  private readonly route: ActivatedRoute = inject(ActivatedRoute);
  private readonly productService: ProductService = inject(ProductService);
  private readonly reviewService = inject(ReviewService);
  reviews = signal<IReview[]>([]);
  reviewsCount = signal<number>(0);
  product = signal<IProduct | null>({} as IProduct);
  isLoadingCurrentProduct = signal(true);
  private destroy$ = new Subject<void>();

  ngOnInit(): void {
    this.route.paramMap.pipe(takeUntil(this.destroy$)).subscribe((params) => {
      const id = params.get('id');
      if (!id) return;

      this.getProductbyId(id);
      this.loadProductReviews(id);
    });
  }

  getProductbyId(productId: string): void {
    this.productService.getProductById(productId).subscribe({
      next: (product) => {
        this.product.set(product);
        this.isLoadingCurrentProduct.set(false);

      }
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadProductReviews(productId: string): void {
    this.reviewService.getReviewByProductId(productId).subscribe({
      next: (response) => {
        this.reviews.set(response.data);
        this.reviewsCount.set(response.results);

      },
    });
  }
}
