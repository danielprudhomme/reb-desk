import { Routes } from '@angular/router';
import { RebReportList } from './components/reb-report-list';
import { Layout } from './core/components/layout';
import { Actions } from './components/actions';

export const routes: Routes = [
  {
    path: '',
    component: Layout,
    children: [
      {
        path: '',
        component: RebReportList,
      },
      {
        path: 'actions',
        component: Actions,
      },
    ],
  },
];
