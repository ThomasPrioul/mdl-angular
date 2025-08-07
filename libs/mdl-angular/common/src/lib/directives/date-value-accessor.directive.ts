import { Directive, ElementRef, HostListener, forwardRef, inject, input } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

/**
 * Import this directive to be able to convert back and forth in a form model between an input[type=date] and a Date object.
 */
@Directive({
  selector:
    // eslint-disable-next-line @angular-eslint/directive-selector
    'input[type=date][formControlName],input[type=date][formControl],input[type=datetime-local][formControlName],input[type=datetime-local][formControl]',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => DateValueAccessorDirective),
      multi: true,
    },
  ],
})
export class DateValueAccessorDirective implements ControlValueAccessor {
  private readonly elementRef = inject(ElementRef<HTMLInputElement>);

  public readonly snapEnd = input<boolean>(false);

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
    const value = (target as HTMLInputElement).value;
    const value_tokens = value.split(/[-T:]/g, 6);
    const date = value
      ? new Date(
          parseInt(value_tokens[0]),
          parseInt(value_tokens[1]) - 1,
          parseInt(value_tokens[2]),
          parseInt(value_tokens[3] ?? '0'),
          parseInt(value_tokens[4] ?? '0'),
          parseInt(value_tokens[5] ?? '0'),
        )
      : null;
    if (date && this.snapEnd()) {
      date.setHours(23, 59, 59, 999);
    }

    this.onChange(date);
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
    if (value) {
      this.elementRef.nativeElement.value = this.formatDate(value);
    } else {
      this.elementRef.nativeElement.value = '';
    }
  }

  private formatDate(date: Date): string {
    const d = new Date(date);
    let month = '' + (d.getMonth() + 1);
    let day = '' + d.getDate();
    const year = d.getFullYear();

    if (month.length < 2) month = '0' + month;
    if (day.length < 2) day = '0' + day;

    return `${year}-${month}-${day}`;
  }
}
