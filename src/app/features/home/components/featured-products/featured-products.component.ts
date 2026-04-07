import { WishlistService } from './../../../../core/services/wishlist.service';
import { Component, inject, OnInit, signal } from '@angular/core';
import { SectionHeaderComponent } from '../../../../shared/components/section-header/section-header.component';
import { ProductService } from '../../../../core/services/product.service';
import { IProduct } from '../../../../core/models/products/product.model';
import { ProductCardComponent } from '../../../../shared/components/product-card/product-card.component';
import { AuthService } from '../../../../core/services/auth.service';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
  selector: 'app-featured-products',
  imports: [SectionHeaderComponent, ProductCardComponent, TranslatePipe],
  templateUrl: './featured-products.component.html',
  styleUrl: './featured-products.component.css',
})
export class FeaturedProductsComponent implements OnInit {
  private readonly productService: ProductService = inject(ProductService);
  private readonly wishlistService = inject(WishlistService);
  private readonly authService = inject(AuthService);
  products = signal<IProduct[]>([]);
  isLoggedIn = this.authService.isLoggedIn;
  InWishListSet = signal<Set<string>>(new Set());

  ngOnInit(): void {
    this.loadProducts();
    this.loadWishlist();
  }

  loadProducts(): void {
    this.productService.getProducts().subscribe({
      next: (response) => {
        this.products.set(response.data);
      },
      error: (error) => {
        console.error('Error fetching products:', error);
      },
    });
  }

  loadWishlist(): void {
    this.isLoggedIn() ? this.loadWishListAsUser() : this.loadWishListAsGuest();
  }

  loadWishListAsUser(): void {
    this.wishlistService.getCurrentWishlist().subscribe({
      next: (response) => {
        this.setWishlistState(response.data);
      },
    });
  }

  loadWishListAsGuest(): void {
    const wishlist = this.wishlistService.getGuestWishlist() ?? [];
    this.setWishlistState(wishlist);
  }

  setWishlistState(products: IProduct[]): void {
    const productsIds = products.map((p) => p._id);
    this.InWishListSet.set(new Set(productsIds));
    this.wishlistService.wishlistCount.set(products.length);
  }
}
