import { Component, model } from '@angular/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { expertAdvisors, ExpertAdvisor } from '@shared/models/expert-advisor';
import { ExpertBadge } from './expert-badge';
import { FormValueControl } from '@angular/forms/signals';

@Component({
  selector: 'app-expert-select',
  standalone: true,
  imports: [MatFormFieldModule, MatSelectModule, ExpertBadge],
  template: `
    <mat-form-field>
      <mat-label>Experts</mat-label>

      <mat-select [value]="value()" (selectionChange)="value.set($event.value)" multiple>
        <mat-select-trigger>
          @if (value().length > 0) {
            <div class="flex items-center gap-2">
              <app-expert-badge [expert]="value()[0]" />

              @if (value().length > 1) {
                <span class="text-xs text-neutral-400 font-medium">
                  +{{ value().length - 1 }}
                </span>
              }
            </div>
          }
        </mat-select-trigger>

        @for (expert of expertAdvisors; track expert) {
          <mat-option [value]="expert">
            <app-expert-badge [expert]="expert" />
          </mat-option>
        }
      </mat-select>
    </mat-form-field>
  `,
})
export class ExpertSelect implements FormValueControl<ExpertAdvisor[]> {
  value = model.required<ExpertAdvisor[]>();
  expertAdvisors = expertAdvisors;
}
