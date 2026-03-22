import { Routes } from '@angular/router';
import { RebReportList } from './components/reb-report-list';
import { Layout } from './core/components/layout';
import { Actions } from './components/actions';
import { SingleReportAnalysis } from './components/single-report-analysis';
import { MultipleReportsAnalysis } from './components/multiple-reports-analysis';

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
        component: SingleReportAnalysis,
      },
      {
        path: 'actions',
        component: Actions,
      },
      {
        path: 'analysis',
        component: MultipleReportsAnalysis,
      },
      { path: '', redirectTo: 'report', pathMatch: 'full' },
    ],
  },
];
