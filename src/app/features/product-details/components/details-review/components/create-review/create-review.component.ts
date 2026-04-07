import { Component, computed, inject, input, output, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ReviewService } from '../../../../../../core/services/review.service';
import { ToastrService } from 'ngx-toastr';
import { IReview } from '../../../../../../core/models/reviews/review.model';
import { finalize } from 'rxjs';
import { AuthService } from '../../../../../../core/services/auth.service';
import { toSignal } from '@angular/core/rxjs-interop';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
  selector: 'app-create-review',
  imports: [ReactiveFormsModule, TranslatePipe],
  templateUrl: './create-review.component.html',
  styleUrl: './create-review.component.css',
})
export class CreateReviewComponent {
  private readonly fb = inject(FormBuilder);
  private readonly reviewService = inject(ReviewService);
  private readonly toastrService = inject(ToastrService);
  private readonly authService = inject(AuthService);

  stars = [1, 2, 3, 4, 5];
  productId = input('');
  updateReview = output<IReview>();

  hovered = signal(0);
  selectedRating = signal(0);
  isSubmitting = signal(false);
  currentUser = toSignal(this.authService.currentUser$);
  reviewForm = this.fb.group({
    rating: [0, [Validators.required, Validators.min(1)]],
    review: ['', [Validators.required, Validators.minLength(3)]],
  });

  updateRating(star: number): void {
    this.selectedRating.set(star);
    this.reviewForm.patchValue({ rating: star });
  }

  onSubmit(): void {
    if (this.reviewForm.invalid) return;
    const productId = this.productId() ?? '';
    this.isSubmitting.set(true);
    this.reviewService
      .addReview(productId, this.reviewForm.value)
      .pipe(finalize(() => this.isSubmitting.set(false)))
      .subscribe({
        next: (response) => {
          const user = this.currentUser();
          if (!user) return;
          const newReview = response.data;

          const review: IReview = {
            _id: newReview._id,
            review: newReview.review,
            rating: Number(newReview.rating),
            product: newReview.product,
            user: {
              _id: user._id,
              name: user.name,
            },
            createdAt: newReview.createdAt,
            updatedAt: newReview.updatedAt,
          };

          this.toastrService.success('Review added successfully!');
          this.updateReview.emit(review);
        },
      });
  }
}
