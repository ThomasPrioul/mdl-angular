import {
  ChangeDetectorRef,
  DestroyRef,
  OnDestroy,
  Pipe,
  PipeTransform,
  inject,
} from '@angular/core';

import { toDate } from '../date.helpers';

const ms_1d = 86400000;
const ms_1h = 3600000;
const ms_1m = 60000;
const ms_1s = 1000;

/**
 * Custom relative time pipe using native Date objects and leveraging Intl.RelativeTimeFormat.
 * This pipe is impure and forces an angular check pass every time the timeout time would change on screen. Uses setTimeout() under the hood, no rxjs, no fancy stuff.
 */
@Pipe({
  name: 'relativeTime',
  pure: false,
})
export class RelativeTimeImpurePipe implements PipeTransform, OnDestroy {
  private readonly _cdRef = inject(ChangeDetectorRef);
  private readonly _destroy = inject(DestroyRef);

  private tickerId?: number;

  constructor() {
    this._destroy.onDestroy(() => this.cleanup());
  }

  /** {@inheritdoc} */
  public ngOnDestroy(): void {
    this.cleanup();
  }

  /**
   * Transform the given date or timestamp number (with milliseconds) in a human-readable 'relative' time.
   * Refreshes every time it's needed by calling the markForCheck() method, uses setTimeout under the hood.
   * @param value - Date-kind input, either ISO string, timestamp in milliseconds or a JS Date object.
   * @param options - Formatting options from Intl API.
   * @returns The relative time string, if the value is convertible, otherwise returns null.
   */
  public transform(
    value: Date | number | string | null | undefined,
    options?: Intl.RelativeTimeFormatOptions,
  ): string | null {
    if (!value) return null;
    const now = Date.now();

    if (this.tickerId) this.cleanup();

    value = toDate(value);

    const deltaMs = value.valueOf() - now;
    const absDeltaMs = Math.abs(deltaMs);

    // Find exact necessary time until next refresh
    const moduloToUse =
      absDeltaMs < ms_1m ? ms_1s : absDeltaMs < ms_1h ? ms_1m : ms_1h;
    const msToWait = moduloToUse - (absDeltaMs % moduloToUse);
    this.tickerId = window.setTimeout(
      () => this._cdRef.markForCheck(),
      msToWait,
    );

    const formatter = new Intl.RelativeTimeFormat(navigator.language, options);
    return this.toRelative(deltaMs, absDeltaMs, formatter);
  }

  private cleanup(): void {
    window.clearInterval(this.tickerId);
    this.tickerId = undefined;
  }

  private toRelative(
    deltaMs: number,
    absDelta: number,
    formatter: Intl.RelativeTimeFormat,
  ): string {
    if (absDelta < ms_1s) return 'maintenant';
    if (absDelta < ms_1m)
      return formatter.format(Math.round(deltaMs / ms_1s), 'seconds');
    if (absDelta < ms_1h)
      return formatter.format(Math.round(deltaMs / ms_1m), 'minutes');
    if (absDelta < ms_1d)
      return formatter.format(Math.round(deltaMs / ms_1h), 'hours');
    return formatter.format(Math.round(deltaMs / ms_1d), 'days');
  }
}
