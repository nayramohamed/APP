import { finalize } from 'rxjs';
import { IProduct } from './../../core/models/products/product.model';
import { Component, computed, effect, inject, signal } from '@angular/core';
import { EmptyWishlistComponent } from './components/empty-wishlist/empty-wishlist.component';
import { FeaturesSectionComponent } from '../../shared/components/features-section/features-section.component';
import { BreadcrumbHeaderComponent } from '../../shared/components/breadcrumb-header/breadcrumb-header.component';
import { RouterLink } from '@angular/router';
import { WishlistCardComponent } from './components/wishlist-card/wishlist-card.component';
import { WishlistService } from '../../core/services/wishlist.service';
import { IWishlistResponse } from '../../core/models/wishlist/wishlist-response.model';
import { AuthService } from '../../core/services/auth.service';
import { CartService } from '../../core/services/cart.service';
import { ICartResponse } from '../../core/models/cart/cart-response-model';
import { ICartProductGuest } from '../../core/models/cart/cart-product-guest.model';
import { ItemsLoaderComponent } from '../../shared/components/items-loader/items-loader.component';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
  selector: 'app-wishlist',
  imports: [
    EmptyWishlistComponent,
    FeaturesSectionComponent,
    BreadcrumbHeaderComponent,
    RouterLink,
    WishlistCardComponent,
    ItemsLoaderComponent,
    TranslatePipe,
  ],
  templateUrl: './wishlist.component.html',
  styleUrl: './wishlist.component.css',
})
export class WishlistComponent {
  private readonly wishlistService = inject(WishlistService);
  private readonly authService = inject(AuthService);
  private readonly cartService = inject(CartService);

  wishlist = signal<IWishlistResponse | IProduct[] | null>(null);
  productsAlreadyInCartSet = signal<Set<string>>(new Set());
  isLoggedIn = this.authService.isLoggedIn;
  cart = signal<ICartResponse | ICartProductGuest[] | null>(null);
  isWishlistLoading = signal(true);
  isInCart = computed(() => {
    const currentCart = this.cart();

    if (!currentCart) return [];

    if (this.isLoggedIn()) {
      const userWishlist = currentCart as ICartResponse;
      return userWishlist.data ?? [];
    } else {
      return Array.isArray(currentCart) ? currentCart : [];
    }
  });

  products = computed(() => {
    const currentWishlist = this.wishlist();

    if (!currentWishlist) return [];

    if (this.isLoggedIn()) {
      const userWishlist = currentWishlist as IWishlistResponse;
      return userWishlist.data ?? [];
    } else {
      return Array.isArray(currentWishlist) ? currentWishlist : [];
    }
  });

  ngOnInit(): void {
    this.getCart();
    this.initWishlist();
  }

  initWishlist(): void {
    if (this.isLoggedIn()) {
      this.loadWishList();
    } else {
      this.loadWishlistAsGuest();
    }
  }

  loadWishlistAsGuest(): void {
    const guestWishlist = this.wishlistService.getGuestWishlist();
    this.wishlist.set(guestWishlist);
    this.isWishlistLoading.set(false);
  }

  loadWishList(): void {
    this.wishlistService
      .getCurrentWishlist()
      .pipe(finalize(() => this.isWishlistLoading.set(false)))
      .subscribe({
        next: (wishlistData) => {
          this.wishlist.set(wishlistData);
        },
      });
  }

  updateWishlist(productId: string): void {
    this.wishlist.update((current) => {
      if (!current) return current;

      if (Array.isArray(current)) {
        return current.filter((p) => p._id !== productId);
      }

      return {
        ...current,
        data: current.data?.filter((p) => p._id !== productId) ?? [],
      };
    });
    this.wishlistService.wishlistCount.set(this.products().length);
  }

  getCart(): void {
    if (this.isLoggedIn()) {
      this.getCartAsUser();
    } else {
      const currentGuestCart = this.cartService.getGuestCart();
      this.cart.set(currentGuestCart);
      this.productsAlreadyInCartSet.set(new Set(currentGuestCart.map((p) => p.productId)));
    }
  }
  getCartAsUser(): void {
    this.cartService.getCurrentUserCart().subscribe({
      next: (response) => {
        this.cart.set(response);
        this.productsAlreadyInCartSet.set(
          new Set(response.data.products.map((p) => p.product._id)),
        );
      },
    });
  }
}
