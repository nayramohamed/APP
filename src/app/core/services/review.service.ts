import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment.development';
import { IReviewsResponse } from '../models/reviews/reviews-response.model';
import { IReview } from '../models/reviews/review.model';
import { AuthService } from './auth.service';
import { toSignal } from '@angular/core/rxjs-interop';

@Injectable({
  providedIn: 'root',
})
export class ReviewService {
  private readonly httpClient = inject(HttpClient);
  private readonly baseUrl = environment.baseUrl;
  private readonly authService = inject(AuthService);

  getReviewByProductId(productId: string): Observable<IReviewsResponse> {
    return this.httpClient.get<IReviewsResponse>(
      `${this.baseUrl}/v1/products/${productId}/reviews`,
    );
  }

  addReview(productId: string, body: any): Observable<any> {
    return this.httpClient.post(`${this.baseUrl}/v1/products/${productId}/reviews`, body);
  }

  updateReview(reviewId: string, body: any): Observable<any> {
    return this.httpClient.put(`${this.baseUrl}/v1/reviews/${reviewId}`, body);
  }

  deleteReview(reviewId: string): Observable<any> {
    return this.httpClient.delete(`${this.baseUrl}/v1/reviews/${reviewId}`);
  }
}
