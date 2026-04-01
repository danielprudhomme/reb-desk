import { Component, model } from '@angular/core';
import { FormValueControl } from '@angular/forms/signals';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { ExpertAdvisor, expertAdvisors } from '@shared/models/expert-advisor';
import { EXPERT_NAMES } from '@shared/constants/expert.constants';

@Component({
  selector: 'app-expert-select',
  imports: [MatFormFieldModule, MatSelectModule],
  template: `
    <mat-form-field>
      <mat-label>Expert</mat-label>
      <mat-select [value]="value()" (selectionChange)="value.set($event.value)" multiple>
        @for (expertAdvisor of expertAdvisors; track expertAdvisor) {
          <mat-option [value]="expertAdvisor">{{ $any(expertNames)[expertAdvisor] }}</mat-option>
        }
      </mat-select>
    </mat-form-field>
  `,
})
export class ExpertSelect implements FormValueControl<ExpertAdvisor[]> {
  value = model.required<ExpertAdvisor[]>();
  expertAdvisors = expertAdvisors;
  expertNames = EXPERT_NAMES;
}
