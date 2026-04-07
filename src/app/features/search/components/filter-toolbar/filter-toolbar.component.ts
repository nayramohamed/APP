import { Component, inject, model, OnDestroy, output, signal } from '@angular/core';
import { toObservable } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import { distinctUntilChanged, Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-filter-toolbar',
  imports: [TranslatePipe],
  templateUrl: './filter-toolbar.component.html',
  styleUrl: './filter-toolbar.component.css',
})
export class FilterToolbarComponent implements OnDestroy {
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  isListView = model.required();
  toggleMobileFilters = model.required();
  sortOption = signal('');
  destroy$ = new Subject<void>();
  updateProducts = output();

  constructor() {
    this.sortBy();
  }

  sortBy(): void {
    const sortOption$ = toObservable(this.sortOption);

    sortOption$.pipe(distinctUntilChanged(), takeUntil(this.destroy$)).subscribe((option) => {
      this.router.navigate([], {
        relativeTo: this.route,
        queryParams: { sort: option.trim() || null },
        queryParamsHandling: 'merge',
      });
      this.updateProducts.emit();
    });
  }

  toggleView(state: boolean): void {
    this.isListView.set(state);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
