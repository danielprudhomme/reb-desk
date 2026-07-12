import { Component, computed, effect, inject, signal, viewChild } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { AccountService } from '@app/services/account.service';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { form, required } from '@angular/forms/signals';
import { MatIcon } from '@angular/material/icon';
import { debounceTime, skip } from 'rxjs';
import { toObservable } from '@angular/core/rxjs-interop';
import { AccountInput } from '@app/core/models/account';
import { RobotService } from '@app/services/robot.service';
import { RobotTable } from './robot-table';
import { ConfirmationService } from '@app/core/services/confirmation.service';
import { MatDialog } from '@angular/material/dialog';
import { GenerateRobotsDialog } from './generate-robots-dialog';
import { Timeframe } from '@shared/models/timeframe';
import { Symbol, symbols } from '@shared/models/symbol';
import { diversifyRobots, ExpertDistribution } from '../helpers/diversify-robots';
import { Robot } from '@shared/models/robot';
import { MatSidenav, MatSidenavModule } from '@angular/material/sidenav';
import { RobotDrawer } from './robot-drawer';
import { MatTabsModule } from '@angular/material/tabs';
import { Diversification } from './diversification';

@Component({
  selector: 'app-account-details',
  imports: [
    RobotTable,
    Diversification,
    RobotDrawer,
    MatButtonModule,
    MatMenuModule,
    MatFormFieldModule,
    MatInputModule,
    MatIcon,
    RouterLink,
    MatSidenavModule,
    MatTabsModule,
  ],
  template: `
    <mat-sidenav-container class="h-full" (backdropClick)="closeDrawer()">
      <!-- MAIN CONTENT -->
      <mat-sidenav-content>
        <div class="relative flex flex-col p-4 h-full gap-2">
          <div class="flex justify-between items-center">
            <button mat-icon-button aria-label="Back to accounts" [routerLink]="['..']">
              <mat-icon>arrow_back</mat-icon>
            </button>

            <button
              mat-icon-button
              [matMenuTriggerFor]="settingsMenu"
              aria-label="Account settings"
            >
              <mat-icon>settings</mat-icon>
            </button>

            <mat-menu #settingsMenu="matMenu">
              <button mat-menu-item (click)="generateRobots()">
                <mat-icon>precision_manufacturing</mat-icon>
                <span>Generate Robots</span>
              </button>

              <button mat-menu-item (click)="createRebReports()">
                <mat-icon>description</mat-icon>
                <span>Generate REB files for robots</span>
              </button>

              <button mat-menu-item (click)="syncRebReportsToRobots()">
                <mat-icon>upload_file</mat-icon>
                <span>Import REB reports to robots</span>
              </button>

              <button mat-menu-item (click)="generateProfile()">
                <mat-icon>badge</mat-icon>
                <span>Generate Profile</span>
              </button>

              <button mat-menu-item (click)="deleteAccount()" [routerLink]="['..']">
                <mat-icon>delete_forever</mat-icon>
                <span>Delete Account</span>
              </button>
            </mat-menu>
          </div>

          <div class="flex-1 overflow-auto border border-gray-100 rounded-lg">
            <mat-tab-group class="h-full">
              <mat-tab label="Robot Table">
                <app-robot-table
                  [accountId]="accountId!"
                  [robots]="robots()"
                  [timeframes]="timeframes"
                  [symbols]="symbols"
                  (robotClicked)="onRobotClicked($event)"
                />
              </mat-tab>

              <mat-tab label="Diversification">
                <app-diversification [robots]="robots()" />
              </mat-tab>
            </mat-tab-group>
          </div>
        </div>
      </mat-sidenav-content>

      <!-- RIGHT DRAWER -->
      <mat-sidenav #drawer position="end" mode="over" class="!w-[90vw]">
        @if (selectedRobot()) {
          <app-robot-drawer
            [capital]="account().capital"
            [robot]="selectedRobot()!"
            (delete)="deleteRobot($event)"
            (close)="closeDrawer()"
          />
        }
      </mat-sidenav>
    </mat-sidenav-container>
  `,
})
export class AccountDetails {
  private accountService = inject(AccountService);
  private robotService = inject(RobotService);
  private confirmationService = inject(ConfirmationService);
  private dialog = inject(MatDialog);
  private route = inject(ActivatedRoute);
  accountId = this.route.snapshot.paramMap.get('id');
  account = signal<AccountInput>({ name: '', capital: 1000, leverage: 500 });
  accountForm = form(this.account, (path) => {
    required(path.name);
    required(path.capital);
    required(path.leverage);
  });
  isCreation = computed(() => !this.account().id);
  robots = computed<Robot[]>(() => this.robotService.robotsByAccount());
  timeframes: Timeframe[] = ['M15', 'M20', 'M30', 'H1'];
  symbols: Symbol[] = symbols.filter((s) => !s.includes('XAU'));
  drawer = viewChild.required(MatSidenav);
  selectedRobot = signal<Robot | null>(null);

  constructor() {
    this.robotService.setAccountId(this.accountId!);

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
  }

  generateRobots() {
    this.dialog
      .open(GenerateRobotsDialog, { disableClose: true })
      .afterClosed()
      .subscribe((result) => {
        if (!result) return;

        // 99 robots
        const distribution: ExpertDistribution = {
          candleSuite: 25,
          emaBb: 25,
          rsiBreak: 25,

          scBbEngulfing: 3,
          scIchiSar: 3,
          scRsiBb: 3,
          scEmaRsi: 3,
          scEmaMacd: 3,
          scRsiEngulfing: 3,
          scEmaSar: 3,
          scRsiOnly: 2,
          scStochOnly: 1,
        };

        const robots = diversifyRobots(
          this.robots(),
          this.robots(),
          this.timeframes,
          this.symbols,
          distribution,
        );
        this.robotService.insertRobots(this.accountId!, robots);
      });
  }

  async createRebReports() {
    await this.accountService.createRebReports(this.accountId!);
  }

  async syncRebReportsToRobots() {
    await this.accountService.syncRebReportsToRobots(this.accountId!, 'C:\\Dev\\testimports');
  }

  async generateProfile() {
    await this.accountService.generateProfile(this.accountId!);
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

  onRobotClicked(robot: Robot) {
    this.selectedRobot.set(robot);
    this.drawer().open();
  }

  deleteRobot(robot: Robot) {
    this.confirmationService
      .confirm({ message: 'Are you sure to delete this robot ?', title: 'Delete Robot' })
      .subscribe((confirmed) => {
        if (confirmed) {
          this.robotService.deleteRobot(robot);
          this.closeDrawer();
        }
      });
  }

  closeDrawer() {
    this.selectedRobot.set(null);
    this.drawer().close();
  }
}
