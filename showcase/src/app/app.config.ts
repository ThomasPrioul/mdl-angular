import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { DateTime } from 'luxon';
import { appRoutes } from './app.routes';
import { provideFakeAuth, provideKeycloakAuth } from '@mdl-angular/auth';
import { oauthIssuer } from './pages/auth/auth.routes';

// Interface pour typer notre utilisateur de démonstration
export interface User {
  id: string;
  familyName: string;
  firstName: string;
  displayName: string;
  company: string;
  email: string;
  hasPassword: boolean;
  site: string;
  roles: Set<string>;
  department?: string;
}

// Interface pour typer les claims OAuth
interface OAuthClaims {
  preferred_username?: string;
  family_name?: string;
  given_name?: string;
  name?: string;
  email?: string;
  email_verified?: boolean;
  resource_access?: {
    [key: string]: {
      roles?: string[];
    };
  };
}

/** Configuration de l'application Angular */
export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(appRoutes),
    provideHttpClient(),
    // Configuration Fake Auth pour la démonstration
    provideFakeAuth<User>(
      {
        id: '123',
        familyName: 'Doe',
        firstName: 'John',
        displayName: 'John Doe',
        email: 'john.doe@example.com',
        roles: new Set(['user', 'admin']),
        department: 'Engineering',
        company: 'Example Corp',
        hasPassword: true,
        site: 'Headquarters',
      },
      true, // allowAnonymous = true pour permettre la navigation libre
    ),
    provideKeycloakAuth<User>(
      oauthIssuer,
      'mrveille',
      claimsToUser,
      {
        resourceServer: { sendAccessToken: true, allowedUrls: ['/api/'] },
      },
      false,
      // {
      //   scope: 'openid profile email offline_access' ,

      // },
    ),
  ],
};

function claimsToUser(claims: OAuthClaims): User {
  return {
    id: claims.preferred_username ?? '',
    familyName: claims.family_name ?? '',
    firstName: claims.given_name ?? '',
    displayName: claims.name ?? '',
    email: claims.email ?? '',
    company: '',
    hasPassword: claims.email_verified ?? false,
    site: '',
    roles: new Set<string>(claims['resource_access']?.['mrveille']?.roles ?? []),
  };
}

/**
 * Retourne la date actuelle avec l'heure configurée
 * @param endOfDay - Si true, retourne 23:59:59, sinon 00:00:00
 * @returns DateTime configuré pour le début ou la fin de journée
 */
export function today(endOfDay = false): DateTime {
  if (endOfDay) {
    return DateTime.local().set({ hour: 23, minute: 59, second: 59, millisecond: 999 });
  }
  return DateTime.local().set({ hour: 0, minute: 0, second: 0, millisecond: 0 });
}
