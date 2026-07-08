import { Component, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule } from '@angular/material/dialog';
import { ExpertAdvisor } from '@shared/models/expert-advisor';
import { ExpertSelect } from '@app/shared/components/expert-select';
import { form, FormField, max, min, minLength, required } from '@angular/forms/signals';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';

@Component({
  selector: 'app-generate-robots-dialog',
  imports: [
    MatDialogModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    ExpertSelect,
    FormField,
  ],
  template: `
    <h2 mat-dialog-title>Generate robots</h2>
    <mat-dialog-content>
      <div class="flex flex-col gap-4">
        <mat-form-field appearance="outline" class="w-full mt-4">
          <mat-label>Number of robots</mat-label>
          <input matInput type="number" [formField]="form.numberOfRobots" />
        </mat-form-field>
        <app-expert-select [formField]="form.experts" />
      </div>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button matButton [mat-dialog-close]="null">Cancel</button>
      <button matButton="filled" [mat-dialog-close]="model()" [disabled]="!form().valid()">
        Generate
      </button>
    </mat-dialog-actions>
  `,
})
export class GenerateRobotsDialog {
  model = signal<{ numberOfRobots: number; experts: ExpertAdvisor[] }>({
    numberOfRobots: 99,
    experts: ['candleSuite', 'emaBb', 'rsiBreak'],
  });
  form = form(this.model, (path) => {
    required(path.numberOfRobots);
    min(path.numberOfRobots, 1);
    max(path.numberOfRobots, 99);
    required(path.experts);
    minLength(path.experts, 1);
  });
}
