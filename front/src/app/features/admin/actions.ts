import { Component, ChangeDetectionStrategy } from '@angular/core';
import { ImportFolder } from './import-folder';

@Component({
  selector: 'app-actions',
  imports: [ImportFolder],
  changeDetection: ChangeDetectionStrategy.Eager,
  template: ` <app-import-folder /> `,
})
export class Actions {}
