import { AuthService } from './../../core/services/auth.service';
import { Component, computed, effect, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { IconComponent } from '../../shared/components/icon/icon.component';
import { CartService } from '../../core/services/cart.service';
import { ICartResponse } from '../../core/models/cart/cart-response-model';
import { FeaturesSectionComponent } from '../../shared/components/features-section/features-section.component';
import { CartProductCardComponent } from './components/cart-product-card/cart-product-card.component';
import { EmptyCartComponent } from './components/empty-cart/empty-cart.component';
import Swal from 'sweetalert2';
import { ICartProductGuest } from '../../core/models/cart/cart-product-guest.model';
import { ToastrService } from 'ngx-toastr';
import { ItemsLoaderComponent } from '../../shared/components/items-loader/items-loader.component';
import { finalize } from 'rxjs';
import { ICartProduct } from '../../core/models/cart/cart-product-model';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
  selector: 'app-cart',
  imports: [
    RouterLink,
    IconComponent,
    FeaturesSectionComponent,
    CartProductCardComponent,
    EmptyCartComponent,
    ItemsLoaderComponent,
    TranslatePipe
  ],
  templateUrl: './cart.component.html',
  styleUrl: './cart.component.css',
})
export class CartComponent {
  private readonly cartService = inject(CartService);
  private readonly authService = inject(AuthService);
  private readonly toastrService = inject(ToastrService);

  cart = signal<ICartResponse | ICartProductGuest[] | null>(null);
  isLoggedIn = this.authService.isLoggedIn;
  numOfCartItems = computed(() => {
    return this.cartService.cartCount();
  });
  subtotalPrice = computed(() => {
    const cart = this.cart();
    if (!cart) return 0;

    return this.cartService.getCartTotal(cart);
  });
  shippingPrice = computed(() => {
    const total = this.subtotalPrice();
    return this.cartService.getShippingPrice(total);
  });
  freeShippingProgress = computed(() => {
    return (this.subtotalPrice() / 500) * 100;
  });

  estimatedTotal = computed(() => {
    return this.subtotalPrice() + this.shippingPrice();
  });

  isCartLoading = signal(true);

  products = computed(() => {
    const cart = this.cart();

    if (!cart) return [];

    if (this.isLoggedIn()) {
      const userCart = cart as ICartResponse;
      return userCart.data?.products ?? [];
    } else {
      return Array.isArray(cart) ? cart : [];
    }
  });

  ngOnInit(): void {
    if (this.isLoggedIn()) {
      this.getCart();
    } else {
      this.cart.set(this.cartService.getGuestCart());
      const guestCart = this.cart() as ICartProductGuest[];
      this.cartService.cartCount.set(this.cartService.getCachedCartItemsCount(guestCart));
      this.isCartLoading.set(false);
    }
  }



  getCart(): void {
    this.cartService
      .getCurrentUserCart()
      .pipe(finalize(() => this.isCartLoading.set(false)))
      .subscribe({
        next: (response) => {
          this.cart.set(response);
          this.cartService.cartCount.set(response.numOfCartItems);
        },
        error: (error) => {
          console.error('Error fetching cart items:', error);
        },
      });
  }

  clearCart(): void {
    if (this.isLoggedIn()) {
      this.clearUserCart();
    } else {
      this.clearGuestCart();
    }
  }

  clearUserCart(): void {
    this.cartService.clearCart().subscribe({
      next: (response) => {
        this.cart.set([]);
        this.cartService.cartCount.set(response.numOfCartItems);
        this.toastrService.info('Cart has been cleared!');
      },
      error: (error) => {
        console.error('Error clearing cart:', error);
      },
    });
  }

  clearGuestCart(): void {
    this.cartService.setGuestCart([]);
    this.cart.set([]);
    this.cartService.cartCount.set(0);
  }

  onRemoveProduct(cart: ICartResponse | ICartProductGuest[]): void {
    this.cart.set(cart);
  }

  clearCartDialog() {
    Swal.fire({
      title: 'Clear Your Cart?',
      text: 'All items will be removed from your cart. This action cannot be undone.',
      icon: 'warning',

      showCancelButton: true,
      confirmButtonText: 'Yes, Clear All',
      cancelButtonText: 'Keep Shopping',

      buttonsStyling: false,

      customClass: {
        popup: 'rounded-2xl p-6',
        title: 'text-2xl font-bold text-gray-800',
        htmlContainer: 'text-gray-500 text-sm mt-2',

        confirmButton:
          'bg-red-500 hover:bg-red-600 text-white font-semibold px-6 py-3 rounded-xl shadow-lg transition order-2',

        cancelButton:
          'bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium px-6 py-3 rounded-xl mr-3 transition',

        actions: 'flex justify-center gap-3 mt-6',
      },
    }).then((result) => {
      if (result.isConfirmed) {
        this.clearCart();
      }
    });
  }

  updateProduct(product: ICartProduct | ICartProductGuest): void {
    if (this.isLoggedIn()) {
      const userCart = this.cart() as ICartResponse;
      const updatedProduct = product as ICartProduct;

      const updatedProducts = userCart.data.products.map((p) =>
        p._id === updatedProduct._id ? updatedProduct : p,
      );

      const totalCartPrice = updatedProducts.reduce((acc, p) => acc + p.price * p.count, 0);

      this.cart.set({
        ...userCart,
        data: {
          ...userCart.data,
          products: updatedProducts,
          totalCartPrice,
        },
      });
    } else {
      const guestCart = this.cart() as ICartProductGuest[];
      const updatedProduct = product as ICartProductGuest;

      const updatedCart = guestCart.map((p) =>
        p.productId === updatedProduct.productId ? updatedProduct : p,
      );

      this.cart.set(updatedCart);
    }
  }
}
