import { MytranslateService } from './../../../core/services/my-translate.service';
import {
  Component,
  computed,
  ElementRef,
  inject,
  signal,
  ViewChild,
  OnInit,
  OnDestroy,
  HostListener,
} from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { CartService } from '../../../core/services/cart.service';
import { WishlistService } from '../../../core/services/wishlist.service';
import { IconComponent } from '../icon/icon.component';
import { Subscription } from 'rxjs';
import { FormsModule } from '@angular/forms';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
  selector: 'app-navbar',
  imports: [IconComponent, RouterLink, FormsModule, TranslatePipe],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.css',
})
export class NavbarComponent implements OnInit, OnDestroy {
  private readonly authService: AuthService = inject(AuthService);
  private readonly cartService: CartService = inject(CartService);
  private readonly wishlistService: WishlistService = inject(WishlistService);
  private readonly translateService: MytranslateService = inject(MytranslateService);
  private readonly router: Router = inject(Router);

  private subscriptions: Subscription = new Subscription();

  searchQuery = signal('');

  isMobileMenuOpen = signal(false);
  isCategoryMenuOpen = signal(false);
  isUserMenuOpen = signal(false);
  currentUser = this.authService.user;
  isLoggedIn = this.authService.isLoggedIn;
  currentLang = this.translateService.currentLang;
  cartCount = computed(() => {
    return this.cartService.cartCount();
  });
  wishlistCount = computed(() => {
    return this.wishlistService.wishlistCount();
  });
  flags = signal<Record<string, string>>({
    en: 'https://flagcdn.com/w40/gb.png',
    ar: 'https://flagcdn.com/w40/eg.png',
  });

  selectedFlag = computed(() => this.flags()[this.currentLang()]);

  @ViewChild('accountMenu') accountMenu!: ElementRef;
  constructor(private elementRef: ElementRef) {}

  ngOnInit(): void {
    this.loadCartCount();
    this.loadWishlistCount();
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  changeLang(lang: string): void {
    this.translateService.changeLang(lang);
    this.currentLang.set(lang);
  }

  onSearch() {
    const query = this.searchQuery();

    if (!query) return;

    this.router.navigate(['/search'], {
      queryParams: { q: query },
    });
  }

  private loadCartCount(): void {
    if (this.isLoggedIn()) {
      const cartSub = this.cartService.getCurrentUserCart().subscribe({
        next: (response) => {
          this.cartService.cartCount.set(response.numOfCartItems);
        },
        error: (error) => {
          console.error('Error loading cart count:', error);
          this.cartService.cartCount.set(0);
        },
      });
      this.subscriptions.add(cartSub);
    } else {
      this.cartService.setCachedCartQuantity();
    }
  }

  private loadWishlistCount(): void {
    if (this.isLoggedIn()) {
      const wishlistSub = this.wishlistService.getCurrentWishlist().subscribe({
        next: (response) => {
          this.wishlistService.wishlistCount.set(response.count);
        },
        error: (error) => {
          console.error('Error loading wishlist count:', error);
          this.wishlistService.wishlistCount.set(0);
        },
      });
      this.subscriptions.add(wishlistSub);
    } else {
      this.wishlistService.setCachedWishlistQuantity();
    }
  }

  toggleMobileMenu(): void {
    this.isMobileMenuOpen.update((state) => !state);
  }
  toggleCategoryMenu(state: boolean): void {
    this.isCategoryMenuOpen.set(state);
  }

  toggleUserMenu(state: boolean): void {
    this.isUserMenuOpen.set(state);
  }

  logout(): void {
    this.authService.logout();
    this.cartService.cartCount.set(0);
    this.wishlistService.wishlistCount.set(0);
    this.router.navigate(['/login']);
  }

  @HostListener('document:click', ['$event.target'])
  closeMenu(target: EventTarget | null): void {
    if (!target || !this.accountMenu) return;

    const clickedInside = this.accountMenu.nativeElement.contains(target as Node);

    if (this.isUserMenuOpen() && !clickedInside) {
      this.toggleUserMenu(false);
    }
  }
}
