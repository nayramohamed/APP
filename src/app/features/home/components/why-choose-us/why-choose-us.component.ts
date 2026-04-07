import { Component } from '@angular/core';
import { FeatureCardComponent } from './feature-card/feature-card.component';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
  selector: 'app-why-choose-us',
  imports: [FeatureCardComponent, TranslatePipe],
  templateUrl: './why-choose-us.component.html',
  styleUrl: './why-choose-us.component.css',
})
export class WhyChooseUsComponent {
  cards = [
    {
      iconName: 'truck',
      title: 'home.features.freeShipping.title',
      description: 'home.features.freeShipping.description',
      bgColor: 'bg-blue-100',
      textColor: 'text-[#2B7FFF]',
    },
    {
      iconName: 'half-shield',
      title: 'home.features.securePayment.title',
      description: 'home.features.securePayment.description',
      bgColor: 'bg-emerald-100',
      textColor: 'text-[#00BC7D]',
    },
    {
      iconName: 'return',
      title: 'home.features.easyReturns.title',
      description: 'home.features.easyReturns.description',
      bgColor: 'bg-orange-100',
      textColor: 'text-[#FF6900]',
    },
    {
      iconName: 'headset',
      title: 'home.features.support.title',
      description: 'home.features.support.description',
      bgColor: 'bg-violet-100',
      textColor: 'text-[#AD46FF]',
    },
  ];
}
