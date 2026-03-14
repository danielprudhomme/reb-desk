import { Routes } from '@angular/router';
import { RebReportList } from './components/optimization-report-list';
import { Layout } from './core/components/layout';

export const routes: Routes = [
  {
    path: '',
    component: Layout,
    children: [
      {
        path: '',
        component: RebReportList,
      },
    ],
  },
];
