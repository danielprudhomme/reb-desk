import { Routes } from '@angular/router';
import { RebReportList } from './features/report/components/reb-report-list';
import { Layout } from './layout/layout';
import { Actions } from './features/admin/actions';
import { FilterAnalysis } from './features/report/components/filter-analysis';
import { ReportAnalysis } from './features/report/components/report-analysis';
import { AccountList } from './features/account/components/account-list';
import { AccountDetails } from './features/account/components/account-details';
import { AccountPage } from './features/account/components/account-page';

export const routes: Routes = [
  {
    path: '',
    component: Layout,
    children: [
      {
        path: 'report',
        component: RebReportList,
      },
      {
        path: 'report/:reportId/analyze',
        component: ReportAnalysis,
      },
      {
        path: 'actions',
        component: Actions,
      },
      {
        path: 'analysis',
        component: FilterAnalysis,
      },
      {
        path: 'account',
        component: AccountPage,
        children: [
          {
            path: '',
            component: AccountList,
          },
          {
            path: 'create',
            component: AccountDetails,
          },
          {
            path: ':id',
            component: AccountDetails,
          },
        ],
      },
      { path: '', redirectTo: 'report', pathMatch: 'full' },
    ],
  },
];
