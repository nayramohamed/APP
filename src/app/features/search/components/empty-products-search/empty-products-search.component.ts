import { Component, output } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
  selector: 'app-empty-products-search',
  imports: [TranslatePipe],
  templateUrl: './empty-products-search.component.html',
  styleUrl: './empty-products-search.component.css',
})
export class EmptyProductsSearchComponent {
  clearfilters = output();

  clearAllFilters(): void {
    this.clearfilters.emit();
  }
}
