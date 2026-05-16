import { Component, computed, inject, viewChild } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { AccountService } from '../../../services/account.service';
import { Account } from '../../../core/models/account';
import { firstValueFrom } from 'rxjs/internal/firstValueFrom';

@Component({
  selector: 'app-account-list',
  imports: [RouterLink, MatButtonModule, MatTableModule, MatSortModule],
  template: `
    <div class="h-full overflow-auto">
      <table mat-table [dataSource]="dataSource()" matSort>
        <ng-container matColumnDef="name">
          <th mat-header-cell *matHeaderCellDef mat-sort-header>Name</th>

          <td mat-cell *matCellDef="let account">
            {{ account.name }}
          </td>
        </ng-container>

        <ng-container matColumnDef="capital">
          <th mat-header-cell *matHeaderCellDef mat-sort-header>Capital</th>

          <td mat-cell *matCellDef="let account">
            {{ account.capital }}
          </td>
        </ng-container>

        <ng-container matColumnDef="leverage">
          <th mat-header-cell *matHeaderCellDef mat-sort-header>Leverage</th>

          <td mat-cell *matCellDef="let account">
            {{ account.leverage }}
          </td>
        </ng-container>

        <!-- <ng-container matColumnDef="robots">
          <th mat-header-cell *matHeaderCellDef mat-sort-header>Robots</th>

          <td mat-cell *matCellDef="let account">
            {{ account.robots.length }}
          </td>
        </ng-container> -->

        <ng-container matColumnDef="actions">
          <th mat-header-cell *matHeaderCellDef>
            <!-- <button matButton="filled" routerLink="create">New</button> -->
            <button matButton="filled" (click)="createAccount()">New</button>
          </th>

          <td mat-cell *matCellDef="let account">
            <button matButton="filled" [routerLink]="[account.id]">Open</button>
          </td>
        </ng-container>

        <tr mat-header-row *matHeaderRowDef="displayedColumns; sticky: true"></tr>

        <tr mat-row *matRowDef="let row; columns: displayedColumns"></tr>
      </table>
    </div>
  `,
})
export class AccountList {
  private sort = viewChild.required(MatSort);
  private accountService = inject(AccountService);
  dataSource = computed(() => {
    const dataSource = new MatTableDataSource<Account>(this.accountService.accounts());
    dataSource.sort = this.sort();
    return dataSource;
  });
  displayedColumns: string[] = ['name', 'capital', 'leverage', 'actions'];

  async createAccount() {
    await firstValueFrom(
      this.accountService.upsertAccount({
        name: 'New Account',
        capital: 1000,
        leverage: 1,
      }),
    );
  }
}
