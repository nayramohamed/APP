import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import { ToastrService } from 'ngx-toastr';
import { finalize } from 'rxjs';
import Swal from 'sweetalert2';
import { ICartProductGuest } from '../../core/models/cart/cart-product-guest.model';
import { ICartProduct } from '../../core/models/cart/cart-product-model';
import { ICartResponse } from '../../core/models/cart/cart-response-model';
import { CartService } from '../../core/services/cart.service';
import { FeaturesSectionComponent } from '../../shared/components/features-section/features-section.component';
import { IconComponent } from '../../shared/components/icon/icon.component';
import { ItemsLoaderComponent } from '../../shared/components/items-loader/items-loader.component';
import { AuthService } from './../../core/services/auth.service';
import { CartProductCardComponent } from './components/cart-product-card/cart-product-card.component';
import { EmptyCartComponent } from './components/empty-cart/empty-cart.component';

@Component({
  selector: 'app-cart',
  imports: [
    RouterLink,
    IconComponent,
    FeaturesSectionComponent,
    CartProductCardComponent,
    EmptyCartComponent,
    ItemsLoaderComponent,
    TranslatePipe,
    FormsModule
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

  promoCodeInput: string = '';
  discountApplied = signal<boolean>(false);
  promoCodeError = signal<string>('');
  originalSubtotal = signal<number>(0);
  discountAmount = signal<number>(0);

  discountedSubtotal = computed(() => {
    if (this.discountApplied()) {
      return this.originalSubtotal() - this.discountAmount();
    }
    return this.subtotalPrice();
  });

  finalTotal = computed(() => {
    let total = this.discountedSubtotal();
    
    const shipping = this.cartService.getShippingPrice(this.discountedSubtotal());
    total += shipping;
    
    return Math.round(total);
  });

  applyPromoCode(): void {
    const regex = /^[A-Za-z]{2}[0-9]$/;
    
    if (!this.promoCodeInput || !regex.test(this.promoCodeInput)) {
      this.promoCodeError.set('Invalid code! Use 2 letters + 1 number (e.g. SA5)');
      return;
    }
    
    const subtotal = this.subtotalPrice();
    this.originalSubtotal.set(subtotal);
    const discount = subtotal * 0.15;
    this.discountAmount.set(Math.round(discount));
    this.discountApplied.set(true);
    this.promoCodeError.set('');
    
    this.toastrService.success('15% discount applied successfully!');
  }

  removePromoCode(): void {
    this.discountApplied.set(false);
    this.discountAmount.set(0);
    this.originalSubtotal.set(0);
    this.promoCodeInput = '';
    this.promoCodeError.set('');
    
    this.toastrService.info('Promo code removed');
  }

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
        this.removePromoCode();
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
    this.removePromoCode();
  }

  onRemoveProduct(cart: ICartResponse | ICartProductGuest[]): void {
    this.cart.set(cart);
    this.removePromoCode();
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
    
    this.removePromoCode();
  }
}