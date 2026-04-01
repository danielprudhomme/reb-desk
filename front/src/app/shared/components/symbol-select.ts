import { Component, model } from '@angular/core';
import { FormValueControl } from '@angular/forms/signals';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { Symbol, symbols } from '@shared/models/symbol';

@Component({
  selector: 'app-symbol-select',
  imports: [MatFormFieldModule, MatSelectModule],
  template: `
    <mat-form-field>
      <mat-label>Symbol</mat-label>
      <mat-select [value]="value()" (selectionChange)="value.set($event.value)" multiple>
        @for (symbol of symbols; track symbol) {
          <mat-option [value]="symbol">{{ symbol }}</mat-option>
        }
      </mat-select>
    </mat-form-field>
  `,
})
export class SymbolSelect implements FormValueControl<Symbol[]> {
  value = model.required<Symbol[]>();
  symbols = symbols;
}
