import { Component, model } from '@angular/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { form, FormField, FormValueControl } from '@angular/forms/signals';
import { AccountInput } from '@app/core/models/account';

@Component({
  selector: 'app-account-form',
  imports: [FormField, MatFormFieldModule, MatInputModule],
  template: `
    <form class="grid grid-cols-1 md:grid-cols-3 gap-4">
      <mat-form-field appearance="outline" class="w-full">
        <mat-label>Account Name</mat-label>
        <input matInput [formField]="accountForm.name" />
      </mat-form-field>

      <mat-form-field appearance="outline" class="w-full">
        <mat-label>Capital</mat-label>
        <input matInput type="number" [formField]="accountForm.capital" />
        <span matSuffix class="mr-2">€</span>
      </mat-form-field>

      <mat-form-field appearance="outline" class="w-full">
        <mat-label>Leverage</mat-label>
        <input matInput type="number" [formField]="accountForm.leverage" />
        <span matPrefix class="ml-2">1:</span>
      </mat-form-field>
    </form>
  `,
})
export class AccountForm implements FormValueControl<AccountInput> {
  value = model.required<AccountInput>();
  accountForm = form(this.value);
}
