import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { OrderService } from '../../core/services/order.service';
import { IOrder } from '../../core/models/orders/order.model';
import { OrderCardComponent } from './components/order-card/order-card.component';
import { AuthService } from '../../core/services/auth.service';
import { toSignal } from '@angular/core/rxjs-interop';
import { OrdersEmptyStateComponent } from './components/orders-empty-state/orders-empty-state.component';
import { RouterLink } from '@angular/router';
import { FeaturesSectionComponent } from '../../shared/components/features-section/features-section.component';
import { finalize } from 'rxjs';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
  selector: 'app-orders',
  imports: [
    OrderCardComponent,
    OrdersEmptyStateComponent,
    RouterLink,
    FeaturesSectionComponent,
    TranslatePipe,
  ],
  templateUrl: './orders.component.html',
  styleUrl: './orders.component.css',
})
export class OrdersComponent implements OnInit {
  private readonly orderService = inject(OrderService);
  private readonly authService = inject(AuthService);
  orders = signal<IOrder[]>([]);
  currentUser = toSignal(this.authService.currentUser$);
  isLoading = signal(false);

  ngOnInit(): void {
    this.loadOrders();
  }

  loadOrders(): void {
    this.isLoading.set(true);
    const userId = this.currentUser()?._id ?? '';
    if (!userId) return;
    this.orderService
      .getUserOrders(userId)
      .pipe(finalize(() => this.isLoading.set(false)))
      .subscribe({
        next: (orders) => {
          this.orders.set(orders);
        },
      });
  }
}
