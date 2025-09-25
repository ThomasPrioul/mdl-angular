/* eslint-disable jsdoc/require-description */
/* eslint-disable jsdoc/require-param-description */
/* eslint-disable tsdoc/syntax */
/* eslint-disable jsdoc/require-returns */
/* eslint-disable jsdoc/require-jsdoc */
import { ɵRuntimeError as RuntimeError } from '@angular/core';

export const ISO8601_DATE_REGEX =
  /^(\d{4,})-?(\d\d)-?(\d\d)(?:T(\d\d)(?::?(\d\d)(?::?(\d\d)(?:\.(\d+))?)?)?(Z|([+-])(\d\d):?(\d\d))?)?$/;

/**
 * Create a new Date object with the given date value, and the time set to midnight.
 *
 * We cannot use `new Date(year, month, date)` because it maps years between 0 and 99 to 1900-1999.
 * See: https://github.com/angular/angular/issues/40377.
 *
 * Note that this function returns a Date object whose time is midnight in the current locale's
 * timezone. In the future we might want to change this to be midnight in UTC, but this would be a
 * considerable breaking change.
 * @param year
 * @param month
 * @param date
 */
function createDate(year: number, month: number, date: number): Date {
  // The `newDate` is set to midnight (UTC) on January 1st 1970.
  // - In PST this will be December 31st 1969 at 4pm.
  // - In GMT this will be January 1st 1970 at 1am.
  // Note that they even have different years, dates and months!
  const newDate = new Date(0);

  // `setFullYear()` allows years like 0001 to be set correctly. This function does not
  // change the internal time of the date.
  // Consider calling `setFullYear(2019, 8, 20)` (September 20, 2019).
  // - In PST this will now be September 20, 2019 at 4pm
  // - In GMT this will now be September 20, 2019 at 1am

  newDate.setFullYear(year, month, date);
  // We want the final date to be at local midnight, so we reset the time.
  // - In PST this will now be September 20, 2019 at 12am
  // - In GMT this will now be September 20, 2019 at 12am
  newDate.setHours(0, 0, 0);

  return newDate;
}

/**
 * @param value
 */
export function isDate(value: unknown): value is Date {
  return value instanceof Date && !isNaN(value.valueOf());
}

/**
 * Converts a date in ISO8601 to a Date.
 * Used instead of `Date.parse` because of browser discrepancies.
 * @param match
 */
export function isoStringToDate(match: RegExpMatchArray): Date {
  const date = new Date(0);
  let tzHour = 0;
  let tzMin = 0;

  // match[8] means that the string contains "Z" (UTC) or a timezone like "+01:00" or "+0100"
  const dateSetter = match[8] ? date.setUTCFullYear : date.setFullYear;
  const timeSetter = match[8] ? date.setUTCHours : date.setHours;

  // if there is a timezone defined like "+01:00" or "+0100"
  if (match[9]) {
    tzHour = Number(match[9] + match[10]);
    tzMin = Number(match[9] + match[11]);
  }
  dateSetter.call(date, Number(match[1]), Number(match[2]) - 1, Number(match[3]));
  const h = Number(match[4] || 0) - tzHour;
  const m = Number(match[5] || 0) - tzMin;
  const s = Number(match[6] || 0);
  // The ECMAScript specification (https://www.ecma-international.org/ecma-262/5.1/#sec-15.9.1.11)
  // defines that `DateTime` milliseconds should always be rounded down, so that `999.9ms`
  // becomes `999ms`.
  const ms = Math.floor(parseFloat('0.' + (match[7] || 0)) * 1000);
  timeSetter.call(date, h, m, s, ms);
  return date;
}

/**
 * Converts a value to date.
 *
 * Supported input formats:
 * - `Date`
 * - number: timestamp
 * - string: numeric (e.g. "1234"), ISO and date strings in a format supported by
 *   [Date.parse()](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date/parse).
 *   Note: ISO strings without time return a date without timeoffset.
 *
 * Throws if unable to convert to a date.
 * @param value
 */
export function toDate(value: string | number | Date): Date {
  if (isDate(value)) {
    return value;
  }

  if (typeof value === 'number' && !isNaN(value)) {
    return new Date(value);
  }

  if (typeof value === 'string') {
    value = value.trim();

    if (/^(\d{4}(-\d{1,2}(-\d{1,2})?)?)$/.test(value)) {
      /* For ISO Strings without time the day, month and year must be extracted from the ISO String
        before Date creation to avoid time offset and errors in the new Date.
        If we only replace '-' with ',' in the ISO String ("2015,01,01"), and try to create a new
        date, some browsers (e.g. IE 9) will throw an invalid Date error.
        If we leave the '-' ("2015-01-01") and try to create a new Date("2015-01-01") the timeoffset
        is applied.
        Note: ISO months are 0 for January, 1 for February, ... */
      const [y, m = 1, d = 1] = value.split('-').map((val: string) => +val);
      return createDate(y, m - 1, d);
    }

    const parsedNb = parseFloat(value);

    // any string that only contains numbers, like "1234" but not like "1234hello"
    if (!isNaN((value as unknown as number) - parsedNb)) {
      return new Date(parsedNb);
    }

    let match: RegExpMatchArray | null;
    if ((match = value.match(ISO8601_DATE_REGEX))) {
      return isoStringToDate(match);
    }
  }

  const date = new Date(value);
  if (!isDate(date)) {
    throw new RuntimeError(
      2302, //RuntimeErrorCode.INVALID_TO_DATE_CONVERSION,
      // eslint-disable-next-line no-undef
      ngDevMode && `Unable to convert "${value}" into a date`,
    );
  }
  return date;
}

/**
 * Compares two nullable dates for equality.
 * @param a - First date to compare.
 * @param b - Second date to compare.
 */
export function compareNullableDates(a: Date | null, b: Date | null): boolean {
  return a?.valueOf() === b?.valueOf();
}

/**
 * Compares two dates for equality.
 * @param a - First date to compare.
 * @param b - Second date to compare.
 */
export function compareDates(a: Date, b: Date): boolean {
  return a.valueOf() === b.valueOf();
}
