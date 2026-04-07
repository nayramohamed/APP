import { ICartProductGuest } from './../../../core/models/cart/cart-product-guest.model';
import { CartService } from './../../../core/services/cart.service';
import { Component, computed, inject, input, model, signal } from '@angular/core';
import { IProduct } from '../../../core/models/products/product.model';
import { IconComponent } from '../icon/icon.component';
import { RouterLink } from '@angular/router';
import { WishlistService } from '../../../core/services/wishlist.service';
import { finalize } from 'rxjs';
import { AuthService } from '../../../core/services/auth.service';
import { toSignal } from '@angular/core/rxjs-interop';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-product-card',
  imports: [IconComponent, RouterLink],
  templateUrl: './product-card.component.html',
  styleUrl: './product-card.component.css',
})
export class ProductCardComponent {
  private readonly cartService = inject(CartService);
  private readonly wishlistService: WishlistService = inject(WishlistService);
  private readonly authService: AuthService = inject(AuthService);
  private readonly toastrService: ToastrService = inject(ToastrService);

  product = input<IProduct>();
  isAddingToCart = signal(false);
  isAddedToCart = signal(false);
  isAddedToWishlist = model.required<boolean>();
  isAddingToWishlist = signal(false);
  isLoggedIn = this.authService.isLoggedIn;
  discountPercentage = computed(() => {
    const currentPrice = Number(this.product()?.price);
    const priceAfterDiscount = Number(this.product()?.priceAfterDiscount);

    const ratio = currentPrice - priceAfterDiscount;
    const percentage = ratio / currentPrice;
    return (percentage * 100).toFixed(0);
  });


  addToWishlist(): void {
    this.isLoggedIn() ? this.toggleWishListAsUser() : this.toggleToWishlistAsGuest();
  }

  toggleWishListAsUser(): void {
    this.isAddedToWishlist() ? this.removeFromWishListAsUser() : this.addToWishlistAsUser();
  }

  addToWishlistAsUser(): void {
    const productId = this.product()?.id;
    this.isAddingToWishlist.set(true);
    this.wishlistService
      .addToWishlist(productId!)
      .pipe(finalize(() => this.isAddingToWishlist.set(false)))
      .subscribe({
        next: (response) => {
          this.isAddedToWishlist.set(true);
          this.updateWishlistState(response.data.length);
        },
        error: (error) => {
          console.error('Error adding product to wishlist:', error);
        },
      });
  }

  removeFromWishListAsUser(): void {
    const productId = this.product()?.id;
    this.isAddingToWishlist.set(true);
    this.wishlistService
      .removeFromWishlist(productId!)
      .pipe(finalize(() => this.isAddingToWishlist.set(false)))
      .subscribe({
        next: (response) => {
          this.isAddedToWishlist.set(false);
          this.updateWishlistState(response.data.length);
        },
      });
  }

  getStarType(star: number): 'full' | 'half' | 'empty' {
    const rating = this.product()?.ratingsAverage ?? 0;

    return rating >= star ? 'full' : rating >= star - 0.5 ? 'half' : 'empty';
  }
  toggleToWishlistAsGuest(): void {
    const product = this.product();
    if (!product?._id) return;

    let currentWishlist = this.wishlistService.getGuestWishlist() ?? [];

    if (currentWishlist) {
      const existProductIndex = currentWishlist.findIndex((p) => p._id === product._id);

      if (existProductIndex > -1) {
        currentWishlist.splice(existProductIndex, 1);
        this.isAddedToWishlist.set(false);
      } else {
        this.isAddedToWishlist.set(true);
        currentWishlist.push(this.product()!);
      }
      this.wishlistService.setGuestWithlist(currentWishlist);
      this.updateWishlistState(currentWishlist.length);
    }
  }

  updateWishlistState(quantity: number): void {
    this.wishlistService.wishlistCount.set(quantity);
  }

  addToCart(): void {
    this.isLoggedIn() ? this.addToCartAsUser() : this.addToCartAsGuest();
  }

  addToCartAsUser() {
    const productId = this.product()?._id;
    if (!productId) return;

    this.isAddingToCart.set(true);

    this.cartService
      .addToCart(productId)
      .pipe(finalize(() => this.isAddingToCart.set(false)))
      .subscribe({
        next: (res) => {
          this.updateCartState(res.numOfCartItems);
          this.showAddedFeedback();
        },
        error: (err) => console.error(err),
      });
  }

  addToCartAsGuest(): void {
    const product = this.product();
    if (!product?._id) return;

    let currentCart = this.cartService.getGuestCart() ?? [];

    if (currentCart) {
      const isExistProduct = currentCart.find((p) => p.productId === product._id);

      if (isExistProduct) {
        isExistProduct.count += 1;
      } else {
        const cartProduct: ICartProductGuest = {
          productId: this.product()?._id!,
          price: this.product()?.price!,
          count: 1,
          product: this.product()!,
        };

        currentCart.push(cartProduct);
      }
      this.cartService.setGuestCart(currentCart);
      this.updateCartState(this.cartService.getCachedCartItemsCount(currentCart));
      this.showAddedFeedback();
    }
  }

  private updateCartState(count: number) {
    this.cartService.cartCount.set(count);
  }

  private showAddedFeedback() {
    this.isAddedToCart.set(true);

    setTimeout(() => {
      this.isAddedToCart.set(false);
    }, 2000);
  }
}
