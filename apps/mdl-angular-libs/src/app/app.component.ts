import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { TimewindowComponent } from '@mdl-angular/ui-timewindow';

/**
 *
 */
@Component({
  imports: [RouterModule, TimewindowComponent],
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
})
export class AppComponent {
  title = 'mdl-angular-libs';
}
