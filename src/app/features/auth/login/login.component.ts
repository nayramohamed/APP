import { Component, computed, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FeaturesSectionComponent } from '../../../shared/components/features-section/features-section.component';
import { IconComponent } from '../../../shared/components/icon/icon.component';
import { FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { AuthService } from '../../../core/services/auth.service';
import { ILoginFormData } from '../../../core/models/auth/login-form-data..model';
import { finalize, forkJoin, of, switchMap } from 'rxjs';
import { SubmitBtnComponent } from '../../../shared/components/submit-btn/submit-btn.component';
import { CartService } from '../../../core/services/cart.service';
import { toSignal } from '@angular/core/rxjs-interop';
import { WishlistService } from '../../../core/services/wishlist.service';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
  selector: 'app-login',
  imports: [
    RouterLink,
    FeaturesSectionComponent,
    IconComponent,
    ReactiveFormsModule,
    SubmitBtnComponent,
    TranslatePipe,
  ],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css',
})
export class LoginComponent {
  private readonly fb: FormBuilder = inject(FormBuilder);
  private readonly authService: AuthService = inject(AuthService);
  private readonly toastrService: ToastrService = inject(ToastrService);
  private readonly router: Router = inject(Router);
  private readonly cartService: CartService = inject(CartService);
  private readonly wishlistService: WishlistService = inject(WishlistService);

  isPasswordShown = signal(false);
  isSubmittingForm = signal(false);
  isSubmittedOnce = signal(false);

  loginForm = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(8)]],
    rememberMe: [false, [Validators.required]],
  });

  showPassword(): void {
    this.isPasswordShown.update((prev) => !prev);
  }

  onSubmit(): void {
    this.isSubmittedOnce.set(true);
    if (this.loginForm.valid) {
      this.isSubmittingForm.set(true);

      const loginFormData: ILoginFormData = {
        email: this.loginForm.get('email')?.value || '',
        password: this.loginForm.get('password')?.value || '',
        rememberMe: this.loginForm.get('rememberMe')?.value || false,
      };

      this.authService
        .login(loginFormData)
        .pipe(finalize(() => this.isSubmittingForm.set(false)))
        .subscribe({
          next: () => {
            this.toastrService.success('Login successful');
            this.updateUserCartQuantity();
            this.updateCartByCachedProducts();
            this.updateWishlistByCachedProducts();
            setTimeout(() => {
              this.router.navigate(['/home']);
            }, 2000);
          },
          error: () => {
            this.toastrService.error('Incorrect email or password');
          },
        });
    }
  }

  updateUserCartQuantity(): void {
    if (this.authService.isLoggedIn()) {
      this.cartService.getCurrentUserCart().subscribe({
        next: (response) => {
          this.cartService.cartCount.set(response.numOfCartItems);
        },
      });
    }
  }
  updateCartByCachedProducts(): void {
    if (!this.authService.isLoggedIn()) return;

    const cachedCart = this.cartService.getGuestCart();
    if (!cachedCart?.length) return;

    this.cartService
      .getCurrentUserCart()
      .pipe(
        switchMap((response) => {
          const serverProducts = response.data.products;

          const requests = cachedCart.map((product) => {
            const existing = serverProducts.find((p) => p.product._id === product.productId);

            if (existing) {
              const currentQuantity = existing.count + product.count;
              return this.cartService.updateCartItemQuantity(product.productId, currentQuantity);
            }

            return this.cartService
              .addToCart(product.productId)
              .pipe(
                switchMap(() =>
                  this.cartService.updateCartItemQuantity(product.productId, product.count),
                ),
              );
          });

          return forkJoin(requests);
        }),
      )
      .subscribe({
        next: (response) => {
          this.toastrService.info('Your cart items have been saved!');
          this.cartService.setGuestCart([]);
          const currentQuantity = response[response.length - 1].numOfCartItems;
          this.cartService.cartCount.set(currentQuantity);
        },
        error: (err) => {
          console.error(err);
        },
      });
  }

  updateWishlistByCachedProducts(): void {
    if (!this.authService.isLoggedIn()) return;

    const cachedWishlist = this.wishlistService.getGuestWishlist() ?? [];
    if (!cachedWishlist?.length) return;

    this.wishlistService
      .getCurrentWishlist()
      .pipe(
        switchMap((response) => {
          const serverProducts = response.data;

          const requests = cachedWishlist
            .filter((product) => !serverProducts.some((p) => p._id === product._id))
            .map((product) => this.wishlistService.addToWishlist(product._id));

          return requests.length > 0 ? forkJoin(requests) : of([]);
        }),
      )
      .subscribe({
        next: (response) => {
          this.toastrService.info('Your wishlist items have been saved!');
          this.wishlistService.setGuestWithlist([]);
          const currentQuantity = response[response.length - 1].data.length;
          this.wishlistService.wishlistCount.set(currentQuantity);
        },
        error: (err) => {
          console.error(err);
        },
      });
  }
}
