import { Routes } from '@angular/router';
import { RebReportList } from './features/report/components/reb-report-list';
import { Layout } from './layout/layout';
import { Actions } from './features/admin/actions';
import { FilterAnalysis } from './features/report/components/filter-analysis';
import { ReportAnalysis } from './features/report/components/report-analysis';

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
      { path: '', redirectTo: 'report', pathMatch: 'full' },
    ],
  },
];
