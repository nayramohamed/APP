import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '../../../environments/environment.development';
import { map, Observable } from 'rxjs';
import { ISubcategory } from '../models/subcategories/subcategory.model';
import { ISubcategoriesResponse } from '../models/subcategories/subcategories-response.model';
import { ISubcategoryResponse } from '../models/subcategories/subcategory-response.model';

@Injectable({
  providedIn: 'root',
})
export class SubCategoryService {
  private readonly httpClient: HttpClient = inject(HttpClient);
  private readonly baseUrl = environment.baseUrl;

  getSubcategories(): Observable<ISubcategory[]> {
    return this.httpClient.get<ISubcategoriesResponse>(`${this.baseUrl}/v1/subcategories`).pipe(
      map((response: ISubcategoriesResponse) => {
        return response.data;
      }),
    );
  }

  getSubcategoriesById(subcategoryId: string): Observable<ISubcategory> {
    return this.httpClient
      .get<ISubcategoryResponse>(`${this.baseUrl}/v1/subcategories/${subcategoryId}`)
      .pipe(
        map((response: ISubcategoryResponse) => {
          return response.data;
        }),
      );
  }
}
