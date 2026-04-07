import { Component, computed, inject, input, output, signal } from '@angular/core';
import { IReview } from '../../../../../../core/models/reviews/review.model';
import { DatePipe } from '@angular/common';
import { toSignal } from '@angular/core/rxjs-interop';
import { AuthService } from '../../../../../../core/services/auth.service';
import { ReviewService } from '../../../../../../core/services/review.service';
import { finalize } from 'rxjs';
import { ToastrService } from 'ngx-toastr';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
  selector: 'app-review-card',
  imports: [DatePipe, TranslatePipe],
  templateUrl: './review-card.component.html',
  styleUrl: './review-card.component.css',
})
export class ReviewCardComponent {
  private readonly authService = inject(AuthService);
  private readonly reviewService = inject(ReviewService);
  private readonly toastrService = inject(ToastrService);
  review = input.required<IReview>();
  updateReview = output<string>();

  stars = [1, 2, 3, 4, 5];
  currentUser = toSignal(this.authService.currentUser$);
  isDeleting = signal(false);

  isReviewOwner = computed(() => {
    const user = this.currentUser();
    const review = this.review();

    if (!user) return false;

    return review?.user?._id === user._id;
  });

  getFirstLetters(name: string | undefined): string {
    const checkedName = name ?? '';
    return checkedName
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  }

  deleteReview(): void {
    const reviewId = this.review()._id;
    this.isDeleting.set(true);
    this.reviewService
      .deleteReview(reviewId)
      .pipe(finalize(() => this.isDeleting.set(false)))
      .subscribe({
        next: () => {
          this.updateReview.emit(reviewId);
          this.toastrService.success('Review deleted successfully!');
        },
      });
  }
}
