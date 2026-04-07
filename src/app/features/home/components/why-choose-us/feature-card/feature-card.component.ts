import { Component, input, InputSignal, signal } from '@angular/core';

import { IconComponent } from '../../../../../shared/components/icon/icon.component';

@Component({
  selector: 'app-feature-card',
  imports: [IconComponent],
  templateUrl: './feature-card.component.html',
  styleUrl: './feature-card.component.css',
})
export class FeatureCardComponent {
  title: InputSignal<string> = input.required();
  description: InputSignal<string> = input.required();
  iconName: InputSignal<string> = input.required();
  bgColor: InputSignal<string> = input.required();
  iconColor: InputSignal<string> = input.required();
  loaded = signal(false);

  ngAfterViewInit() {
    this.loaded.set(true);
  }
}
