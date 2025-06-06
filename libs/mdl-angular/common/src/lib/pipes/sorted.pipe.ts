import { Pipe, PipeTransform } from '@angular/core';

/** Sorts a shallow copy of an array. */
@Pipe({
  name: 'sorted',
  standalone: true,
})
export class MdlSortedArrayPipe implements PipeTransform {
  /**
   * Sorts an array with the given sort method.
   * @param value - Array to sort.
   * @param compareFn - Comparison function, optional.
   * @returns The cloned array as a result of the sort.
   */
  public transform<T>(
    value: T[],
    compareFn?: ((a: T, b: T) => number) | undefined,
  ): T[] {
    return [...value].sort(compareFn);
  }
}
