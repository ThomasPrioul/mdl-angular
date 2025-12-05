import { Injectable, inject, signal } from '@angular/core';

import { EventType, OAuthService } from 'angular-oauth2-oidc';

import { filter, tap } from 'rxjs/operators';
import { CLAIMS_TO_USER, ClaimsToUserFn, IAuthService } from '../interfaces/auth.interface';

/**
 * Wrapper around the OAuthService to retrieve user information.
 */
@Injectable({ providedIn: 'root' })
export class AuthService<T> implements IAuthService<T> {
  private readonly _user = signal<T | undefined>(undefined); //, { equal: haveSameRoles });
  private readonly _accessToken = signal<string | undefined>(undefined); //, { equal: haveSameRoles });
  private readonly claimsConverter = inject(CLAIMS_TO_USER) as ClaimsToUserFn<T>;
  private readonly loadUserEvents: EventType[] = [
    'user_profile_loaded',
    'token_received',
    'token_refreshed',
  ];
  private readonly oauth = inject(OAuthService);

  public readonly user = this._user.asReadonly();
  public readonly accesToken = this._accessToken.asReadonly();

  constructor() {
    if (this.oauth.hasValidIdToken()) {
      this.setUserInfo();
      this._accessToken.set(this.oauth.getAccessToken());
    }

    this.oauth.events
      .pipe(
        filter((e) => this.loadUserEvents.includes(e.type)),
        tap(() => this._accessToken.set(this.oauth.getAccessToken())),
      )
      .subscribe(() => this.setUserInfo());
  }

  // eslint-disable-next-line jsdoc/require-jsdoc
  public hasValidAccess(): boolean {
    return this.oauth.hasValidAccessToken();
  }

  // eslint-disable-next-line jsdoc/require-jsdoc
  public async login(forRelativeUrl?: string): Promise<void> {
    if (forRelativeUrl) {
      history.replaceState(null, '', window.location.origin + forRelativeUrl);
    }

    // We're calling this to preserve the requested route, as saveRequestedRoute() is private
    await this.oauth.tryLoginCodeFlow();
    if (forRelativeUrl || !this.oauth.hasValidAccessToken()) {
      this.oauth.initLoginFlow();
    }
  }

  /** {@inheritdoc} */
  public logout(): void {
    this.oauth.logOut();
  }

  private async setUserInfo(): Promise<void> {
    try {
      const claims = this.oauth.getIdentityClaims();
      // console.log(claims);
      this._user.set(this.claimsConverter(claims));
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Failed to load user info:', error);
      this._user.set(undefined);
    }
  }
}
