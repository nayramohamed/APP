import { Observable } from 'rxjs';
import { inject, Injectable } from '@angular/core';
import { environment } from '../../../environments/environment.development';
import { HttpClient } from '@angular/common/http';
import { IOrder } from '../models/orders/order.model';

@Injectable({
  providedIn: 'root',
})
export class OrderService {
  private readonly httpClient: HttpClient = inject(HttpClient);
  private readonly baseURL = environment.baseUrl;

  getUserOrders(userId: string): Observable<IOrder[]> {
    return this.httpClient.get<IOrder[]>(`${this.baseURL}/v1/orders/user/${userId}`);
  }

  createCashOrder(cartId: string, shippingAddress: any): Observable<any> {
    return this.httpClient.post(`${this.baseURL}/v2/orders/${cartId}`, shippingAddress);
  }

  createCheckoutSession(cartId: string, shippingAddress: any): Observable<any> {
    const origin = window.location.origin;
    return this.httpClient.post(
      `${this.baseURL}/v1/orders/checkout-session/${cartId}`,
      {
        shippingAddress,
      },
      { params: { url: origin } },
    );
  }
}
