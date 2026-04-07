import { inject, Injectable, signal } from '@angular/core';
import { IProduct } from '../models/products/product.model';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment.development';
import { Observable } from 'rxjs';
import { ICartResponse } from '../models/cart/cart-response-model';
import { StorageService } from './storage.service';
import { ICartProduct } from '../models/cart/cart-product-model';
import { ICartProductGuest } from '../models/cart/cart-product-guest.model';

@Injectable({
  providedIn: 'root',
})
export class CartService {
  private readonly httpClient: HttpClient = inject(HttpClient);
  private readonly storageService = inject(StorageService);
  private readonly baseURL = environment.baseUrl;
  cartCount = signal(0);

  constructor() {
    const currentCart = this.getGuestCart();
    this.cartCount.set(this.getCachedCartItemsCount(currentCart));
  }

  getCurrentUserCart(): Observable<ICartResponse> {
    return this.httpClient.get<ICartResponse>(`${this.baseURL}/v2/cart`);
  }

  addToCart(productId: string): Observable<ICartResponse> {
    return this.httpClient.post<ICartResponse>(`${this.baseURL}/v2/cart`, { productId });
  }

  applyCoupon(couponName: string): Observable<any> {
    return this.httpClient.put(`${this.baseURL}/v2/cart/applyCoupon`, { couponName });
  }

  removeFromCart(productId: string): Observable<ICartResponse> {
    return this.httpClient.delete<ICartResponse>(`${this.baseURL}/v2/cart/${productId}`);
  }

  clearCart(): Observable<ICartResponse> {
    return this.httpClient.delete<ICartResponse>(`${this.baseURL}/v2/cart`);
  }

  updateCartItemQuantity(productId: string, count: number): Observable<ICartResponse> {
    return this.httpClient.put<ICartResponse>(`${this.baseURL}/v2/cart/${productId}`, { count });
  }

  setGuestCart(products: ICartProductGuest[]): void {
    this.storageService.setItem('guestCart', JSON.stringify(products));
  }

  getGuestCart(): ICartProductGuest[] {
    const cart = this.storageService.getItem('guestCart');
    return cart ? JSON.parse(cart) : [];
  }

  setCachedCartQuantity() {
    const currentCart = this.getGuestCart();
    const currentQuantity = this.getCachedCartItemsCount(currentCart);
    this.cartCount.set(currentQuantity);
  }

  getCachedCartItemsCount(currentCart: ICartProductGuest[]): number {
    const currentCount = currentCart.reduce<number>((total, product) => {
      return total + (product.count ?? 0);
    }, 0);

    return currentCount;
  }

  getCartTotal(cart: any): number {
    if (Array.isArray(cart)) {
      return cart.reduce((acc, p) => acc + p.price * p.count, 0);
    }

    return cart?.data?.totalCartPrice ?? 0;
  }

  getShippingPrice(total: number): number {
    return total >= 500 ? 50 : 0;
  }
}
