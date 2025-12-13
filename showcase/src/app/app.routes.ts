import { Route } from '@angular/router';

export const appRoutes: Route[] = [
  {
    path: '',
    loadComponent: () => import('./pages/home/home.component').then((c) => c.HomeComponent),
  },
  {
    path: 'auth',
    loadChildren: () => import('./pages/auth/auth.routes').then((r) => r.authRoutes),
  },
  {
    path: 'common',
    loadComponent: () => import('./pages/common/common.component').then((c) => c.CommonComponent),
  },
  {
    path: 'ui-timewindow',
    loadComponent: () =>
      import('./pages/ui-timewindow/ui-timewindow.component').then((c) => c.UiTimewindowComponent),
  },
  {
    path: 'ui-cdk',
    loadComponent: () => import('./pages/ui-cdk/ui-cdk.component').then((c) => c.UiCdkComponent),
  },
  {
    path: '**',
    redirectTo: '',
  },
];
