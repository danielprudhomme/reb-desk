import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Header } from './header';

@Component({
  selector: 'app-layout',
  template: `
    <div class="h-full flex flex-col overflow-hidden">
      <app-header />

      <div class="flex-1 min-h-0 flex flex-col">
        <router-outlet />
      </div>
    </div>
  `,
  imports: [RouterOutlet, Header],
  styles: `
    :host {
      display: block;
      height: 100%;
      width: 100%;
    }
  `,
})
export class Layout {}
