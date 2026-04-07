import { Component, inject, input, model, output, signal } from '@angular/core';
import { IProduct } from '../../../../core/models/products/product.model';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../../../core/services/auth.service';
import { CartService } from '../../../../core/services/cart.service';
import { finalize } from 'rxjs';
import { ICartProductGuest } from '../../../../core/models/cart/cart-product-guest.model';
import { WishlistService } from '../../../../core/services/wishlist.service';
import Swal from 'sweetalert2';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
  selector: 'app-wishlist-card',
  imports: [RouterLink, TranslatePipe],
  templateUrl: './wishlist-card.component.html',
  styleUrl: './wishlist-card.component.css',
})
export class WishlistCardComponent {
  private readonly wishlistService = inject(WishlistService);
  private readonly authService = inject(AuthService);
  private readonly cartService = inject(CartService);

  cartProducts = input();
  product = input<IProduct>();
  updateWishlist = output<string>();
  isProductInCart = model<boolean>();
  isLoggedIn = this.authService.isLoggedIn;
  isLoading = signal(false);

  addToCart() {
    this.isLoggedIn() ? this.addToCartAsUser() : this.addToCartAsGuest();
  }

  addToCartAsUser() {
    const productId = this.product()?._id;
    if (!productId) return;
    this.isLoading.set(true);
    this.cartService
      .addToCart(productId)
      .pipe(finalize(() => this.isLoading.set(false)))
      .subscribe({
        next: (res) => {
          this.updateCartState(res.numOfCartItems);
          this.isProductInCart.set(true);
        },
        error: (err) => console.error(err),
      });
  }

  addToCartAsGuest() {
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
        this.isProductInCart.set(true);
      }

      this.cartService.setGuestCart(currentCart);
      this.updateCartState(this.cartService.getCachedCartItemsCount(currentCart));
    }
  }

  private updateCartState(count: number) {
    this.cartService.cartCount.set(count);
  }

  removeFromWishlist(): void {
    this.isLoggedIn() ? this.removeFromWishlistAsUser() : this.removeFromWishlistAsGuest();
  }
  removeFromWishlistAsUser(): void {
    const product = this.product()?._id;
    if (!product) return;
    this.isLoading.set(true);
    this.wishlistService
      .removeFromWishlist(this.product()?._id!)
      .pipe(finalize(() => this.isLoading.set(false)))
      .subscribe({
        next: (response) => {
          this.onUpdateWishlist();
        },
      });
  }

  removeFromWishlistAsGuest(): void {
    let currentWishlist = this.wishlistService.getGuestWishlist();
    currentWishlist = currentWishlist.filter((p) => p._id != this.product()?._id);
    this.wishlistService.setGuestWithlist(currentWishlist);
    this.onUpdateWishlist();
  }

  onUpdateWishlist() {
    this.updateWishlist.emit(this.product()?._id!);
  }

  showRemoveDialog() {
    Swal.fire({
      icon: 'warning',
      title: 'Remove Item?',
      text: `Remove ${this.product()?.title} from your wishlist?`,
      showCancelButton: true,
      cancelButtonText: 'Cancel',
      confirmButtonText: 'Remove',

      buttonsStyling: false,

      customClass: {
        icon: 'text-xs',
        popup: 'rounded-2xl p-6',
        title: 'text-sm font-bold text-gray-800',
        htmlContainer: 'text-gray-500',
        confirmButton:
          'bg-red-500 hover:bg-red-600 text-white px-5 py-2 rounded-lg font-semibold cursor-pointer order-2',
        cancelButton: 'bg-gray-200 text-gray-700 px-5 py-2 rounded-lg mr-2 cursor-pointer',
      },
    }).then((result) => {
      if (result.isConfirmed) this.removeFromWishlist();
    });
  }
}
