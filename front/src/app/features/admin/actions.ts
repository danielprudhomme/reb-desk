import { Component, inject } from '@angular/core';
import { ImportFolder } from './import-folder';
import { RebReportService } from '@app/services/reb-report.service';

@Component({
  selector: 'app-actions',
  imports: [ImportFolder],
  template: ` <app-import-folder /> `,
})
export class Actions {
  private rebReportService = inject(RebReportService);

  constructor() {
    this.rebReportService
      .analyze({ reportId: '686c8114-dd1c-4a91-9ad8-d6d35f66d211', thresholds: [] })
      .subscribe();
  }
}
