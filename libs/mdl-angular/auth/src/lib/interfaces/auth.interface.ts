import { InjectionToken, Signal } from '@angular/core';

/** Auth access_token. */
export const ACCESS_TOKEN = new InjectionToken<Signal<string | undefined>>('ACCESS_TOKEN');

/** Whether to allow anonymous access. */
export const ALLOW_ANONYMOUS = new InjectionToken<boolean>('ALLOW_ANONYMOUS');

/** Auth service token. */
export const AUTH_SERVICE = new InjectionToken<IAuthService<unknown>>('AUTH_SERVICE');

/** Claims to user function token. */
export const CLAIMS_TO_USER = new InjectionToken<ClaimsToUserFn<unknown>>('CLAIMS_TO_USER');

/** Currently logged-in user token. */
export const CURRENT_USER = new InjectionToken<Signal<unknown | undefined>>('CURRENT_USER');

/** Interface for an auth service. */
export interface IAuthService<T> {
  /** Current access token signal */
  accessToken: Signal<string | undefined>;

  /** User info signal. */
  user: Signal<T | undefined>;

  /**
   * Whether the user has an access and this access it still in its valid period.
   * @returns true if token still valid.
   */
  hasValidAccess(): boolean;

  /**
   * Logs in the user (forwards to oauth svc).
   * @param forRelativeUrl - Return URL after login. Specify if URL is different than current URL.
   */
  login(forRelativeUrl?: string): Promise<void>;

  /** Logs out the user (forwards to oauth svc). */
  logout(): void;
}

/** Raw claims type */
export type Claims = Record<string, unknown>;

/** Function to convert claims to a typed User object. */
export type ClaimsToUserFn<TUser> = (claims: Claims) => TUser;
