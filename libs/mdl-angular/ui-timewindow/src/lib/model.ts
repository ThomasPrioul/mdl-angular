/** Represents an absolute time window. */
export type AbsoluteTimeWindow = {
  from: Date;
  mode: 'absolute';
  to: Date;
};

/**
 * Represents a relative time window. Left/start bound is expressed relative to the end/right bound. Right bound is "now" by default.
 * The indication of "live" means right bound should be refreshed permanently by user code.
 */
export type RelativeTimeWindow = {
  /** Duration string expressing the range in the form <number><timeUnit>, with <timeUnit> of type @see TimeUnit. */
  duration: TimeRangeString;

  /** Equivalent in milliseconds of the duration. */
  durationMs: number;

  /** Whether this range is "live" and should move with the current time. */
  live: boolean;

  mode: 'relative';
};

/** Represents a time window, whether an absolute one or relative to the current time (right bound = now). */
export type TimeWindow = AbsoluteTimeWindow | RelativeTimeWindow;

export type Digit = '0' | NonZeroDigit;

export type NonZeroDigit = '1' | '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9';

/** Represents a time range string in the form of a duration followed by a unit. @see TimeUnit */
export type TimeRangeString = `${NonZeroDigit}${TimeUnit}` | `${NonZeroDigit}${Digit}${TimeUnit}`;

export type TimeUnit = 's' | 'm' | 'h' | 'd' | 'w' | 'M' | 'y';

const timeRangeRegex = /(?<duration>\d+)(?<unit>[smhdwMy])/g;

/**
 * Parses a time range string into the separated duration and unit.
 * @param value - The time range string, @see TimeRangeString.
 * @returns The separated items.
 */
export function parseTimeRangeString(value: TimeRangeString): {
  duration: string;
  unit: TimeUnit;
} {
  return new RegExp(timeRangeRegex).exec(value)?.groups as {
    duration: string;
    unit: TimeUnit;
  };
}

/**
 * Calculates milliseconds from a time range string.
 * @param value - Original time range str.
 * @returns duration in milliseconds.
 */
export function timeRangeStringToMs(value: TimeRangeString): number {
  const { duration, unit } = parseTimeRangeString(value);
  const durationMs = parseInt(duration);
  switch (unit) {
    case 's':
      return durationMs * 1000;
    case 'm':
      return durationMs * 60000;
    case 'h':
      return durationMs * 3600000;
    case 'd':
      return durationMs * 86400000;
    case 'w':
      return durationMs * 7 * 86400000;
    case 'M':
      return durationMs * 30 * 86400000;
    case 'y':
      return durationMs * 365 * 86400000;
  }
}
