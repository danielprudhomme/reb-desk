import { Routes } from '@angular/router';
import { RebReportList } from './components/reb-report-list';
import { Layout } from './core/components/layout';
import { Actions } from './components/actions';
import { Analysis } from './components/analysis';

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
        component: Analysis,
      },
      {
        path: 'actions',
        component: Actions,
      },
      { path: '', redirectTo: 'report', pathMatch: 'full' },
    ],
  },
];
