import { Component, computed, input, model, output, signal } from '@angular/core';
import {
  arrayToSet,
  getArrayFilterIds,
  isArrayFilterKey,
} from '../../../../../../shared/utils/filters/filters-utils';
import { IBrand } from '../../../../../../core/models/brands/brand.model';
import { ICategory } from '../../../../../../core/models/categories/category.model';
import { ArrayFilterKey } from '../../../../../../shared/types/filters/array-filter-key.type';
import { FilterKey } from '../../../../../../shared/types/filters/filter-key.type';
import { FiltersMap } from '../../../../../../shared/types/filters/filters-map.type';

@Component({
  selector: 'app-main-bar',
  imports: [],
  templateUrl: './main-bar.component.html',
  styleUrl: './main-bar.component.css',
})
export class MainBarComponent {
  filters = model<FiltersMap>({
    price: { minPrice: 0, maxPrice: 0 },
    brand: [],
    category: [],
  });
  clearfilters = output();
  categories = input<ICategory[]>([]);
  brands = input<IBrand[]>([]);
  minPrice = computed(() => this.filters().price?.minPrice ?? 0);
  maxPrice = computed(() => this.filters().price?.maxPrice ?? 0);
  priceRange = computed(() => {
    return [500, 1000, 5000, 10000];
  });

  onPriceChange(type: 'minPrice' | 'maxPrice', event: Event) {
    const input = event.target as HTMLInputElement;

    const raw = input.value;
    const value = raw ? Number(raw) : 0;

    this.updatePriceFilterInput(type, value);
  }

  onPriceRangeFilter(max: number): void {
    const maxPrice = max ?? 0;

    this.updatePriceFilterInput('minPrice', 0);
    this.updatePriceFilterInput('maxPrice', maxPrice);
  }
  updatePriceFilterInput(filter: string, value: number): void {
    if (!this.filters()) return;
    this.filters.update((current) => ({
      ...current,
      price: {
        ...(current.price ?? { minPrice: 0, maxPrice: 0 }),
        [filter]: value > 0 ? value : 0,
      },
    }));
  }

  getSelectedCount(filter: ArrayFilterKey) {
    const filterIdsSet = this.getArrayFilterSet(filter);
    return filterIdsSet?.size ?? 0;
  }

  isSelected(filter: ArrayFilterKey, id: string): boolean {
    const filterIdsSet = this.getArrayFilterSet(filter);
    return filterIdsSet.has(id) ?? false;
  }

  getArrayFilterSet(filter: ArrayFilterKey): Set<string> {
    const filterIds = getArrayFilterIds(this.filters(), filter);
    return arrayToSet(filterIds);
  }

  toggleCheckBoxFilter(filter: FilterKey, filterObject: IBrand | ICategory, checked: boolean) {
    const current = this.filters();

    if (isArrayFilterKey(filter)) {
      const updatedList = current[filter] ?? [];

      if (checked) {
        updatedList.push(filterObject);
      } else {
        const index = updatedList.findIndex((f) => f._id === filterObject._id);
        if (index !== -1) updatedList.splice(index, 1);
      }

      this.filters.set({
        ...current,
        [filter]: updatedList,
      });
    }
  }

  clearAllFilters(): void {
    this.clearfilters.emit();
  }
}
