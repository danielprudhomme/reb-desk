import { Component, effect, inject, signal } from '@angular/core';
import { RebReportService } from './services/reb-report.service';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-root',
  template: `<router-outlet />`,
  imports: [RouterOutlet],
  styles: `
    :host {
      display: block;
      height: 100%;
      width: 100%;
    }
  `,
})
export class App {
  protected readonly title = signal('RebDesk');

  private service = inject(RebReportService);

  constructor() {
    effect(() => {
      console.log('reports', this.service.reports());
    });
  }
}
