import { Component, model } from '@angular/core';
import { FormValueControl } from '@angular/forms/signals';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { Timeframe, timeframes } from '@shared/models/timeframe';

@Component({
  selector: 'app-timeframe-select',
  imports: [MatFormFieldModule, MatSelectModule],
  template: `
    <mat-form-field>
      <mat-label>Timeframe</mat-label>
      <mat-select [value]="value()" (selectionChange)="value.set($event.value)" multiple>
        @for (timeframe of timeframes; track timeframe) {
          <mat-option [value]="timeframe">{{ timeframe }}</mat-option>
        }
      </mat-select>
    </mat-form-field>
  `,
})
export class TimeframeSelect implements FormValueControl<Timeframe[]> {
  value = model.required<Timeframe[]>();
  timeframes = timeframes;
}
