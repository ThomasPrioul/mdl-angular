import { Component, inject } from '@angular/core';
import { AUTH_SERVICE, CURRENT_USER } from '@mdl-angular/auth';
import { JsonPipe } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-fake-auth-demo',
  standalone: true,
  imports: [JsonPipe, RouterModule],
  templateUrl: './fake-auth-demo-simple.component.html',
})
export class FakeAuthDemoComponent {
  private authService = inject(AUTH_SERVICE);
  private currentUser = inject(CURRENT_USER);

  testResults: string[] = [];

  get user() {
    return this.currentUser;
  }

  get accessToken() {
    return this.authService.accessToken;
  }

  getCurrentTime() {
    return new Date().getTime();
  }

  login() {
    this.authService.login();
    this.addTestResult('✅ Connexion simulée effectuée');
  }

  logout() {
    this.authService.logout();
    this.addTestResult('🚪 Déconnexion effectuée');
  }

  checkAuthStatus() {
    const isValid = this.authService.hasValidAccess();
    this.addTestResult(`🔍 hasValidAccess(): ${isValid ? '✅ true' : '❌ false'}`);
  }

  refreshUserInfo() {
    const user = this.user();
    this.addTestResult(`🔄 Utilisateur actuel: ${user ? 'Connecté' : 'Déconnecté'}`);
  }

  simulateTest() {
    this.addTestResult('⚡ Test de simulation effectué');
  }

  private addTestResult(result: string) {
    this.testResults.unshift(`[${new Date().toLocaleTimeString()}] ${result}`);
    if (this.testResults.length > 10) {
      this.testResults = this.testResults.slice(0, 10);
    }
  }
}
