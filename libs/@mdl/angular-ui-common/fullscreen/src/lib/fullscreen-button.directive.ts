import { Directive, ElementRef, Input } from '@angular/core';
import { FullscreenService } from './fullscreen.service';

@Directive({
  selector: '[mdlFullscreenButton]',
  standalone: true,
  exportAs: 'mdlFullscreenButton',
})
export class MdlFullscreenButtonDirective {
  private _fullscreenRoot: ElementRef | HTMLElement | undefined;

  constructor(el: ElementRef<HTMLElement>, private service: FullscreenService) {
    el.nativeElement.addEventListener('click', () => {
      if (this.service.isInFullScreen) {
        this.service.disableFullScreen();
      } else if (this.fullscreenRoot) {
        this.service.enableFullScreen(this.fullscreenRoot);
      } else {
        this.service.enableFullScreen(document.body);
      }
    });
  }

  @Input('mdlFullscreenButton')
  public get fullscreenRoot(): ElementRef | HTMLElement | undefined | '' {
    return this._fullscreenRoot;
  }

  public get fullscreen() {
    return this.service.isInFullScreen;
  }

  public set fullscreenRoot(value: ElementRef | HTMLElement | undefined | '') {
    if (value) this._fullscreenRoot = value;
  }
}
