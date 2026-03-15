import { Component, inject, signal } from '@angular/core';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatButtonModule } from '@angular/material/button';
import { form, FormField, pattern, required, FormRoot } from '@angular/forms/signals';
import { RebReportService } from '../services/reb-report.service';
import { firstValueFrom, map } from 'rxjs';

@Component({
  selector: 'app-import-folder',
  imports: [MatInputModule, MatFormFieldModule, MatButtonModule, FormField, FormRoot],
  template: `
    <form [formRoot]="form" class="flex items-center gap-4">
      <mat-form-field class="w-100">
        <mat-label>Folder Path</mat-label>
        <input matInput [formField]="form.folderPath" />
        @for (error of form.folderPath().errors(); track error) {
          <mat-error>{{ error.message }}</mat-error>
        }
      </mat-form-field>

      <button matButton="filled" type="submit">Import</button>
    </form>
  `,
})
export class ImportFolder {
  private rebReportService = inject(RebReportService);
  model = signal({ folderPath: 'C:\\' });
  form = form(
    this.model,
    (schemaPath) => {
      required(schemaPath.folderPath, { message: 'Folder Path is required' });
      pattern(schemaPath.folderPath, /^[a-zA-Z]:[\\/](?:[^<>:"|?*\r\n]+[\\/])*[^<>:"|?*\r\n]*$/, {
        message: 'Folder path must be a windows folder path',
      });
    },
    {
      submission: {
        action: async () =>
          await firstValueFrom(
            this.rebReportService.import(this.model().folderPath.trim()).pipe(map(() => null)),
          ),
      },
    },
  );
}
