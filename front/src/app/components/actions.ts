import { Component, inject } from '@angular/core';
import { ImportFolder } from './import-folder';
import { RebReportService } from '../services/reb-report.service';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-actions',
  imports: [MatButtonModule, ImportFolder],
  template: `
    <app-import-folder />

    <button matButton="filled" (click)="rebuild()">Rebuild</button>
  `,
})
export class Actions {
  private rebReportService = inject(RebReportService);

  rebuild() {
    this.rebReportService.rebuild().subscribe();
  }
}
