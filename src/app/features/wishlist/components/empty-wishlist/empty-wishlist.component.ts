import { Component, inject } from '@angular/core';
import { IconComponent } from '../../../../shared/components/icon/icon.component';
import { AuthService } from '../../../../core/services/auth.service';
import { toSignal } from '@angular/core/rxjs-interop';
import { TranslatePipe } from '@ngx-translate/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-empty-wishlist',
  imports: [IconComponent, TranslatePipe, RouterLink],
  templateUrl: './empty-wishlist.component.html',
  styleUrl: './empty-wishlist.component.css',
})
export class EmptyWishlistComponent {
  private readonly authService = inject(AuthService);

  currentUser = toSignal(this.authService.currentUser$);
}
