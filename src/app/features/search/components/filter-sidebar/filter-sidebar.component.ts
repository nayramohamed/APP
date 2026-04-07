import { Component, input, model, output } from '@angular/core';
import { ICategory } from '../../../../core/models/categories/category.model';
import { IBrand } from '../../../../core/models/brands/brand.model';
import { FormsModule } from '@angular/forms';
import { FiltersMap } from '../../../../shared/types/filters/filters-map.type';
import { MainBarComponent } from './components/main-bar/main-bar.component';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
  selector: 'app-filter-sidebar',
  imports: [FormsModule, MainBarComponent, TranslatePipe],
  templateUrl: './filter-sidebar.component.html',
  styleUrl: './filter-sidebar.component.css',
})
export class FilterSidebarComponent {
  toggleMobileFilters = model.required();
  filters = model.required<FiltersMap>();
  clearfilters = output();
  categories = input<ICategory[]>([]);
  brands = input<IBrand[]>([]);

  clearAllFilters(): void {
    this.clearfilters.emit();
  }
}
