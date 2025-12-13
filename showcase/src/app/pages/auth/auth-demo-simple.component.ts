import { Component, computed, effect, inject, Signal } from '@angular/core';
import { RouterModule } from '@angular/router';
import { AUTH_SERVICE, CURRENT_USER, IAuthService } from '@mdl-angular/auth';
import { User } from '../../app.config';

@Component({
  selector: 'app-auth-demo',
  standalone: true,
  imports: [RouterModule],
  templateUrl: './auth-demo-simple.component.html',
  styleUrls: ['./auth-demo-simple.component.css'],
})
export class AuthDemoComponent {
  private authService = inject(AUTH_SERVICE) as IAuthService<User>;
  private currentUser = inject(CURRENT_USER) as Signal<User | undefined>;

  protected user: Signal<User | undefined> = computed(() => this.currentUser());

  constructor() {
    effect(() => {
      console.log('AuthDemoComponent - user changed:', this.user());
    });
  }

  logout() {
    this.authService.logout();
  }
  login() {
    this.authService.login();
  }
}
