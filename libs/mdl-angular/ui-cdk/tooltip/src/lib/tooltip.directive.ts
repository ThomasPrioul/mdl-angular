import {
  ConnectedPosition,
  Overlay,
  OverlayRef,
  PositionStrategy,
  STANDARD_DROPDOWN_ADJACENT_POSITIONS,
  STANDARD_DROPDOWN_BELOW_POSITIONS,
} from '@angular/cdk/overlay';
import { ComponentPortal } from '@angular/cdk/portal';
import {
  Directive,
  ElementRef,
  HostListener,
  Injector,
  OnDestroy,
  ViewContainerRef,
  inject,
  input,
} from '@angular/core';
import { NgClassLike } from '@mdl-angular/common';

import {
  TOOLTIP_DATA,
  TooltipContainerComponent,
  TooltipData,
} from './tooltip-container.component';

/**
 * Custom tooltip directive. Accepts an inline string or a template ref.
 */
@Directive({
  selector: '[mdlTooltip]',
  standalone: true,
})
export class TooltipDirective implements OnDestroy {
  private element = inject<ElementRef<HTMLElement>>(ElementRef);
  private overlay = inject(Overlay);
  private overlayRef: OverlayRef | null = null;
  private viewContainer = inject(ViewContainerRef);

  public readonly mdlTooltip = input<TooltipData>();
  public readonly positions = input<ConnectedPosition[]>([
    ...STANDARD_DROPDOWN_BELOW_POSITIONS,
    ...STANDARD_DROPDOWN_ADJACENT_POSITIONS,
  ]);
  public readonly tooltipClass = input<NgClassLike>();

  /** {@inheritdoc} */
  public ngOnDestroy(): void {
    this.overlayRef?.dispose();
  }

  private attachTooltip(): void {
    const mdlTooltip = this.mdlTooltip();
    if (!mdlTooltip) return;

    if (this.overlayRef === null) {
      const positionStrategy = this.getPositionStrategy();
      this.overlayRef = this.overlay.create({ positionStrategy });
    }

    const injector = Injector.create({
      providers: [
        {
          provide: TOOLTIP_DATA,
          useValue: mdlTooltip,
        },
      ],
    });
    const component = new ComponentPortal(TooltipContainerComponent, this.viewContainer, injector);
    const componentRef = this.overlayRef.attach(component);
    componentRef.instance.hostClasses = this.tooltipClass;
  }

  private getPositionStrategy(): PositionStrategy {
    return this.overlay
      .position()
      .flexibleConnectedTo(this.element)
      .withPositions(this.positions())
      .withPush();
  }

  @HostListener('mouseleave')
  @HostListener('blur')
  private hideTooltip(): void {
    if (this.overlayRef?.hasAttached() === true) {
      this.overlayRef?.detach();
    }
  }

  @HostListener('mouseenter')
  @HostListener('focus')
  private showTooltip(): void {
    if (this.overlayRef?.hasAttached() === true) {
      return;
    }

    this.attachTooltip();
  }
}
