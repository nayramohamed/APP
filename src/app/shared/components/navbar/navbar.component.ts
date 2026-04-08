import {
  Component,
  computed,
  ElementRef,
  HostListener,
  inject,
  OnDestroy,
  OnInit,
  signal,
  ViewChild,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import { ToastrService } from 'ngx-toastr';
import { Subscription } from 'rxjs';
import { AuthService } from '../../../core/services/auth.service';
import { CartService } from '../../../core/services/cart.service';
import { WishlistService } from '../../../core/services/wishlist.service';
import { IconComponent } from '../icon/icon.component';
import { MytranslateService } from './../../../core/services/my-translate.service';

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
  private readonly toastr: ToastrService = inject(ToastrService);

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
  @ViewChild('imageUploadInput') imageUploadInput!: ElementRef<HTMLInputElement>;
  
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

  triggerImageUpload(): void {
    this.imageUploadInput.nativeElement.click();
  }

  onImageSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    
    if (input.files && input.files.length > 0) {
      const file = input.files[0];
      
      if (!file.type.startsWith('image/')) {
        this.toastr.error('Please select an image file', 'Invalid File');
        return;
      }
      
      if (file.size > 5 * 1024 * 1024) {
        this.toastr.error('Image size should be less than 5MB', 'File Too Large');
        return;
      }
      
      this.toastr.success('Image uploaded successfully!', 'Success');
      
      console.log('Image selected:', file.name, 'Size:', file.size, 'Type:', file.type);
      
      const reader = new FileReader();
      reader.onload = () => {
        const base64Image = reader.result as string;
        console.log('Image converted to Base64 (preview only)');
      };
      reader.readAsDataURL(file);
      
      input.value = '';
    }
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