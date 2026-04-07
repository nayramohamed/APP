import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { inject } from '@angular/core';

export const guestGuard: CanActivateFn = (route, state) => {
  const authService: AuthService = inject(AuthService);
  const router: Router = inject(Router);
  const isAuthenticated = authService.isAuthenticated();

  if (isAuthenticated) {
    router.navigate(['/home']);
    return false;
  }

  return true;
};
