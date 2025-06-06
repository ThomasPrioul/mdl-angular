import { Directive, ElementRef, Input, inject } from '@angular/core';

import { FullscreenService } from './fullscreen.service';

/**
 * Fullscreen API button directive. Adds handy way to have a "toggle fullscreen" button on the UI.
 * The target HTML Element of the fullscreen API is configurable.
 */
@Directive({
  selector: '[mdlFullscreenButton]',
  standalone: true,
  exportAs: 'mdlFullscreenButton',
})
export class MdlFullscreenButtonDirective {
  private _fullscreenRoot: ElementRef | HTMLElement | undefined;
  private el = inject(ElementRef<HTMLElement>);
  private service = inject(FullscreenService);

  constructor() {
    this.el.nativeElement.addEventListener('click', () => {
      if (this.service.isInFullScreen) {
        this.service.disableFullScreen();
      } else if (this.fullscreenRoot) {
        this.service.enableFullScreen(this.fullscreenRoot);
      } else {
        this.service.enableFullScreen(document.body);
      }
    });
  }

  public get fullscreen(): boolean {
    return this.service.isInFullScreen;
  }

  @Input('mdlFullscreenButton')
  public get fullscreenRoot(): ElementRef | HTMLElement | undefined | '' {
    return this._fullscreenRoot;
  }

  public set fullscreenRoot(value: ElementRef | HTMLElement | undefined | '') {
    if (value) this._fullscreenRoot = value;
  }
}
