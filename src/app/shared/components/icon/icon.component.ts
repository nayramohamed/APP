import { Component, input } from '@angular/core';

@Component({
  selector: 'app-icon',
  imports: [],
  host: { class: 'flex items-center justify-center ' },
  templateUrl: './icon.component.html',
  styleUrl: './icon.component.css',
})
export class IconComponent {
  name = input.required<string>();
  width = input<string>('20');
  height = input<string>('20');
  color = input<string>('');

  iconPath = `/icons/icons.svg`;
}
