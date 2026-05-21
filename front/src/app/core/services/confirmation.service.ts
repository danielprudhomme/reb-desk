import { inject, Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Observable } from 'rxjs';
import { ConfirmationDialog, ConfirmData } from '../components/confirmation-dialog';

@Injectable({
  providedIn: 'root',
})
export class ConfirmationService {
  private dialog = inject(MatDialog);

  confirm(data: ConfirmData): Observable<boolean> {
    return this.dialog
      .open(ConfirmationDialog, {
        width: '400px',
        data,
        disableClose: true,
      })
      .afterClosed();
  }
}
