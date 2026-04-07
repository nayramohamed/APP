import { Component } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
  selector: 'app-products-empty',
  imports: [TranslatePipe],
  templateUrl: './products-empty.component.html',
  styleUrl: './products-empty.component.css',
})
export class ProductsEmptyComponent {}
