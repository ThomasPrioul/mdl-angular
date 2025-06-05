import { NgTemplateOutlet } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  HostBinding,
  InjectionToken,
  TemplateRef,
  inject,
  input,
} from '@angular/core';

import { NgClassLike } from 'mdl-angular/common';

/** Tooltip content, either a string or a template ref. */
export const TOOLTIP_DATA = new InjectionToken<TooltipData>('Data to display in tooltip');

export type TooltipData = string | TemplateRef<void>;

/** Container for the content of a tooltip. */
@Component({
  selector: 'mdl-tooltip-container',
  templateUrl: './tooltip-container.component.html',
  styleUrls: ['./tooltip-container.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [NgTemplateOutlet],
})
export class TooltipContainerComponent {
  protected tooltipData = inject<TooltipData>(TOOLTIP_DATA);

  public hostClasses = input<NgClassLike>();

  @HostBinding('class')
  private get _hostClasses(): NgClassLike {
    return this.hostClasses();
  }

  protected isString(value: TooltipData): value is string {
    return typeof value === 'string';
  }

  protected isTemplate(value: TooltipData): value is TemplateRef<void> {
    return this.tooltipData instanceof TemplateRef;
  }
}
