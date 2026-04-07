import { Component, computed, input, signal } from '@angular/core';
import { IOrder } from '../../../../core/models/orders/order.model';
import { DatePipe, DecimalPipe } from '@angular/common';

@Component({
  selector: 'app-order-card',
  imports: [DatePipe, DecimalPipe],
  templateUrl: './order-card.component.html',
  styleUrl: './order-card.component.css',
})
export class OrderCardComponent {
  order = input<IOrder>();
  isShowedDetails = signal(false);
  shippingPrice = computed(() => {
    return Number(this.order()?.totalOrderPrice) >= 500 ? '50' : 'FREE';
  });
  totalItemsQuantity = computed(() => {
    return (
      this.order()?.cartItems?.reduce((acc, i) => {
        return acc + (i.count ?? 0);
      }, 0) ?? 0
    );
  });

  getItemCountPrice(price: number, count: number) {
    return price * count;
  }
}
