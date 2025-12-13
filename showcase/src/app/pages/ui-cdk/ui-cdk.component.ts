import { Component } from '@angular/core';

@Component({
  selector: 'app-ui-cdk',
  standalone: true,
  imports: [],
  template: `
    <div class="px-4 py-8 sm:px-6 lg:px-8">
      <div class="max-w-4xl mx-auto">
        <h1 class="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl mb-8">UI CDK</h1>
        <p class="text-lg text-gray-600 mb-8">
          Kit de développement d'interface avec composants de base et tooltips.
        </p>

        <div class="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
          <h3 class="text-yellow-800 font-medium">🚧 En cours de développement</h3>
          <p class="text-yellow-700 mt-2">
            Cette section sera bientôt disponible avec des exemples de tooltips et composants UI.
          </p>
        </div>
      </div>
    </div>
  `,
})
export class UiCdkComponent {}
