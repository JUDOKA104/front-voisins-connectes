import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const adminGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // On vérifie le token JWT qui contient les rôles
  const user = authService.currentUser;

  if (user && user.roles && user.roles.includes('ROLE_ADMIN')) {
    return true;
  }

  // Si pas admin, on le renvoie sur le dashboard normal
  router.navigate(['/app/dashboard']);
  return false;
};
