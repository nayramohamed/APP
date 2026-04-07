import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-orders-empty-state',
  imports: [RouterLink],
  templateUrl: './orders-empty-state.component.html',
  styleUrl: './orders-empty-state.component.css',
})
export class OrdersEmptyStateComponent {}
