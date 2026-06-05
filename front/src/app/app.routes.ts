import { Routes } from '@angular/router';
import { Layout } from './layout/layout';
import { Actions } from './features/admin/actions';
import { ReportAnalysis } from './features/report/components/report-analysis';
import { AccountList } from './features/account/components/account-list';
import { AccountDetails } from './features/account/components/account-details';

export const routes: Routes = [
  {
    path: '',
    component: Layout,
    children: [
      // {
      //   path: 'report',
      //   component: RebReportList,
      // },
      {
        path: 'report/:reportId/analyze',
        component: ReportAnalysis,
      },
      {
        path: 'actions',
        component: Actions,
      },
      // {
      //   path: 'analysis',
      //   component: FilterAnalysis,
      // },
      {
        path: 'account',
        component: AccountList,
      },
      {
        path: 'account/create',
        component: AccountDetails,
      },
      {
        path: 'account/:id',
        component: AccountDetails,
      },
      { path: '', redirectTo: 'actions', pathMatch: 'full' },
    ],
  },
];
