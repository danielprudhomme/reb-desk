import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-header',
  template: `
    <div class="w-full flex items-center justify-center gap-6">
      <a [routerLink]="['']">REB Reports</a>
      <a [routerLink]="['actions']">Actions</a>
      <a [routerLink]="['analysis']">Analysis</a>
    </div>
  `,
  imports: [RouterLink],
})
export class Header {}
