import { Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { RebReportsService } from 'src/app/services/reb-report.service';

@Component({
  selector: 'app-header',
  template: `
    <div>
      <button matButton="filled" (click)="sync()">Synchronize</button>
    </div>
  `,
  imports: [MatButtonModule],
})
export class Header {
  private service = inject(RebReportsService);

  sync() {
    this.service.sync().subscribe();
  }
}
