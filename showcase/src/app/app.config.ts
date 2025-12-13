import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
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

function claimsToUser(claims: Record<string, any>): User {
  return {
    id: claims['preferred_username'],
    familyName: claims['family_name'],
    firstName: claims['given_name'],
    displayName: claims['name'],
    email: claims['email'],
    company: '',
    hasPassword: claims['email_verified'],
    site: '',
    roles: new Set<string>(claims['resource_access']?.['mrveille']?.roles ?? []),
  };
}
