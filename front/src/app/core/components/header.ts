import { Component } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-header',
  template: `
    <div>
      <button matButton="filled">Synchronize</button>
    </div>
  `,
  imports: [MatButtonModule],
})
export class Header {}
