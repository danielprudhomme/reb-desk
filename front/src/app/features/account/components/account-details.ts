import { Component, computed, effect, inject, Signal, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { AccountService } from '@app/services/account.service';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { form, FormField, required } from '@angular/forms/signals';
import { MatIcon } from '@angular/material/icon';
import { AccountForm } from './account-form';
import { debounceTime, skip } from 'rxjs';
import { toObservable } from '@angular/core/rxjs-interop';
import { AccountInput } from '@app/core/models/account';
import { RobotService } from '@app/services/robot.service';
import { RobotTable } from './robot-table';
import { Robot } from '@app/core/models/robot';
import { ConfirmationService } from '@app/core/services/confirmation.service';

@Component({
  selector: 'app-account-details',
  imports: [
    FormField,
    RobotTable,
    MatButtonModule,
    MatMenuModule,
    MatFormFieldModule,
    MatInputModule,
    MatIcon,
    RouterLink,
    AccountForm,
  ],
  template: `
    @if (accountId && robots) {
      <div class="relative flex flex-col p-4 h-full gap-2">
        <div class="flex justify-between items-center">
          <button mat-icon-button aria-label="Back to accounts">
            <mat-icon>arrow_back</mat-icon>
          </button>

          <button mat-icon-button [matMenuTriggerFor]="settingsMenu" aria-label="Account settings">
            <mat-icon>settings</mat-icon>
          </button>
        </div>

        <app-account-form [formField]="accountForm" />

        <div>{{ robots().length }} robot{{ robots().length !== 1 ? 's' : '' }}</div>

        <div class="flex-1 overflow-auto border border-gray-100 rounded-lg">
          <app-robot-table [accountId]="accountId" [robots]="robots()" />
        </div>
      </div>

      <mat-menu #settingsMenu="matMenu">
        <button mat-menu-item (click)="deleteAccount()" [routerLink]="['..']">
          <mat-icon>delete</mat-icon>
          <span>Delete Account</span>
        </button>
      </mat-menu>
    }
  `,
})
export class AccountDetails {
  private accountService = inject(AccountService);
  private robotService = inject(RobotService);
  private confirmationService = inject(ConfirmationService);
  private route = inject(ActivatedRoute);
  accountId = this.route.snapshot.paramMap.get('id');
  account = signal<AccountInput>({ name: '', capital: 1000, leverage: 500 });
  accountForm = form(this.account, (path) => {
    required(path.name);
    required(path.capital);
    required(path.leverage);
  });
  isCreation = computed(() => !this.account().id);
  robots?: Signal<Robot[]>;

  constructor() {
    if (!this.accountId) return;
    this.robotService.setAccountId(this.accountId);
    this.robots = this.robotService.robotsByAccount;

    effect(() => {
      const account = this.accountService.accounts().find((a) => a.id === this.accountId);
      if (!account) return;
      this.account.set(account);
    });

    toObservable(this.account)
      .pipe(debounceTime(500), skip(1))
      .subscribe((account) => {
        if (this.isCreation() || !this.accountForm().dirty() || !this.accountForm().valid()) return;

        this.accountService.upsertAccount({
          id: account.id,
          name: account.name,
          capital: account.capital,
          leverage: account.leverage,
        });
        this.accountForm().reset();
      });

    // const selectedSymbols = symbols.filter((s) => !s.includes('XAU'));

    // const robots = diversifyRobots({
    //   experts: ['candleSuite', 'emaBb', 'rsiBreak', 'strategyCreator'],
    //   timeframes: ['M15', 'M20', 'M30', 'H1'],
    //   symbols: selectedSymbols,
    //   maxRobots: 99,
    // });

    // this.robots.set(robots);
  }

  deleteAccount() {
    this.confirmationService
      .confirm({ message: 'Are you sure to delete this account ?', title: 'Delete Account' })
      .subscribe((confirmed) => {
        if (confirmed) {
          this.accountService.deleteAccount(this.account().id!);
        }
      });
  }
}
