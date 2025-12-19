import { ElementRef, Injectable, OnDestroy } from '@angular/core';

import { Subscription, fromEvent, map, startWith, tap } from 'rxjs';

/**
 * Fullscreen API as a service.
 */
@Injectable({
  providedIn: 'root',
})
export class FullscreenService implements OnDestroy {
  private _isInFullScreen = false;
  private sub?: Subscription;

  public isInFullScreen$ = fromEvent(document, 'fullscreenchange').pipe(
    map(() => document.fullscreenElement != null),
    startWith(false),
  );

  constructor() {
    this.sub = this.isInFullScreen$.pipe(tap((val) => (this._isInFullScreen = val))).subscribe();
  }

  /**
   * Gets whether fullscreen API is currently active.
   * @returns boolean.
   */
  public get isInFullScreen(): boolean {
    return this._isInFullScreen;
  }

  /** {@inheritdoc} */
  public ngOnDestroy(): void {
    this.sub?.unsubscribe();
  }

  /**
   * Disables fullscreen.
   */
  public async disableFullScreen(): Promise<void> {
    if (!this.isInFullScreen) return;
    await document.exitFullscreen();
  }

  /**
   * Enables fullscreen on an element.
   * @param element - Target element of fullscreen API.
   */
  public async enableFullScreen(element: ElementRef | HTMLElement): Promise<void> {
    const elHtml = element instanceof ElementRef ? (element.nativeElement as HTMLElement) : element;
    try {
      await elHtml.requestFullscreen();
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error(err);
    }
  }
}
