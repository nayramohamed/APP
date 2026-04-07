import { IShippingAddress } from './../../core/models/orders/shipping-address.model';
import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { FeaturesSectionComponent } from '../../shared/components/features-section/features-section.component';
import { Router, RouterLink } from '@angular/router';
import { OrderService } from '../../core/services/order.service';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { CartService } from '../../core/services/cart.service';
import { AddressService } from '../../core/services/address.service';
import { IAddress } from '../../core/models/addresses/address.model';
import { finalize, forkJoin, Observable } from 'rxjs';
import { ICartResponse } from '../../core/models/cart/cart-response-model';
import { DecimalPipe } from '@angular/common';
import { AuthService } from '../../core/services/auth.service';
import { ToastrService } from 'ngx-toastr';
import { EGYPTIAN_PHONE_PATTERN } from '../../core/сonstants/validators.constant';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
  selector: 'app-checkout',
  imports: [FeaturesSectionComponent, RouterLink, ReactiveFormsModule, DecimalPipe, TranslatePipe],
  templateUrl: './checkout.component.html',
  styleUrl: './checkout.component.css',
})
export class CheckoutComponent implements OnInit {
  private readonly orderService = inject(OrderService);
  private readonly fb = inject(FormBuilder);
  private readonly cartService = inject(CartService);
  private readonly addressService = inject(AddressService);
  private readonly router = inject(Router);
  private readonly authSerivce = inject(AuthService);
  private readonly toastrService = inject(ToastrService);

  isCash = signal(true);
  addresses = signal<IAddress[]>([]);
  cart = signal<ICartResponse | null>(null);
  isCheckoutLoaded = signal(false);
  isSubmitting = signal(false);
  activatedAddress = signal('');
  isLoggedIn = this.authSerivce.isLoggedIn;
  subtotalPrice = computed(() => {
    const cart = this.cart();
    if (!cart) return 0;

    return this.cartService.getCartTotal(cart);
  });
  shippingPrice = computed(() => {
    const total = this.subtotalPrice();
    return this.cartService.getShippingPrice(total);
  });
  estimatedTotal = computed(() => {
    return this.subtotalPrice() + this.shippingPrice();
  });

  shippingAddressForm = this.fb.group({
    details: ['', [Validators.required, Validators.minLength(10)]],
    phone: ['', [Validators.required, Validators.pattern(EGYPTIAN_PHONE_PATTERN)]],
    city: ['', [Validators.required, Validators.minLength(2)]],
  });

  ngOnInit(): void {
    if (this.isLoggedIn()) {
      this.initCheckout();
    }
  }

  initCheckout(): void {
    forkJoin({
      cart: this.loadCart(),
      addresses: this.loadShippingAddresses(),
    })
      .pipe(
        finalize(() => {
          this.isCheckoutLoaded.set(true);
        }),
      )
      .subscribe(({ cart, addresses }) => {
        this.cart.set(cart);
        this.addresses.set(addresses);
      });
  }

  loadCart(): Observable<any> {
    return this.cartService.getCurrentUserCart();
  }

  loadShippingAddresses(): Observable<any> {
    return this.addressService.getAddresses();
  }

  onSubmit(): void {
    if (this.shippingAddressForm.valid) {
      const cartId = this.cart()?.cartId ?? '';
      const shippingAddress = this.shippingAddressForm.value;
      this.isCash()
        ? this.createCashOrder(cartId, shippingAddress)
        : this.createCheckoutSession(cartId, shippingAddress);
    } else {
      this.shippingAddressForm.markAllAsTouched();
    }
  }
  createCashOrder(cartId: string, shippingAddress: any): void {
    this.isSubmitting.set(true);
    this.orderService
      .createCashOrder(cartId, shippingAddress)
      .pipe(finalize(() => this.isSubmitting.set(false)))
      .subscribe({
        next: () => {
          this.toastrService.success('Order placed successfully!');
          this.router.navigate(['/orders']);
        },
      });
  }
  selectAddress(address: IAddress | null): void {
    const addressId = address?._id ?? '';
    this.activatedAddress.set(addressId);
    if (address) {
      this.shippingAddressForm.patchValue({
        phone: address.phone,
        city: address.city,
        details: address.details,
      });
    } else {
      this.shippingAddressForm.reset();
    }
  }

  createCheckoutSession(cartId: string, shippingAddress: any): void {
    this.isSubmitting.set(true);
    this.orderService
      .createCheckoutSession(cartId, shippingAddress)
      .pipe(finalize(() => this.isSubmitting.set(false)))
      .subscribe({
        next: (response) => {
    
          window.open(response.session.url, '_self');
        },
      });
  }
}
