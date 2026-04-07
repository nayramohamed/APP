import { map } from 'rxjs';
import { ArrayFilterKey } from '../../types/filters/array-filter-key.type';
import { FilterKey } from '../../types/filters/filter-key.type';
import { FiltersMap } from '../../types/filters/filters-map.type';
import { ScalarFilterKey } from '../../types/filters/scalar-filters-key.type';

export function isArrayFilterKey(key: FilterKey): key is ArrayFilterKey {
  return key === 'category' || key === 'brand' || key === 'subcategory';
}

export function isScalarFilterKey(key: FilterKey): key is ScalarFilterKey {
  return key === 'q' || key === 'price';
}

export function getArrayFilterIds(filtersMap: FiltersMap, filterKey: ArrayFilterKey): any {
  let arrayFilterIds: string[] = [];

  arrayFilterIds = filtersMap[filterKey]?.map((i) => i._id) ?? [];

  return arrayFilterIds;
}

export function arrayToSet(array: any[]): Set<any> {
  return new Set(array);
}
