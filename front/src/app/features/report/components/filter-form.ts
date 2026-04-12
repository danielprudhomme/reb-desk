import { Component, model } from '@angular/core';
import { form, FormField, FormValueControl } from '@angular/forms/signals';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { ReportFilter } from '@shared/models/report-filter';
import { ExpertSelect } from '@app/shared/components/expert-select';
import { SymbolSelect } from '@app/shared/components/symbol-select';
import { TimeframeSelect } from '@app/shared/components/timeframe-select';

@Component({
  selector: 'app-filter-form',
  imports: [
    MatInputModule,
    MatFormFieldModule,
    MatButtonModule,
    FormField,
    SymbolSelect,
    TimeframeSelect,
    ExpertSelect,
  ],
  template: `
    <div class="flex items-center gap-4">
      <app-symbol-select [formField]="form.symbols" />
      <app-timeframe-select [formField]="form.timeframes" />
      <app-expert-select [formField]="form.experts" />
    </div>
  `,
})
export class FilterForm implements FormValueControl<ReportFilter> {
  value = model.required<ReportFilter>();
  form = form(this.value);
}
