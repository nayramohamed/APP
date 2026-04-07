import { Component, effect, inject, input, model } from '@angular/core';
import { toObservable } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { debounceTime, distinctUntilChanged, Subject, takeUntil } from 'rxjs';
import { FiltersMap } from '../../../../shared/types/filters/filters-map.type';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
  selector: 'app-search-header',
  imports: [FormsModule, TranslatePipe],
  templateUrl: './search-header.component.html',
  styleUrl: './search-header.component.css',
})
export class SearchHeaderComponent {
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  destroy$ = new Subject<void>();
  searchQuery = model.required<string>();
  productsQuantity = input();
  activeFilters = model<FiltersMap>();

  constructor() {
    this.initSearchByQuery();
    effect(() => {
      this.activeFilters.update((current) => ({
        ...current,
        q: this.searchQuery(),
      }));
    });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  initSearchByQuery(): void {
    const query$ = toObservable(this.searchQuery);
    query$
      .pipe(debounceTime(1000), distinctUntilChanged(), takeUntil(this.destroy$))
      .subscribe((q) => {
        this.router.navigate([], {
          relativeTo: this.route,
          queryParams: { q: q.trim() || null },
          queryParamsHandling: 'merge',
        });
        this.activeFilters.update((current) => ({
          ...current,
          q: this.searchQuery(),
        }));
      });
  }
}
