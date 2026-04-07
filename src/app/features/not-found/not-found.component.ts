import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { Location } from '@angular/common';
import { RouterLink } from '@angular/router';

import { FeaturesSectionComponent } from '../../shared/components/features-section/features-section.component';
import { TranslatePipe } from '@ngx-translate/core';

type Destination = {
  label: string;
  route: string;
};

@Component({
  selector: 'app-not-found',
  imports: [RouterLink, FeaturesSectionComponent, TranslatePipe],
  templateUrl: './not-found.component.html',
  styleUrl: './not-found.component.css',
})
export class NotFoundComponent {
  private readonly location = inject(Location);

  readonly destinations: Destination[] = [
    { label: 'All Products', route: '/shop' },
    { label: 'Categories', route: '/shop' },
    { label: "Today's Deals", route: '/shop' },
    { label: 'Contact Us', route: '/home' },
  ];

  goBack(): void {
    this.location.back();
  }
}
