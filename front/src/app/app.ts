import { Component, inject, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { OptimizationReportsService } from './services/optimization-report.service';

@Component({
  selector: 'app-root',
  template: `<router-outlet />`,
  imports: [RouterOutlet],
})
export class App {
  protected readonly title = signal('RebDesk');

  private service = inject(OptimizationReportsService);

  constructor() {
//  this.service.sync().subscribe(s => {
//       console.log('sync', s);

      this.service.getAll().subscribe(r => {
      console.log('reports', r);
    })
    // })

    

   
  }
}
