import { Component, computed, inject, model, output } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { FiltersMap } from '../../types/filters/filters-map.type';
import { FilterKey } from '../../types/filters/filter-key.type';
import { isArrayFilterKey } from '../../utils/filters/filters-utils';

@Component({
  selector: 'app-active-filters',
  templateUrl: './active-filters.component.html',
  styleUrl: './active-filters.component.css',
})
export class ActiveFiltersComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  clearFilters = output();

  activeFilters = model.required<FiltersMap>({});
  searchQuery = model<string>('');
  queryParamMap = toSignal(this.route.queryParamMap);

  isFiltersEmpty = computed(() => {
    const paramMap = this.queryParamMap();
    if (!paramMap) return true;

    return paramMap.keys.every((key) => {
      if (key === 'page') return true;

      if (key === 'q') {
        const value = paramMap.get(key);
        return !value || !value.trim() || value === '';
      }

      if (key === 'price[gte]' || key === 'price[lte]') {
        return !paramMap.get(key);
      }

      const values = paramMap.getAll(key);
      return values.length === 0;
    });
  });

  removePriceFilter(): void {
    this.activeFilters.update((current) => ({
      ...current,
      price: null!,
    }));
  }

  removeArrayFilterById(filter: FilterKey, id: string): void {
    if (isArrayFilterKey(filter)) {
      const current = this.activeFilters();
      const filteredList = (current[filter] ?? []).filter((item: any) => item._id !== id);
      this.activeFilters.update((current) => ({
        ...current,
        page: null,
        [filter]: filteredList,
      }));
    }
  }

  removeQueryFilter(): void {
    this.activeFilters.update((current) => ({ ...current, q: '' }));
    this.searchQuery.set('');
  }

  clearAll(): void {
    this.clearFilters.emit();
  }
}
