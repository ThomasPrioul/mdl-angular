import { AbstractControl, FormGroup, ValidationErrors, ValidatorFn } from '@angular/forms';

/**
 * Checks if control value is superior to date in parameter.
 * @param maxDate - Minimum acceptable date.
 * @returns Validator function.
 */
export function maxDateValidator(maxDate: Date): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    if (control.value === null) return null;
    const date = new Date(control.value);
    if (date.valueOf() <= maxDate.valueOf()) return null;
    return { max: { actual: control.value, max: maxDate } };
  };
}

/**
 * Checks if control value is inferior to date in parameter.
 * @param minDate - Minimum acceptable date.
 * @returns Validator function.
 */
export function minDateValidator(minDate: Date): ValidatorFn {
  return (control: AbstractControl) => {
    if (control.value === null) return null;
    const date = new Date(control.value);
    if (date.valueOf() >= minDate.valueOf()) return null;
    const obj = { min: { actual: control.value, min: minDate } };
    return obj;
  };
}

/**
 * Checks that a date range form has valid values (eg start of range inferior to end of range).
 * @param startCtrlPath - Path to date range start formControl.
 * @param endCtrlPath - Path to date range end formControl.
 * @returns Validator function.
 */
export function startEndDateGroupValidator(
  startCtrlPath: string,
  endCtrlPath: string,
): ValidatorFn {
  return (control: AbstractControl) => {
    const start = control.get(startCtrlPath);
    const end = control.get(endCtrlPath);

    if (!start || !end) throw new Error('Did not find sub form controls');

    const startValue: Date | null = start.value;
    const endValue: Date | null = end.value;

    if (startValue === null || endValue === null) return null;
    if (startValue.valueOf() > endValue.valueOf()) return { minmax: {} };
    return null;
  };
}

/**
 * Checks that a date range form has valid values (eg start of range inferior to end of range). This validator is used directly on the control hosting the start of range.
 * @param endCtrl - Path to date range end formControl in the parent formGroup, or the control itself if available.
 * @returns Validator function.
 */
export function startEndDateSiblingValidator(endCtrl: string | AbstractControl): ValidatorFn {
  return (start: AbstractControl) => {
    const end = typeof endCtrl === 'string' ? (start.parent as FormGroup).get(endCtrl) : endCtrl;

    if (!start || !end) throw new Error('Did not find sub form controls');

    const startValue: Date | null = start.value;
    const endValue: Date | null = end.value;

    if (startValue === null || endValue === null) return null;
    if (startValue.valueOf() > endValue.valueOf()) return { minmax: {} };
    return null;
  };
}
