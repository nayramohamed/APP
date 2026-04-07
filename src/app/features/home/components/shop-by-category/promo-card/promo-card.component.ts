import { Component, input } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
  selector: 'app-promo-card',
  imports: [TranslatePipe],
  templateUrl: './promo-card.component.html',
  styleUrl: './promo-card.component.css',
})
export class PromoCardComponent {
  promoCard = input<any>();
}
