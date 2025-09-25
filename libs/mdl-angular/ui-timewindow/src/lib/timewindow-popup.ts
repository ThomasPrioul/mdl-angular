import { A11yModule } from '@angular/cdk/a11y';
import { BreakpointObserver } from '@angular/cdk/layout';
import { OverlayModule } from '@angular/cdk/overlay';
import { Platform } from '@angular/cdk/platform';
import { DatePipe, KeyValue, KeyValuePipe, NgTemplateOutlet } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  computed,
  inject,
  input,
  output,
  viewChildren,
} from '@angular/core';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import {
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  ValidatorFn,
} from '@angular/forms';

import { distinctUntilChanged, map, merge, startWith, tap } from 'rxjs';

import {
  DateValueAccessorDirective,
  TimeInDateValueAccessorDirective,
  compareNullableDates,
  maxDateValidator,
  minDateValidator,
  startEndDateSiblingValidator,
} from '@mdl-angular/common';
import { CalendarDirective } from './calendar';
import { FrenchTimewindowStrings, TIMEWINDOW_STRINGS } from './i18n';
import {
  TimeRangeString,
  TimeUnit,
  TimeWindow,
  parseTimeRangeString,
  timeRangeStringToMs,
} from './model';

export type RangeSelectorMode = 'absolute' | 'relative';

export type RelativeModeOption = {
  durationMs: number;
  label: string;
};

/**
 * Time window popup component (opened by timewindow component).
 * Allows setting date/time ranges in a user-friendly way.
 */
@Component({
  selector: 'mdl-timewindow-popup',
  imports: [
    // ng core
    DatePipe,
    KeyValuePipe,
    NgTemplateOutlet,

    // ng forms
    FormsModule,
    ReactiveFormsModule,

    // CDK
    OverlayModule,
    A11yModule,

    // Lib shared
    DateValueAccessorDirective,
    TimeInDateValueAccessorDirective,

    // Lib specific
    CalendarDirective,
  ],
  templateUrl: './timewindow-popup.html',
  styleUrl: './timewindow-popup.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TimewindowPopupComponent implements OnInit {
  private readonly calendars = viewChildren<CalendarDirective>(CalendarDirective);
  private readonly parseTimeRangeString = parseTimeRangeString;

  protected readonly _form = new FormGroup({
    mode: new FormControl<RangeSelectorMode>('relative', { nonNullable: true }),

    // Champs pour le mode 'relative'
    rangeKey: new FormControl<TimeRangeString | ''>('', { nonNullable: true }),
    live: new FormControl<boolean>(true, { nonNullable: true }),
    duration: new FormControl<number | null>(null),
    timeUnit: new FormControl<TimeUnit>('s', { nonNullable: true }),

    // Champs pour le mode 'absolute'
    from: new FormControl<Date | null>(null),
    to: new FormControl<Date | null>(null),
  });
  protected readonly _locale =
    inject(TIMEWINDOW_STRINGS, { optional: true }) ?? FrenchTimewindowStrings;
  protected readonly _maxDateCurated = computed(() => {
    const maxDate = this.maxDate();
    if (!maxDate) return undefined;

    const date = new Date(maxDate);
    date.setHours(23, 59, 59, 999);
    return date;
  });
  protected readonly _minDateCurated = computed(() => {
    const minDate = this.minDate();
    if (!minDate) return undefined;

    const date = new Date(minDate);
    date.setHours(0, 0, 0, 0);
    return date;
  });
  protected readonly _relativeOptions = computed(() => {
    return this.relativeOptions() as Record<TimeRangeString, RelativeModeOption> | undefined;
  });
  protected readonly breakpoints = inject(BreakpointObserver);

  /** Whether the user can reset the form values. */
  protected readonly canReset = toSignal(
    this._form.valueChanges.pipe(
      map((val) => {
        return val.mode === 'relative'
          ? val.rangeKey === ''
            ? this._form.controls.duration.value || this._form.controls.timeUnit.value !== 's'
            : this._form.controls.rangeKey.dirty
          : !!val.from || !!val.to;
      }),
    ),
    {
      initialValue: false,
    },
  );
  protected readonly fromDate = toSignal(this._form.controls.from.valueChanges);
  protected readonly toDate = toSignal(this._form.controls.to.valueChanges);
  protected readonly maxDateForStartRange = computed(() => {
    const maxDateIn = this.maxDate();
    const maxDateDyn = this.toDate();
    if (!maxDateIn && !maxDateDyn) return null;
    if (!maxDateDyn) return maxDateIn;
    if (!maxDateIn) return maxDateDyn;
    return new Date(Math.min(maxDateIn.valueOf(), maxDateDyn.valueOf()));
  });
  protected readonly minDateForEndRange = computed(() => {
    const minDateIn = this.minDate();
    const minDateDyn = this.fromDate();
    if (!minDateIn && !minDateDyn) return null;
    if (!minDateDyn) return minDateIn;
    if (!minDateIn) return minDateDyn;
    return new Date(Math.max(minDateIn.valueOf(), minDateDyn.valueOf()));
  });
  protected readonly modelToView = {
    onlySelf: true,
    emitEvent: true,
    emitModelToViewChange: true,
    emitViewToModelChange: false,
  };
  protected readonly platform = inject(Platform);

  public readonly closed = output<TimeWindow | null>();
  public readonly dateOnly = input<boolean>(false);
  public readonly initialValue = input<TimeWindow | null>(null);
  public readonly maxDate = input<Date>();
  public readonly minDate = input<Date>();
  public readonly rangeSelectorMode = input<RangeSelectorMode>();
  public readonly relativeOptions = input<Partial<Record<TimeRangeString, RelativeModeOption>>>();
  public readonly roundMinMaxDate = input<boolean>(false);

  /** Whether the reset/clear button is visible. */
  public readonly showClearButton = input<boolean>(true);
  public readonly showNextYearButtons = input<boolean>(true);

  /** Triggered when size changed and the parent may find this of interest (resizing an overlay for example). */
  public readonly sizeChanged = output();
  public readonly step = input<number>(1);

  constructor() {
    this._form.controls.duration.disable();
    this._form.controls.timeUnit.disable();

    this.setupFormManagement();
    this.setupSizeChangedEvent();
    this.setupModelToCalendarViewSync();
  }

  /** {@inheritdoc} */
  public ngOnInit(): void {
    this.setupFormInitialState();
    this.setupMinMaxValidators();
  }

  protected changeMonth(offset: -1 | 1 | -12 | 12): void {
    const calendars = [...this.calendars()];

    if (offset > 0) calendars.reverse();

    for (const calendar of calendars) {
      if (!calendar.changeMonth(offset)) break;
    }
  }

  protected clearValues(): void {
    this._form.reset({
      mode: this._form.value.mode,
    });
  }

  protected closedWithResult(): void {
    if (this._form.invalid) return;
    if (this._form.controls.mode.value === 'absolute') {
      this.closed.emit({
        mode: 'absolute',
        from: this._form.controls.from.value!,
        to: this._form.controls.to.value!,
      });
    } else {
      const timeRangeStr =
        this._form.controls.rangeKey.value !== ''
          ? this._form.controls.rangeKey.value
          : (`${this._form.controls.duration.value}${this._form.controls.timeUnit.value}` as TimeRangeString);
      this.closed.emit({
        mode: 'relative',
        duration: timeRangeStr,
        durationMs: timeRangeStringToMs(timeRangeStr),
        live: this._form.controls.live.value,
      });
    }
  }

  protected compareByDurationDesc(
    a: KeyValue<TimeRangeString, unknown>,
    b: KeyValue<TimeRangeString, unknown>,
  ): number {
    return b.key.localeCompare(a.key);
    // return b.value.durationMs - a.value.durationMs;
  }

  /**
   * Handles date changed event from the flatpickr calendars to reflect them in the formGroup.
   * @param selectedDates - Selected dates array from the flatpickr instance.
   */
  protected handleDateChanged(selectedDates: Date[]): void {
    let fromDate: Date | undefined = selectedDates[0];
    if (fromDate) {
      const oldFromValue = this._form.controls.from.value;
      fromDate = new Date(fromDate);
      if (oldFromValue && !this.dateOnly()) {
        fromDate.setHours(
          oldFromValue.getHours(),
          oldFromValue.getMinutes(),
          oldFromValue.getSeconds(),
        );
      } else {
        fromDate.setHours(0, 0, 0, 0);
      }
    }

    let toDate: Date | undefined = selectedDates[1];
    if (toDate) {
      const oldToValue = this._form.controls.to.value;
      toDate = new Date(toDate);
      if (oldToValue && !this.dateOnly()) {
        toDate.setHours(oldToValue.getHours(), oldToValue.getMinutes(), oldToValue.getSeconds());
      } else {
        toDate.setHours(23, 59, 59, 999);
      }
    }

    this._form.patchValue({
      from: fromDate ?? null,
      to: toDate ?? null,
    });
  }

  /**
   * Sets the date control accordingly.
   * @param control - Form control.
   * @param dateStr - Date string (from the input).
   * @param endDate - Whether to set to 23:59:59 or 00:00:00 when there is no previous value.
   */
  protected setDate(control: FormControl<Date | null>, dateStr: string, endDate?: true): void {
    const oldValue = control.value;
    const newValue = new Date(dateStr);
    if (oldValue) {
      newValue.setHours(
        oldValue.getHours(),
        oldValue.getMinutes(),
        oldValue.getSeconds(),
        oldValue.getMilliseconds(),
      );
    } else {
      if (endDate) {
        newValue.setHours(23, 59, 59, 999);
      } else {
        newValue.setHours(0, 0, 0, 0);
      }
    }

    control.setValue(newValue);
  }

  /**
   * Sets the time control accordingly.
   * @param control - Form control.
   * @param timeStr - Time string (from the input).
   */
  protected setTime(control: FormControl<Date | null>, timeStr: string): void {
    const value = control.value ? new Date(control.value) : new Date();
    const timeTokens = timeStr
      .split(':')
      .map((i) => parseInt(i))
      .filter((i) => Number.isSafeInteger(i));

    value.setHours(timeTokens[0] ?? 0, timeTokens[1] ?? 0, timeTokens[2] ?? 0);
    control.setValue(value);
  }

  private setupFormInitialState(): void {
    const rangeSelectorMode = this.rangeSelectorMode();
    if (rangeSelectorMode !== undefined) {
      this._form.controls.mode.reset(rangeSelectorMode, { emitEvent: false });
    }

    const value = this.initialValue();
    if (!value) return;
    if (value.mode === 'relative') {
      const { duration, unit } = this.parseTimeRangeString(value.duration);
      const options = this.relativeOptions();
      if (!options || !Object.keys(options).includes(value.duration)) {
        this._form.reset({
          ...value,
          rangeKey: '',
          duration: parseInt(duration),
          timeUnit: unit,
        });
      } else {
        this._form.reset({
          ...value,
          rangeKey: value.duration,
          duration: null,
          timeUnit: 's',
        });
      }
    } else {
      this._form.reset(value, { emitEvent: false });
    }
  }

  private setupFormManagement(): void {
    this._form.controls.mode.valueChanges
      .pipe(
        takeUntilDestroyed(),
        tap((mode) => {
          if (mode === 'absolute') {
            this._form.controls.rangeKey.disable();
            this._form.controls.duration.disable();
            this._form.controls.timeUnit.disable();
            this._form.controls.live.disable();

            this._form.controls.from.enable();
            this._form.controls.to.enable();
          } else if (mode === 'relative') {
            this._form.controls.rangeKey.enable();
            this._form.controls.live.enable();

            this._form.controls.from.disable();
            this._form.controls.to.disable();
          }
        }),
      )
      .subscribe();

    merge(this._form.controls.rangeKey.valueChanges, this._form.controls.rangeKey.statusChanges)
      .pipe(
        takeUntilDestroyed(),
        startWith({}),
        tap(() => {
          if (this._form.controls.rangeKey.value !== '') {
            this._form.controls.duration.disable();
            this._form.controls.timeUnit.disable();
          } else {
            this._form.controls.duration.enable();
            this._form.controls.timeUnit.enable();
            this._form.updateValueAndValidity();
          }
        }),
      )
      .subscribe();

    this._form.controls.to.valueChanges
      .pipe(
        takeUntilDestroyed(),
        tap(() =>
          this._form.controls.from.setValue(this._form.controls.from.value, this.modelToView),
        ),
      )
      .subscribe();
  }

  private setupMinMaxValidators(): void {
    const validators: ValidatorFn[] = [];
    const minDate = this.minDate();
    const maxDate = this.maxDate();

    if (minDate) {
      validators.push(
        minDateValidator(
          this.dateOnly() || this.roundMinMaxDate() ? this._minDateCurated()! : minDate,
        ),
      );
    }

    if (maxDate) {
      validators.push(
        maxDateValidator(
          this.dateOnly() || this.roundMinMaxDate() ? this._maxDateCurated()! : maxDate,
        ),
      );
    }

    this._form.controls.from.addValidators(validators);
    this._form.controls.to.addValidators(validators);

    this._form.controls.from.addValidators(startEndDateSiblingValidator(this._form.controls.to));
    this._form.updateValueAndValidity();
  }

  private setupModelToCalendarViewSync(): void {
    merge(
      this._form.controls.from.valueChanges.pipe(distinctUntilChanged(compareNullableDates)),
      this._form.controls.to.valueChanges.pipe(distinctUntilChanged(compareNullableDates)),
    )
      .pipe(
        tap(() => {
          const calendars = this.calendars();
          if (calendars.length === 0) return;

          let dates: Date[] = [];
          const fromValue = this._form.controls.from.value;
          const toValue = this._form.controls.to.value;
          if (fromValue) dates.push(fromValue);
          if (toValue) dates.push(toValue);

          if (fromValue && toValue && fromValue.valueOf() > toValue.valueOf()) dates = [];

          for (const calendar of calendars) {
            calendar.setSelectedDates(dates);
          }
        }),
        takeUntilDestroyed(),
      )
      .subscribe();
  }

  private setupSizeChangedEvent(): void {
    merge(this._form.controls.mode.valueChanges, this._form.controls.rangeKey.valueChanges)
      .pipe(
        takeUntilDestroyed(),
        tap(() => this.sizeChanged.emit()),
      )
      .subscribe();
  }
}
