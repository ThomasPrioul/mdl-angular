import { Directive, ElementRef, HostListener, forwardRef, inject } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

/**
 * Import this directive to be able to convert back and forth in a form model between an input[type=time] and the time part of a Date object.
 */
@Directive({
  selector:
    // eslint-disable-next-line @angular-eslint/directive-selector
    'input[type=time][formControlName][timeInDate],input[type=time][formControl][timeInDate]',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => TimeInDateValueAccessorDirective),
      multi: true,
    },
  ],
})
export class TimeInDateValueAccessorDirective implements ControlValueAccessor {
  private readonly elementRef: ElementRef<HTMLInputElement> = inject(ElementRef);

  private currentDate: Date | null = null;

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  public onChange: (value: Date | null) => void = () => {};

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  public onTouched: () => void = () => {};

  /**
   * On blur, mark as touched.
   */
  @HostListener('blur')
  public onBlur(): void {
    this.onTouched();
  }

  /**
   * Handles raw input event (view to model).
   * @param target - event target.
   */
  @HostListener('input', ['$event.target'])
  public onInput(target: unknown): void {
    const newDate = this.parseTime((target as HTMLInputElement).value);
    this.onChange(newDate);
  }

  /**
   * Register on change method.
   * @param fn - function pointer.
   */
  public registerOnChange(fn: (value: Date | null) => void): void {
    this.onChange = fn;
  }

  /**
   * Register on touched method.
   * @param fn - function pointer.
   */
  public registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  /**
   * Model to view handler.
   * @param value - model value.
   */
  public writeValue(value: Date | null): void {
    this.currentDate = value instanceof Date ? new Date(value) : null;
    if (value instanceof Date) {
      this.elementRef.nativeElement.value = this.formatTime(value);
    } else {
      this.elementRef.nativeElement.value = '';
    }
  }

  private formatTime(date: Date): string {
    let hours = '' + date.getHours();
    let minutes = '' + date.getMinutes();

    if (hours.length < 2) hours = '0' + hours;
    if (minutes.length < 2) minutes = '0' + minutes;

    if (parseInt(this.elementRef.nativeElement.step) < 60) {
      let seconds = '' + date.getSeconds();
      if (seconds.length < 2) seconds = '0' + seconds;
      return `${hours}:${minutes}:${seconds}`;
    }

    return `${hours}:${minutes}`;
  }

  private parseTime(timeString: string): Date | null {
    if (!timeString) return null;

    const parts = timeString.split(':');

    const hours = parseInt(parts[0], 10);
    const minutes = parseInt(parts[1] ?? '0', 10);
    const seconds = parseInt(parts[2] ?? '0', 10);

    if (isNaN(hours) || isNaN(minutes) || isNaN(seconds)) return null;
    if (hours < 0 || hours > 23 || minutes < 0 || minutes > 59 || seconds < 0 || seconds > 59) {
      return null;
    }

    if (this.currentDate) {
      const newDate = new Date(this.currentDate);
      newDate.setHours(hours, minutes, seconds, 0);
      return newDate;
    } else {
      const now = new Date();
      const newDate = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate(),
        hours,
        minutes,
        seconds,
        hours === 23 && minutes === 59 && seconds === 59 ? 59 : 0, // Snap to midnight in that special case
      );
      return newDate;
    }
  }
}
