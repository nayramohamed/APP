import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '../../../environments/environment.development';
import { map, Observable } from 'rxjs';
import { IProductsResponse } from '../models/products/products-response.model';
import { IProduct } from '../models/products/product.model';
import { IProductResponse } from '../models/products/product-response.model';

@Injectable({
  providedIn: 'root',
})
export class ProductService {
  private readonly httpClient: HttpClient = inject(HttpClient);
  private readonly baseUrl = environment.baseUrl;

  getProducts(params?: any): Observable<IProductsResponse> {
    return this.httpClient.get<IProductsResponse>(`${this.baseUrl}/v1/products`, {
      params,
    });
  }

  getProductById(productId: string): Observable<IProduct> {
    return this.httpClient.get<IProductResponse>(`${this.baseUrl}/v1/products/${productId}`).pipe(
      map((response: IProductResponse) => {
        return response.data;
      }),
    );
  }
}
