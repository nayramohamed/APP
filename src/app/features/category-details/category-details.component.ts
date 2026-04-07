import { finalize, map, Subject } from 'rxjs';
import { Component, inject, signal } from '@angular/core';
import { FeaturesSectionComponent } from '../../shared/components/features-section/features-section.component';
import { BreadcrumbHeaderComponent } from '../../shared/components/breadcrumb-header/breadcrumb-header.component';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { SubCategoryService } from '../../core/services/sub-category.service';
import { ISubcategory } from '../../core/models/subcategories/subcategory.model';
import { toSignal } from '@angular/core/rxjs-interop';
import { CategoryService } from '../../core/services/category.service';
import { ICategory } from '../../core/models/categories/category.model';
import { SubcategoryCardComponent } from './components/subcategory-card/subcategory-card.component';
import { ItemsLoaderComponent } from '../../shared/components/items-loader/items-loader.component';
import { EmptySubcategoriesComponent } from './components/empty-subcategories/empty-subcategories.component';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
  selector: 'app-category-details',
  imports: [
    FeaturesSectionComponent,
    RouterLink,
    BreadcrumbHeaderComponent,
    SubcategoryCardComponent,
    ItemsLoaderComponent,
    EmptySubcategoriesComponent,
    TranslatePipe,
  ],
  templateUrl: './category-details.component.html',
  styleUrl: './category-details.component.css',
})
export class CategoryDetailsComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly subcategoryService = inject(SubCategoryService);
  private readonly categoryService = inject(CategoryService);
  private destroy$ = new Subject<void>();

  isLoading = signal(true);
  category = signal<ICategory>({} as ICategory);
  subcategories = signal<ISubcategory[]>([]);
  categoryId = toSignal(this.route.paramMap.pipe(map((params) => params.get('id'))));

  ngOnInit(): void {
    this.loadCategory();
    this.loadFilteredSubcategories(this.categoryId()!);
  }

  loadCategory(): void {
    this.categoryService.getCategoryById(this.categoryId()!).subscribe({
      next: (category) => {
        this.category.set(category);
      },
    });
  }

  loadFilteredSubcategories(categoryId: string): void {
    this.subcategoryService
      .getSubcategories()
      .pipe(finalize(() => this.isLoading.set(false)))
      .subscribe({
        next: (subcategories) => {
          const filteredSubcategories = subcategories.filter(
            (subcategory) => subcategory.category === categoryId,
          );
          this.subcategories.set(filteredSubcategories);
        },
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
