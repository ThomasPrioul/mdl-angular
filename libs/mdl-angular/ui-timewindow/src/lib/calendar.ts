import {
  AfterViewInit,
  Directive,
  ElementRef,
  Injector,
  OnDestroy,
  OnInit,
  effect,
  inject,
  input,
  output,
  runInInjectionContext,
  signal,
} from '@angular/core';

import flatpickr from 'flatpickr';

import { French } from 'flatpickr/dist/l10n/fr.js';
import { Options } from 'flatpickr/dist/types/options';

/**
 * Wraps a flatpickr calendar to be used in angular component, for an "inline" use case.
 */
@Directive({
  selector: '[mdlCalendar]',
  exportAs: 'mdlCalendar',
  standalone: true,
})
export class CalendarDirective implements AfterViewInit, OnInit, OnDestroy {
  private readonly _currentMonth = signal<string>('');
  private readonly _injector = inject(Injector);
  private readonly el = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly syncMonthEffect = effect(() => {
    const offset = this.monthOffset();
    if (offset === undefined) return;
    this._flatpickrInstance?.changeMonth(offset, true);
  });

  private _flatpickrInstance?: flatpickr.Instance;

  public readonly currentMonth = this._currentMonth.asReadonly();
  public readonly dateChanged = output<Date[]>();
  public readonly endRange = input.required<Date | null>();
  public readonly hovering = output();
  public readonly maxDate = input<Date>();
  public readonly minDate = input<Date>();
  public readonly monthOffset = input<number>();
  public readonly startRange = input.required<Date | null>();

  public get disableNextMonth(): boolean {
    return this._flatpickrInstance?.__hideNextMonthArrow ?? false;
  }

  public get disablePreviousMonth(): boolean {
    return this._flatpickrInstance?.__hidePrevMonthArrow ?? true;
  }

  public get flatpickrInstance(): flatpickr.Instance | undefined {
    return this._flatpickrInstance;
  }

  /** {@inheritdoc} */
  public ngOnInit(): void {
    const options: Options = {
      inline: true,
      animate: false,
      mode: 'range',
      locale: French,
      minDate: this.minDate(),
      maxDate: this.maxDate(),
      onChange: [
        (selectedDates) => {
          runInInjectionContext(this._injector, () => {
            this.dateChanged.emit(selectedDates);
            this.updateLabel();
          });
        },
      ],
      onMonthChange: [
        () => {
          this.updateLabel();
        },
      ],
    };
    this._flatpickrInstance = flatpickr(this.el.nativeElement, options);
    this._flatpickrInstance.daysContainer?.addEventListener(
      'mouseenter',
      () => {
        this.hovering.emit();
      },
      false,
    );

    this.updateLabel();
  }

  /** {@inheritdoc} */
  public ngAfterViewInit(): void {
    const dates: Date[] = [];
    const startDate = this.startRange();
    const endDate = this.endRange();
    if (startDate) dates.push(startDate);
    if (endDate) dates.push(endDate);
    this.setSelectedDates(dates);
  }

  /** {@inheritdoc} */
  public ngOnDestroy(): void {
    this._flatpickrInstance?.destroy();
  }

  /**
   * Changes the current visible month with an offset (positive = future).
   * @param offset - offset in months.
   * @returns true if month changed.
   */
  public changeMonth(offset: number): boolean {
    if (!this._flatpickrInstance) return false;

    if (offset < 0 && this._flatpickrInstance.__hidePrevMonthArrow) {
      return false;
    }

    if (offset > 0 && this._flatpickrInstance.__hideNextMonthArrow) {
      return false;
    }

    this._flatpickrInstance?.changeMonth(offset, true);
    return true;
  }

  /**
   * Fixes range class for this calendar which has to be the 'current' calendar aka right one.
   * This method is called when the other calendar is hovered, to clean the CSS classes to have a good look.
   * The goal is to put every item from start of this calendar up until 'end' "in range".
   */
  public firstDayFocus(): void {
    const items = this._flatpickrInstance?.days?.children;
    if (!items) return;
    if (this._flatpickrInstance?.selectedDates.length !== 1) return;

    let removeInRange = false;
    if (
      this._flatpickrInstance?.selectedDates[0].getMonth() < this._flatpickrInstance?.currentMonth
    ) {
      removeInRange = true;
    }

    for (let index = 0; index < items.length; index++) {
      const element = items[index] as HTMLElement;
      if (element.classList.contains('selected')) {
        element.classList.remove('startRange');
        element.classList.add('endRange');
        removeInRange = true;
        continue;
      }
      element.classList.toggle('inRange', !removeInRange);
      element.classList.remove('startRange');
      element.classList.remove('endRange');
    }
  }

  /**
   * Fixes range class for this calendar which has to be the 'previous' calendar aka the left one.
   * This method is called when the other calendar is hovered, to clean the CSS classes to have a good look.
   * The goal is to put every item from 'start' to the end of this calendar "in range".
   */
  public lastDayFocus(): void {
    const items = this._flatpickrInstance?.days?.children;
    if (!items) return;
    if (this._flatpickrInstance?.selectedDates.length !== 1) return;

    let inRange = true;

    if (
      this._flatpickrInstance?.selectedDates[0].getMonth() > this._flatpickrInstance?.currentMonth
    ) {
      inRange = false;
    }

    for (let index = items.length - 1; index >= 0; index--) {
      const element = items[index] as HTMLElement;
      if (element.classList.contains('selected')) {
        inRange = false;
        element.classList.remove('endRange');
        element.classList.add('startRange');
        continue;
      }
      element.classList.toggle('inRange', inRange);
      element.classList.remove('startRange');
      element.classList.remove('endRange');
    }
  }

  /**
   * Sets currently selected dates for this flatpickr.
   * @param dates - Selected dates from the other calendar. Empty array to remove selection, one-itemed array for an open range, two items for a full range.
   */
  public setSelectedDates(dates: Date[]): void {
    const cal = this._flatpickrInstance;
    if (!cal) return;

    const oldDate = new Date(cal.currentYear, cal.currentMonth);

    // Set the selected dates for flatpickr lib.
    // Does a jumpToDate() internally. If the dates array is empty, then it resets to have "today" visible.
    // Otherwise the last selected date (start or end of range) is made visible to the user. This will break our monthOffset system.
    cal.setDate(dates, false);

    // if (dates.length === 0) {
    //   cal.changeMonth(this.monthOffset() ?? 0, true);
    //   return;
    // }

    // Now we'll calculate whether we need to either cancel the jumpToDate that happened, or just reapply the month offset.
    // const newDate = dates[dates.length - 1] ?? new Date();

    // const oldTotalMonths = oldDate.getFullYear() * 12 + oldDate.getMonth();
    // const newTotalMonths = newDate.getFullYear() * 12 + newDate.getMonth();
    // const totalMonthDiff = Math.abs(oldTotalMonths - newTotalMonths) - (this.monthOffset() ?? 0);

    // console.log({
    //   MyOffset: 'My offset = ' + (this.monthOffset() ?? 0),
    //   oldDate,
    //   newDate,
    //   oldTotalMonths,
    //   newTotalMonths,
    //   totalMonthDiff,
    // });
    // const nbCalendars = 2;
    const resetToPreviouslyVisibleMonth = dates.length !== 0; // && totalMonthDiff <= nbCalendars;

    if (resetToPreviouslyVisibleMonth) {
      cal.jumpToDate(oldDate, false);
    } else {
      cal.changeMonth(this.monthOffset() ?? 0, true);
    }
  }

  private getMonthYearString(month: number, year: number, locale = 'default'): string {
    // Create a Date object for the 1st day of that month
    const date = new Date(year, month, 1);

    // Format with Intl API
    return new Intl.DateTimeFormat(locale, {
      month: 'long',
      year: 'numeric',
    }).format(date);
  }

  private updateLabel(): void {
    if (!this._flatpickrInstance) return;
    this._currentMonth.set(
      this.getMonthYearString(
        this._flatpickrInstance.currentMonth,
        this._flatpickrInstance.currentYear,
      ),
    );
  }
}
