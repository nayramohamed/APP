import {
  Component,
  CUSTOM_ELEMENTS_SCHEMA,
  effect,
  ElementRef,
  inject,
  input,
  OnInit,
  signal,
  ViewChild,
} from '@angular/core';
import { SectionHeaderComponent } from '../../../../shared/components/section-header/section-header.component';
import { ProductService } from '../../../../core/services/product.service';
import { IProduct } from '../../../../core/models/products/product.model';
import { ProductCardComponent } from '../../../../shared/components/product-card/product-card.component';
import { WishlistService } from '../../../../core/services/wishlist.service';
import { AuthService } from '../../../../core/services/auth.service';
import { SwiperContainer } from 'swiper/element';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
  selector: 'app-similar-category-products-slider',
  imports: [SectionHeaderComponent, ProductCardComponent, ProductCardComponent, TranslatePipe],
  templateUrl: './similar-category-products-slider.component.html',
  styleUrl: './similar-category-products-slider.component.css',
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  host: { ngSkipHydration: 'true' },
})
export class SimilarCategoryProductsSliderComponent {
  private readonly productService: ProductService = inject(ProductService);
  private readonly wishlistService: WishlistService = inject(WishlistService);
  private readonly authService: AuthService = inject(AuthService);

  product = input<IProduct>();
  currentProductId = signal('');
  products = signal<IProduct[]>([]);
  InWishListSet = signal<Set<string>>(new Set());
  isLoggedIn = this.authService.isLoggedIn;
  breakpointsConfig = {
    0: {
      slidesPerView: 1,
    },
    640: {
      slidesPerView: 2,
    },
    768: {
      slidesPerView: 3,
    },
    1024: {
      slidesPerView: 4,
    },
    1280: {
      slidesPerView: 5,
    },
  };

  @ViewChild('swiperRef') swiperRef!: ElementRef<SwiperContainer>;
  constructor() {
    effect(() => {
      const categoryId = this.product()?.category?._id;

      if (categoryId) {
        this.loadproductsByCategory(categoryId);
        this.loadWishlist();
      }
    });
  }

  nextProduct(): void {
    this.swiperRef.nativeElement.swiper.slideNext();
  }

  prevProduct(): void {
    this.swiperRef.nativeElement.swiper.slidePrev();
  }

  loadproductsByCategory(categoryId: string): void {
    const category = {
      category: categoryId,
    };
    this.productService.getProducts(category).subscribe({
      next: (response) => {
        const products = response.data.filter((p) => p._id != this.product()?._id);
        this.products.set(products);
      },
    });
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
}
