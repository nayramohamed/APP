import { Component } from '@angular/core';

import { SliderComponent } from './components/slider/slider.component';
import { WhyChooseUsComponent } from './components/why-choose-us/why-choose-us.component';
import { ShopByCategoryComponent } from './components/shop-by-category/shop-by-category.component';
import { FeaturedProductsComponent } from './components/featured-products/featured-products.component';
import { GetFreshestUpdatesComponent } from './components/get-freshest-updates/get-freshest-updates.component';
import { FeaturesSectionComponent } from "../../shared/components/features-section/features-section.component";

@Component({
  selector: 'app-home',
  imports: [
    SliderComponent,
    WhyChooseUsComponent,
    ShopByCategoryComponent,
    FeaturedProductsComponent,
    GetFreshestUpdatesComponent,
    FeaturesSectionComponent
],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css',
})
export class HomeComponent {}
