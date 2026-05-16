import { Component, effect, inject } from '@angular/core';
import { AccountService } from '../../../services/account.service';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-account-page',
  template: `<router-outlet />`,
  imports: [RouterOutlet],
})
export class AccountPage {
  private accountService = inject(AccountService);

  constructor() {
    effect(() => {
      console.log('Accounts:', this.accountService.accounts());
    });
  }
}
