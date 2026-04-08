import { Component, inject, OnInit, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import { finalize } from 'rxjs';
import { IOrder } from '../../core/models/orders/order.model';
import { AuthService } from '../../core/services/auth.service';
import { OrderService } from '../../core/services/order.service';
import { FeaturesSectionComponent } from '../../shared/components/features-section/features-section.component';
import { OrderCardComponent } from './components/order-card/order-card.component';
import { OrdersEmptyStateComponent } from './components/orders-empty-state/orders-empty-state.component';

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
