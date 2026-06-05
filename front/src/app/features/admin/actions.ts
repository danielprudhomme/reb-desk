import { Component } from '@angular/core';
import { ImportFolder } from './import-folder';

@Component({
  selector: 'app-actions',
  imports: [ImportFolder],
  template: ` <app-import-folder /> `,
})
export class Actions {}
