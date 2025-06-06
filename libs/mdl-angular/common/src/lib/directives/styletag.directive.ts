import {
  Directive,
  ElementRef,
  Input,
  OnChanges,
  SimpleChanges,
  inject,
} from '@angular/core';

/** Allows inserting a CSS block as a child of a DOM element.*/
@Directive({
  selector: '[mdlStyleTag]',
  standalone: true,
})
export class MdlStyleTagDirective implements OnChanges {
  private elementRef: ElementRef<HTMLElement> = inject(ElementRef<HTMLElement>);

  @Input() public mdlStyleTag?: string;

  /**
   * {@inheritdoc}
   * @param simpleChanges
   */
  public ngOnChanges(simpleChanges: SimpleChanges): void {
    const cssChanges = simpleChanges['mdlStyleTag'];
    if (!cssChanges) return;

    const oldStyle = this.elementRef.nativeElement.querySelector('style');
    if (oldStyle && !cssChanges.currentValue) {
      this.elementRef.nativeElement.removeChild(oldStyle);
    }

    if (cssChanges.currentValue) {
      if (oldStyle) {
        oldStyle.replaceChildren(
          document.createTextNode(cssChanges.currentValue),
        );
      } else {
        const styleElement = document.createElement('style');
        styleElement.appendChild(
          document.createTextNode(cssChanges.currentValue),
        );
        this.elementRef.nativeElement.appendChild(styleElement);
      }
    }
  }
}
