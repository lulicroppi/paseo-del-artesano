import { CanActivateFn, Router } from '@angular/router';
import { inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { AuthService } from '../services/auth.service';
import { map, take } from 'rxjs/operators';

export const authGuard: CanActivateFn = (route, state) => {
  const platformId = inject(PLATFORM_ID);

  // ✅ Important: don't block navigation during SSR.
  // Let the browser decide after hydration (localStorage exists there).
  if (!isPlatformBrowser(platformId)) {
    return true;
  }

  const authService = inject(AuthService);
  const router = inject(Router);

  return authService.currentUser$.pipe(
    take(1),
    map(user =>
      user
        ? true
        : router.createUrlTree(['/login'], { queryParams: { returnUrl: state.url } })
    )
  );
};

export const adminGuard: CanActivateFn = () => {
  const platformId = inject(PLATFORM_ID);

  if (!isPlatformBrowser(platformId)) {
    return true;
  }

  const authService = inject(AuthService);
  const router = inject(Router);

  return authService.currentUser$.pipe(
    take(1),
    map(user => (user?.isAdmin ? true : router.createUrlTree(['/home'])))
  );
};
