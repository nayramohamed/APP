import { Component, input } from '@angular/core';

@Component({
  selector: 'app-items-loader',
  imports: [],
  templateUrl: './items-loader.component.html',
  styleUrl: './items-loader.component.css',
})
export class ItemsLoaderComponent {
  loadingMessage = input();
}
