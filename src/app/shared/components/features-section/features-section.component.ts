import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IconComponent } from '../icon/icon.component';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
  selector: 'app-features-section',
  imports: [CommonModule, IconComponent, TranslatePipe],
  templateUrl: './features-section.component.html',
  styleUrl: './features-section.component.css',
})
export class FeaturesSectionComponent {
  features = [
    {
      id: 1,
      icon: 'truck',
      titleKey: 'features.freeShipping.title',
      descriptionKey: 'features.freeShipping.description',
    },
    {
      id: 2,
      icon: 'return',
      titleKey: 'features.easyReturns.title',
      descriptionKey: 'features.easyReturns.description',
    },
    {
      id: 3,
      icon: 'half-shield',
      titleKey: 'features.securePayment.title',
      descriptionKey: 'features.securePayment.description',
    },
    {
      id: 4,
      icon: 'headset',
      titleKey: 'features.support.title',
      descriptionKey: 'features.support.description',
    },
  ];
}
