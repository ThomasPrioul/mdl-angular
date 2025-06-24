import { inject } from '@angular/core';
import { CanActivateFn } from '@angular/router';

import { AUTH_SERVICE } from '../interfaces/auth.interface';

/**
 * Guard to restrict access to routes for authenticated users only.
 * @param route - Route being activated.
 * @param state - Router state.
 * @returns true if the user is authenticated, false otherwise.
 */
export const restrictedAccessGuard: CanActivateFn = async (route, state) => {
  const auth = inject(AUTH_SERVICE);
  if (!auth.hasValidAccess()) {
    await auth.login(state.url);
  }
  return true;
};
