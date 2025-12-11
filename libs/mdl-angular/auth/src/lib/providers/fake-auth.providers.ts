import {
  EnvironmentProviders,
  Injectable,
  InjectionToken,
  Provider,
  inject,
  makeEnvironmentProviders,
  provideAppInitializer,
  signal,
} from '@angular/core';
import { Router } from '@angular/router';

import {
  ACCESS_TOKEN,
  ALLOW_ANONYMOUS,
  AUTH_SERVICE,
  CURRENT_USER,
  IAuthService,
} from '../interfaces/auth.interface';

/** User mock data. */
const USER_MOCK = new InjectionToken<unknown>('USER_MOCK');

/**
 * Provides fake OAuth services, with a dumb implementation.
 * @param fakeUser - Fake user model when login() is performed.
 * @param allowAnonymous - Whether to allow anonymous access.
 * If true (the default), the user won't be forced to perform a login on app startup,
 * this is useful in case of public home pages for example.
 * If false, the user will be forced to perform a login on app startup.
 * @returns App providers.
 */
export function provideFakeAuth<TUser>(
  fakeUser: TUser,
  allowAnonymous = true,
): EnvironmentProviders {
  const providers: (Provider | EnvironmentProviders)[] = [
    {
      provide: USER_MOCK,
      useValue: fakeUser,
    },
    {
      provide: AUTH_SERVICE,
      useClass: FakeAuthService,
    },
    {
      provide: ALLOW_ANONYMOUS,
      useValue: allowAnonymous,
    },
    {
      provide: CURRENT_USER,
      useFactory: () => (inject(AUTH_SERVICE) as IAuthService<TUser>).user,
    },
    {
      provide: ACCESS_TOKEN,
      useFactory: () => (inject(AUTH_SERVICE) as IAuthService<TUser>).accessToken,
    },
  ];

  if (!allowAnonymous) {
    providers.push(
      provideAppInitializer(async () => {
        const authService = inject(AUTH_SERVICE) as unknown as FakeAuthService<TUser>;
        if (!authService.hasValidAccess()) {
          await authService.login();
        }
      }),
    );
  }

  return makeEnvironmentProviders(providers);
}

@Injectable({ providedIn: 'root' })
class FakeAuthService<T> implements IAuthService<T> {
  private readonly _fakeUser = inject(USER_MOCK) as T;
  private readonly _user = signal<T | undefined>(
    sessionStorage.getItem('fake_login') ? this._fakeUser : undefined,
  );
  private readonly router = inject(Router);

  public readonly accessToken = signal<string | undefined>(undefined);
  public readonly user = this._user.asReadonly();

  public hasValidAccess(): boolean {
    return this.user() !== undefined;
  }

  public async login(): Promise<void> {
    await new Promise<void>((resolve) => {
      setInterval(() => resolve(), 300);
    });
    sessionStorage.setItem('fake_login', '1');
    this._user.set(this._fakeUser);
  }

  public logout(): void {
    sessionStorage.removeItem('fake_login');
    this._user.set(undefined);
    this.router.navigateByUrl('/');
    return;
  }
}
