import { inject, Injectable } from '@angular/core';
import { IBrand } from '../models/brands/brand.model';
import { IBrandsResponse } from '../models/brands/brands-response.model';
import { environment } from '../../../environments/environment.development';
import { HttpClient } from '@angular/common/http';
import { map, Observable } from 'rxjs';
import { IBrandResponse } from '../models/brands/brand-response.model';

@Injectable({
  providedIn: 'root',
})
export class BrandService {
  private readonly httpClient = inject(HttpClient);
  private readonly baseUrl = environment.baseUrl;

  getBrands(params: any): Observable<IBrandsResponse> {
    return this.httpClient.get<IBrandsResponse>(`${this.baseUrl}/v1/brands`, { params });
  }

  getBrandById(brandId: string): Observable<IBrand> {
    return this.httpClient.get<IBrandResponse>(`${this.baseUrl}/v1/brands/${brandId}`).pipe(
      map((response: IBrandResponse) => {
        return response.data;
      }),
    );
  }
}
