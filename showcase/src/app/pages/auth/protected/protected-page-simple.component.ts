import { Component, computed, inject, Signal } from '@angular/core';
import { AUTH_SERVICE, CURRENT_USER, IAuthService } from '@mdl-angular/auth';
import { JsonPipe } from '@angular/common';
import { RouterModule } from '@angular/router';
// eslint-disable-next-line @nx/enforce-module-boundaries
import { User } from 'showcase/src/app/app.config';

@Component({
  selector: 'app-protected-page',
  standalone: true,
  imports: [JsonPipe, RouterModule],
  templateUrl: './protected-page-simple.component.html',
})
export class ProtectedPageComponent {
  private authService = inject(AUTH_SERVICE) as IAuthService<User>;
  private currentUser = inject(CURRENT_USER) as Signal<User | undefined>;

  protected user = computed(() => {
    if (!this.currentUser()) return undefined;

    const { roles, ...rest } = this.currentUser()!;
    return {
      ...rest,
      roles: Array.from(roles),
    };
  });

  authStatus: boolean | null = null;

  // get user() {
  //   return this.currentUser;
  // }

  get accessToken() {
    return this.authService.accessToken;
  }

  logout() {
    this.authService.logout();
  }

  checkAuth() {
    this.authStatus = this.authService.hasValidAccess();
  }
}
