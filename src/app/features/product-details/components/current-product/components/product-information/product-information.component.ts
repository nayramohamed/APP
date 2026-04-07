import { Component, computed, inject, input, signal } from '@angular/core';
import { IProduct } from '../../../../../../core/models/products/product.model';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { CartService } from '../../../../../../core/services/cart.service';
import { WishlistService } from '../../../../../../core/services/wishlist.service';
import { AuthService } from '../../../../../../core/services/auth.service';
import { finalize } from 'rxjs';
import { ICartProductGuest } from '../../../../../../core/models/cart/cart-product-guest.model';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
  selector: 'app-product-information',
  imports: [FormsModule, RouterLink, TranslatePipe],
  templateUrl: './product-information.component.html',
  styleUrl: './product-information.component.css',
})
export class ProductInformationComponent {
  private readonly cartService: CartService = inject(CartService);
  private readonly wishlistService: WishlistService = inject(WishlistService);
  private readonly authService: AuthService = inject(AuthService);

  product = input<IProduct>();
  isAddingToCart = signal(false);
  isAddedToCart = signal(false);
  isAddedToWishlist = signal<boolean>(false);
  isAddingToWishlist = signal(false);
  isLoggedIn = this.authService.isLoggedIn;
  currentQuantity = signal<number>(1);
  reviewsCount = input<number>(0);
  totalPrice = computed(() => {
    const productPrice = this.product()?.priceAfterDiscount
      ? Number(this.product()?.priceAfterDiscount)
      : Number(this.product()?.price);
    const selectedQuantity = this.currentQuantity();
    return (productPrice * selectedQuantity).toFixed(2);
  });
  discountPercentage = computed(() => {
    const currentPrice = Number(this.product()?.price);
    const priceAfterDiscount = Number(this.product()?.priceAfterDiscount);

    const ratio = currentPrice - priceAfterDiscount;
    const percentage = ratio / currentPrice;
    return (percentage * 100).toFixed(0);
  });

  updateQuantity(change: number) {
    const next = this.currentQuantity() + change;

    if (next < 1) return;

    this.currentQuantity.set(next);
  }

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
        isExistProduct.count += this.currentQuantity();
      } else {
        const cartProduct: ICartProductGuest = {
          productId: this.product()?._id!,
          price: this.product()?.price!,
          count: this.currentQuantity(),
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
