import {
  EnvironmentProviders,
  inject,
  makeEnvironmentProviders,
  provideAppInitializer,
} from '@angular/core';

import {
  NullValidationHandler,
  OAuthModuleConfig,
  OAuthService,
  provideOAuthClient,
} from 'angular-oauth2-oidc';

import {
  ALLOW_ANONYMOUS,
  AUTH_SERVICE,
  CLAIMS_TO_USER,
  CURRENT_USER,
  ClaimsToUserFn,
  IAuthService,
} from '../interfaces/auth.interface';
import { AuthService } from '../services/auth.service';

/**
 * Provides keycloak OAuth services, and an implementation of the CURRENT_USER provider.
 * @param issuer - Your issuer full URL including the realm.
 * @param clientId - Your OIDC client ID.
 * @param claimsToUserFn - Your method to parse the raw ID token claims and convert them to your user model.
 * @param allowAnonymous - Whether to allow anonymous access in the app (don't force login as soon as you reach the app).
 * @param redirectUri - Your optional redirect URI, otherwise the root '/' will be used.
 * @param config - Configuration object to pass to provideOAuthClient() method.
 * @param validationHandlerClass - Validation handler class to pass to provideOAuthClient() method.
 * If true (the default), the user won't be forced to perform an oauth2 flow on app startup,
 * this is useful in case of public home pages for example.
 * If false, the user will be forced to perform an oauth2 flow on app startup.
 * @returns App providers.
 */
export function provideKeycloakAuth<TUser>(
  issuer: string,
  clientId: string,
  claimsToUserFn: ClaimsToUserFn<TUser>,
  allowAnonymous = true,
  redirectUri?: string,
  config?: OAuthModuleConfig,
  validationHandlerClass?: typeof NullValidationHandler,
): EnvironmentProviders {
  return makeEnvironmentProviders([
    provideOAuthClient(config, validationHandlerClass),
    provideAppInitializer(async () => {
      const oauth = inject(OAuthService);
      oauth.configure({
        issuer: issuer,
        clientId: clientId,
        redirectUri: redirectUri ?? window.location.origin + '/',
        responseType: 'code',
        preserveRequestedRoute: true,
      });

      // Use token info when available to perform login.
      // If already logged in, setup silent refresh.
      try {
        if (allowAnonymous) {
          await oauth.loadDiscoveryDocumentAndTryLogin();
        } else {
          await oauth.loadDiscoveryDocumentAndLogin();
        }
        if (oauth.hasValidAccessToken()) {
          oauth.setupAutomaticSilentRefresh();
        }
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error(error);
      }
    }),
    {
      provide: CLAIMS_TO_USER,
      useValue: claimsToUserFn,
    },
    {
      provide: AUTH_SERVICE,
      useClass: AuthService,
    },
    {
      provide: ALLOW_ANONYMOUS,
      useValue: allowAnonymous,
    },
    {
      provide: CURRENT_USER,
      useFactory: () => (inject(AUTH_SERVICE) as IAuthService<TUser>).user,
    },
  ]);
}
