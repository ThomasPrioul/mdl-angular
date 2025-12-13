import { Route } from '@angular/router';
import { restrictedAccessGuard } from '@mdl-angular/auth';

/**
 * URL de l'émetteur OAuth2 / OpenID Connect (Keycloak)
 */
export const oauthIssuer = 'https://keycloak-mdl-dev.telediag.mt.sncf.fr/realms/MDL';

export const authRoutes: Route[] = [
  {
    path: '',
    loadComponent: () => import('./auth-demo-simple.component').then((c) => c.AuthDemoComponent),
  },
  {
    path: 'public',
    loadComponent: () =>
      import('./public/public-page.component').then((c) => c.PublicPageComponent),
  },
  {
    path: 'protected',
    loadComponent: () =>
      import('./protected/protected-page-simple.component').then((c) => c.ProtectedPageComponent),
    canActivate: [restrictedAccessGuard],
  },
  {
    path: 'fake-auth',
    loadComponent: () =>
      import('./fake/fake-auth-demo-simple.component').then((c) => c.FakeAuthDemoComponent),
  },
];
