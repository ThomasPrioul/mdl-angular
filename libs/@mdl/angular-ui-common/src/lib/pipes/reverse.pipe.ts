import { Pipe, PipeTransform } from '@angular/core';

/** Returns a reversed array. */
@Pipe({
  name: 'reverse',
  standalone: true,
  pure: true,
})
export class ReversePipe implements PipeTransform {
  /**
   * Returns a reversed array.
   * @param items - Source array.
   * @param reversed - Whether to reverse or not.
   * @returns Reversed array or source array.
   */
  public transform<T>(items: T[], reversed: boolean): T[] {
    return reversed ? [...items].reverse() : items;
  }
}
