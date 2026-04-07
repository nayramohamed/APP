import { RouterLink } from '@angular/router';
import { IProduct } from './../../../../core/models/products/product.model';
import { Component, input, model } from '@angular/core';
import { ɵInternalFormsSharedModule } from '@angular/forms';
import { CurrentProductSkeletonComponent } from './components/current-product-skeleton/current-product-skeleton.component';
import { ProductImagesSliderComponent } from './components/product-images-slider/product-images-slider.component';
import { ProductInformationComponent } from './components/product-information/product-information.component';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
  selector: 'app-current-product',
  imports: [
    RouterLink,
    ɵInternalFormsSharedModule,
    CurrentProductSkeletonComponent,
    ProductImagesSliderComponent,
    ProductInformationComponent,
    TranslatePipe,
  ],
  templateUrl: './current-product.component.html',
  styleUrl: './current-product.component.css',
})
export class CurrentProductComponent {
  product = input<IProduct>();
  reviewsCount = input.required<number>();
  isLoading = input(false);
}
