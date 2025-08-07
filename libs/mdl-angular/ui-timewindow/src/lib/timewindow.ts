import { A11yModule } from '@angular/cdk/a11y';
import { BreakpointObserver } from '@angular/cdk/layout';
import {
  CdkConnectedOverlay,
  ConnectedPosition,
  OverlayModule,
  STANDARD_DROPDOWN_BELOW_POSITIONS,
} from '@angular/cdk/overlay';
import { DatePipe } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  // DOCUMENT,
  ElementRef,
  HostListener,
  inject,
  input,
  model,
  viewChild,
} from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { map } from 'rxjs';

import { TimeRangeString, TimeWindow } from './model';
import {
  RangeSelectorMode,
  RelativeModeOption,
  TimewindowPopupComponent,
} from './timewindow-popup';

/**
 * Time window component. Allows setting date/time ranges in a user-friendly way.
 */
@Component({
  // eslint-disable-next-line @angular-eslint/component-selector
  selector: 'button[mdl-timewindow]',
  imports: [
    ReactiveFormsModule,
    FormsModule,
    OverlayModule,
    A11yModule,
    TimewindowPopupComponent,
    DatePipe,
  ],
  templateUrl: './timewindow.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TimewindowComponent {
  private readonly overlay = viewChild.required<CdkConnectedOverlay>(CdkConnectedOverlay);

  protected readonly CENTER_SCREEN: ConnectedPosition[] = [
    {
      originX: 'center',
      originY: 'center',
      overlayX: 'center',
      overlayY: 'center',
    },
  ];
  protected readonly STANDARD_DROPDOWN_BELOW_POSITIONS = STANDARD_DROPDOWN_BELOW_POSITIONS;
  protected readonly breakpoints = inject(BreakpointObserver);
  protected readonly el = inject(ElementRef);
  protected readonly isSmallScreen = toSignal(
    this.breakpoints.observe(['(max-width: 48rem)']).pipe(map((b) => b.matches)),
  );
  protected readonly screenElementRef = new ElementRef(document.documentElement); //inject(DOCUMENT)

  protected isOpen = false;

  public readonly dateOnly = input<boolean>(false);
  public readonly maxDate = input<Date>();
  public readonly minDate = input<Date>();
  public readonly model = model<TimeWindow | null>(null);
  public readonly rangeSelectorMode = input<RangeSelectorMode>();
  public readonly relativeOptions = input<Partial<Record<TimeRangeString, RelativeModeOption>>>();

  /** Whether the reset/clear button is visible. */
  public readonly showClearButton = input<boolean>(true);
  public readonly showNextYearButtons = input<boolean>(true);

  /** Step attribute value for time inputs. Defaults to 1 (up to second precision). */
  public readonly step = input<number>(1);

  /** Click handler. */
  @HostListener('click')
  public onClick(): void {
    this.isOpen = true;
  }

  protected needsRepositioning(): void {
    setTimeout(() => this.overlay().overlayRef.updatePosition());
  }

  protected popupClosed(result: TimeWindow | null): void {
    this.isOpen = false;
    if (!result) return;
    this.model.set(result);
  }
}
