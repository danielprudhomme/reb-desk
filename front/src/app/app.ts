import { Component, inject, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { OptimizationReportsService } from './services/optimization-report.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected readonly title = signal('RebDesk');

  private service = inject(OptimizationReportsService);

  constructor() {
    this.service.getAll().subscribe(r => {
      console.log('reports', r);
    })
  }
}
