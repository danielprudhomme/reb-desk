import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Header } from './header';

@Component({
  selector: 'app-layout',
  template: `
    <div class="bg-gray-900 text-white h-full p-6 flex flex-col gap-4">
      <app-header />
      <router-outlet />
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
