import { Component, signal } from '@angular/core';
import { CommonModule, JsonPipe } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import {
  TimewindowComponent,
  TimeWindow,
  TIMEWINDOW_STRINGS,
  FrenchTimewindowStrings,
} from '@mdl-angular/ui-timewindow';
import { DateTime } from 'luxon';
import { today } from '../../app.config';
import { FormControl, FormGroup } from '@angular/forms';
type Settings = {
  start: DateTime<true> | DateTime<false>;
  end: DateTime<true> | DateTime<false>;
};

type FormGroupOf<Type> = FormGroup<
  {
    [Property in keyof Type as undefined extends Type[Property] ? Property : never]-?: FormControl<
      Type[Property] | undefined
    >;
  } & {
    [Property in keyof Type as undefined extends Type[Property] ? never : Property]: FormControl<
      Type[Property]
    >;
  }
>;

@Component({
  selector: 'app-ui-timewindow',
  standalone: true,
  imports: [TimewindowComponent, JsonPipe, CommonModule, ReactiveFormsModule],
  providers: [{ provide: TIMEWINDOW_STRINGS, useValue: FrenchTimewindowStrings }],
  templateUrl: './ui-timewindow.component.html',
  styleUrls: ['./ui-timewindow.component.css'],
})
export class UiTimewindowComponent {
  private dtFrom = today().set({
    hour: DateTime.now().hour - 1,
    minute: 0,
    second: 0,
    millisecond: 0,
  });
  private dtEnd = today().set({
    hour: DateTime.now().hour,
    minute: DateTime.now().minute + 1,
    second: 0,
    millisecond: 0,
  });
  protected readonly form: FormGroupOf<Settings> = new FormGroup({
    start: new FormControl<DateTime>(this.dtFrom, { nonNullable: true }),
    end: new FormControl<DateTime>(this.dtEnd, { nonNullable: true }),
  });
  selectedTimeWindow = signal<TimeWindow | null>(null);

  timewindow = signal<TimeWindow | null>(null);

  protected timewindowShowCase: TimeWindow = {
    mode: 'absolute',
    from: this.dtFrom.toJSDate(),
    to: this.dtEnd.toJSDate(),
  };

  predefinedTimeWindow = signal<TimeWindow>({
    mode: 'relative',
    duration: '24h',
    durationMs: 24 * 60 * 60 * 1000,
    live: true,
  });

  protected updateTimewindow(timewindow: TimeWindow | null) {
    if (!this.timewindowShowCase || this.timewindowShowCase.mode !== 'absolute') {
      this.form.controls.start.reset();
      this.form.controls.end.reset();
      return;
    }

    const startDate = DateTime.fromJSDate(this.timewindowShowCase.from);
    const endDate = DateTime.fromJSDate(this.timewindowShowCase.to);

    if (startDate.isValid) this.form.controls.start.setValue(startDate);
    if (endDate.isValid) this.form.controls.end.setValue(endDate);
  }
}
