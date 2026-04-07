import { Component, computed, inject, input } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { IMetadata } from '../../../core/models/products/products-response.model';

@Component({
  selector: 'app-pagination',
  imports: [],
  templateUrl: './pagination.component.html',
  styleUrl: './pagination.component.css',
})
export class PaginationComponent {
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  activeButtonClasses = input('bg-primary-600');
  paginationData = input<IMetadata | null>();
  activePage = computed(() => {
    return Number(this.paginationData()?.currentPage) || 1;
  });
  isPrev = computed(() => {
    return Number(this.paginationData()?.currentPage) > 1;
  });
  isNext = computed(() => {
    const current = Number(this.paginationData()?.currentPage);
    const totalPages = Number(this.paginationData()?.numberOfPages);
    return current < totalPages;
  });

  pages = computed(() => {
    const count = Number(this.paginationData()?.numberOfPages) || 0;
    return Array.from({ length: count }, (_, i) => i + 1);
  });

  nextPage(): void {
    const nextPage = this.paginationData()?.nextPage;
    if (!nextPage) return;

    this.toPage(nextPage!);
  }

  prevPage(): void {
    const prevPage = this.paginationData()?.prevPage;
    if (!prevPage) return;

    this.toPage(prevPage!);
  }
  toPage(pageNumber: number): void {
    const currentPage = Number(this.paginationData()?.currentPage) || 1;
    if (pageNumber === currentPage) return;

    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: pageNumber === 1 ? { page: null } : { page: pageNumber },
      queryParamsHandling: 'merge',
    });
  }
}
