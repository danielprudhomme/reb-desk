import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-layout',
  template: `
    <div class="h-full flex flex-col overflow-hidden">
      <!-- <app-header /> -->

      <div class="flex-1 min-h-0 flex flex-col">
        <router-outlet />
      </div>
    </div>
  `,
  imports: [RouterOutlet],
  styles: `
    :host {
      display: block;
      height: 100%;
      width: 100%;
    }
  `,
})
export class Layout {}
