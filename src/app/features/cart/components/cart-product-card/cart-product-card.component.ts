import { Component, computed, inject, input, output, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ICartProduct } from '../../../../core/models/cart/cart-product-model';
import { ICartProductGuest } from '../../../../core/models/cart/cart-product-guest.model';
import { AuthService } from '../../../../core/services/auth.service';
import { toSignal } from '@angular/core/rxjs-interop';
import { CartService } from '../../../../core/services/cart.service';
import { debounceTime, finalize } from 'rxjs';
import Swal from 'sweetalert2';
import { error } from 'console';
import { ICartResponse } from '../../../../core/models/cart/cart-response-model';
import { DecimalPipe } from '@angular/common';

@Component({
  selector: 'app-cart-product-card',
  imports: [RouterLink],
  templateUrl: './cart-product-card.component.html',
  styleUrl: './cart-product-card.component.css',
})
export class CartProductCardComponent {
  private readonly authService: AuthService = inject(AuthService);
  private readonly cartService: CartService = inject(CartService);

  product = input<ICartProduct | ICartProductGuest>();
  removeProduct = output<ICartResponse | ICartProductGuest[]>();
  productChange = output<ICartProduct | ICartProductGuest>();

  totalPrice = computed(() => {
    return Number(this.product()?.count) * Number(this.product()?.price);
  });
  currentCount = computed(() => {
    return Number(this.product()?.count);
  });

  isUpdating = signal(false);
  isLoggedIn = this.authService.isLoggedIn;

  updateQuantity(count: number): void {
    const productCount = this.product()?.count ?? 0;
    if (productCount <= 1 && count === -1) {
      return;
    }
    this.isLoggedIn() ? this.updateQuantityUser(count) : this.updateQuantityGuest(count);
  }

  updateQuantityGuest(count: number): void {
    const currentCart = this.cartService.getGuestCart() ?? [];
    const productId = this.product()?.product._id;

    if (!productId) return;

    const index = currentCart.findIndex((p) => p.product._id === productId);
    if (index === -1) return;

    currentCart[index].count += count;

    this.cartService.setGuestCart(currentCart);
    this.cartService.cartCount.set(this.cartService.getCachedCartItemsCount(currentCart));
    this.productChange.emit(currentCart[index]);
  }

  updateQuantityUser(count: number): void {
    this.isUpdating.set(true);
    const productId = this.product()?.product._id;
    const updatedCount = (this.product()?.count ?? 0) + count;
    this.cartService
      .updateCartItemQuantity(productId!, updatedCount)
      .pipe(finalize(() => this.isUpdating.set(false)))
      .subscribe({
        next: (response) => {
          const currentProduct = this.product() as ICartProduct;
          const updatedProduct: ICartProduct = { ...currentProduct, count: updatedCount };
          this.productChange.emit(updatedProduct);
          this.cartService.cartCount.set(response.numOfCartItems);
        },
        error: () => {},
      });
  }

  removeFromCart(): void {
    this.isLoggedIn() ? this.removeFromCartUser() : this.removeFromCartGuest();
  }

  removeFromCartUser(): void {
    const productId = this.product()?.product._id;
    this.isUpdating.set(true);
    this.cartService
      .removeFromCart(productId!)
      .pipe(finalize(() => this.isUpdating.set(false)))
      .subscribe({
        next: (response) => {
          this.removeProduct.emit(response);
          this.cartService.cartCount.set(response.numOfCartItems);
        },
        error: (error) => {
          console.error('Error removing product from cart:', error);
        },
      });
  }

  removeFromCartGuest(): void {
    const productId = this.product()?.product._id;
    let currentCart = this.cartService.getGuestCart();
    if (currentCart) {
      currentCart = currentCart.filter((product) => product.product._id !== productId);
      this.cartService.setGuestCart(currentCart);
      const currentCount = this.cartService.getCachedCartItemsCount(currentCart);
      this.cartService.cartCount.set(currentCount);
      this.removeProduct.emit(currentCart);
    }
  }

  showRemoveDialog() {
    Swal.fire({
      icon: 'warning',
      title: 'Remove Item?',
      text: `Remove ${this.product()?.product.title} from your cart?`,
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
      if (result.isConfirmed) this.removeFromCart();
    });
  }
}
