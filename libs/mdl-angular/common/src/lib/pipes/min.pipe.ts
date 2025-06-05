import { Pipe, PipeTransform } from "@angular/core";

/** Uses Math.min method. */
@Pipe({
  name: 'min',
  standalone: true,
  pure: true,
})
export class MinPipe implements PipeTransform {
  /**
   * Returns the Math.min() of given inputs.
   * @param value - First number.
   * @param args - Other numbers.
   * @returns Minimum of all inputs.
   */
  public transform(value: number, ...args: number[]): number {
    return Math.min(value, ...args);
  }
}