import { Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { IBrand } from '../../../../core/models/brands/brand.model';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
  selector: 'app-brand-card',
  imports: [RouterLink, TranslatePipe],
  templateUrl: './brand-card.component.html',
  styleUrl: './brand-card.component.css',
})
export class BrandCardComponent {
  brand = input<IBrand>();
}
