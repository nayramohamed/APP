import { Component } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
  selector: 'app-empty-subcategories',
  imports: [TranslatePipe],
  templateUrl: './empty-subcategories.component.html',
  styleUrl: './empty-subcategories.component.css',
})
export class EmptySubcategoriesComponent {}
