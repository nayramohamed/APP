import { HttpClient } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { environment } from '../../../environments/environment.development';
import { Observable } from 'rxjs';
import { IWishlistResponse } from '../models/wishlist/wishlist-response.model';
import { StorageService } from './storage.service';
import { IProduct } from '../models/products/product.model';

@Injectable({
  providedIn: 'root',
})
export class WishlistService {
  private readonly httpClient: HttpClient = inject(HttpClient);
  private readonly baseUrl = environment.baseUrl;
  private readonly storageService = inject(StorageService);
  wishlistCount = signal(0);

  getCurrentWishlist(): Observable<IWishlistResponse> {
    return this.httpClient.get<IWishlistResponse>(`${this.baseUrl}/v1/wishlist`);
  }

  addToWishlist(productId: string): Observable<any> {
    return this.httpClient.post(`${this.baseUrl}/v1/wishlist`, { productId });
  }

  removeFromWishlist(productId: string): Observable<any> {
    return this.httpClient.delete(`${this.baseUrl}/v1/wishlist/${productId}`);
  }

  setGuestWithlist(products: IProduct[]): void {
    this.storageService.setItem('guestWishlist', JSON.stringify(products));
  }

  getGuestWishlist(): IProduct[] {
    const wishlist = this.storageService.getItem('guestWishlist');
    return wishlist ? JSON.parse(wishlist) : [];
  }

  setCachedWishlistQuantity() {
    const currentWishlist = this.getGuestWishlist();
    const currentQuantity = currentWishlist.length;
    this.wishlistCount.set(currentQuantity);
  }
}
