import { Component, input, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ISubcategory } from '../../../../core/models/subcategories/subcategory.model';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
  selector: 'app-subcategory-card',
  imports: [RouterLink, TranslatePipe],
  templateUrl: './subcategory-card.component.html',
  styleUrl: './subcategory-card.component.css',
})
export class SubcategoryCardComponent {
  subcategory = input<ISubcategory>();
}
