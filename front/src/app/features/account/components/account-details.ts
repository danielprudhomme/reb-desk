import { Component, computed, effect, inject, signal } from '@angular/core';
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

@Component({
  selector: 'app-account-details',
  imports: [
    FormField,
    // DiversificationTable,
    MatButtonModule,
    MatMenuModule,
    MatFormFieldModule,
    MatInputModule,
    MatIcon,
    RouterLink,
    AccountForm,
  ],
  template: `
    <div class="relative flex flex-col p-4 h-full gap-2">
      <div class="flex justify-between items-center">
        <button mat-icon-button [routerLink]="['..']" aria-label="Back to accounts">
          <mat-icon>arrow_back</mat-icon>
        </button>

        <button mat-icon-button [matMenuTriggerFor]="settingsMenu" aria-label="Account settings">
          <mat-icon>settings</mat-icon>
        </button>
      </div>

      <app-account-form [formField]="accountForm" />

      <div class="flex-1 overflow-auto border border-gray-100 rounded-lg">
        <!-- <app-diversification-table [robots]="robots()" /> -->
      </div>
    </div>

    <mat-menu #settingsMenu="matMenu">
      <button mat-menu-item (click)="deleteAccount()" [routerLink]="['..']">
        <mat-icon>delete</mat-icon>
        <span>Delete Account</span>
      </button>
    </mat-menu>
  `,
})
export class AccountDetails {
  private accountService = inject(AccountService);
  private route = inject(ActivatedRoute);
  account = signal<AccountInput>({ name: '', capital: 1000, leverage: 500 });
  accountForm = form(this.account, (path) => {
    required(path.name);
    required(path.capital);
    required(path.leverage);
  });
  isCreation = computed(() => !this.account().id);
  robots = inject(RobotService).robotsByAccount(this.account().id);

  constructor() {
    effect(() => {
      console.log('robots', this.robots());
    });

    effect(() => {
      const accountId = this.route.snapshot.paramMap.get('id');
      const account = this.accountService.accounts().find((a) => a.id === accountId);
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
    this.accountService.deleteAccount(this.account().id!);
  }
}
