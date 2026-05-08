import { Component, model } from '@angular/core';
import { FormValueControl } from '@angular/forms/signals';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { Capital, capitals } from '@shared/models/capital';

@Component({
  selector: 'app-capital-select',
  imports: [MatFormFieldModule, MatSelectModule],
  template: `
    <mat-form-field>
      <mat-label>Capital</mat-label>
      <mat-select [value]="value()" (selectionChange)="value.set($event.value)">
        @for (capital of capitals; track capital) {
          <mat-option [value]="capital">{{ capital }}</mat-option>
        }
      </mat-select>
    </mat-form-field>
  `,
})
export class CapitalSelect implements FormValueControl<Capital | null> {
  value = model.required<Capital | null>();
  capitals = capitals;
}
