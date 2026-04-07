import { Component, inject, OnInit, signal } from '@angular/core';
import { BreadcrumbHeaderComponent } from '../../shared/components/breadcrumb-header/breadcrumb-header.component';
import { ItemsLoaderComponent } from '../../shared/components/items-loader/items-loader.component';
import { ICategory } from '../../core/models/categories/category.model';
import { CategoryCardComponent } from '../../shared/components/category-card/category-card.component';
import { FeaturesSectionComponent } from '../../shared/components/features-section/features-section.component';
import { CategoryService } from '../../core/services/category.service';
import { finalize } from 'rxjs';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
  selector: 'app-categories',
  imports: [
    BreadcrumbHeaderComponent,
    CategoryCardComponent,
    FeaturesSectionComponent,
    ItemsLoaderComponent,
    TranslatePipe,
  ],
  templateUrl: './categories.component.html',
  styleUrl: './categories.component.css',
})
export class CategoriesComponent implements OnInit {
  private readonly categoryService = inject(CategoryService);

  categories = signal<ICategory[]>([]);
  isCategoriesLoading = signal(true);
  ngOnInit(): void {
    this.loadCategories();
  }

  loadCategories(): void {
    this.categoryService
      .getCategories()
      .pipe(finalize(() => this.isCategoriesLoading.set(false)))
      .subscribe({
        next: (categories) => {
          this.categories.set(categories);
        },
      });
  }
}
