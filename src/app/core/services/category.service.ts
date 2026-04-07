import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '../../../environments/environment.development';
import { map, Observable } from 'rxjs';
import { ICategoriesResponse } from '../models/categories/categories-response.model';
import { ICategoryResponse } from '../models/categories/category-response.model';
import { ICategory } from '../models/categories/category.model';

@Injectable({
  providedIn: 'root',
})
export class CategoryService {
  private readonly httpClient = inject(HttpClient);
  private readonly baseUrl = environment.baseUrl;

  getCategories(): Observable<ICategory[]> {
    return this.httpClient.get<ICategoriesResponse>(`${this.baseUrl}/v1/categories`).pipe(
      map((response: ICategoriesResponse) => {
        return response.data;
      }),
    );
  }

  getCategoryById(categoryId: string): Observable<ICategory> {
    return this.httpClient
      .get<ICategoryResponse>(`${this.baseUrl}/v1/categories/${categoryId}`)
      .pipe(
        map((response: ICategoryResponse) => {
          return response.data;
        }),
      );
  }
}
