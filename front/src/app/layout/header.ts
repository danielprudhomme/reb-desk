import { Component, ChangeDetectionStrategy } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-header',
  template: `
    <div class="w-full flex items-center justify-center gap-6 h-30">
      <a [routerLink]="['']">REB Reports</a>
      <a [routerLink]="['actions']">Actions</a>
      <a [routerLink]="['analysis']">Analysis</a>
      <a [routerLink]="['account']">Accounts</a>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.Eager,
  imports: [RouterLink],
})
export class Header {}
