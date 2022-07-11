import { SummarizedTask } from '@accel-shooter/api-interfaces';
import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { ColDef } from 'ag-grid-community';
import moment from 'moment';
import { map, take } from 'rxjs/operators';
import { PageTitleService } from '../page-title.service';
import { PriorityCellRendererComponent } from './priority-cell-renderer.component';
import { TaskNameCellRendererComponent } from './task-name-cell-renderer.component';
import { TaskStatusCellRendererComponent } from './task-status-cell-renderer.component';

const comparator = (a: null | string, b: null | string) => {
  if (a === b) {
    return 0;
  } else if (a === null || typeof a === 'undefined') {
    return 1;
  } else if (b === null || typeof b === 'undefined') {
    return -1;
  }
  return parseInt(a) - parseInt(b);
};

@Component({
  selector: 'accel-shooter-tasks-page',
  templateUrl: './tasks-page.component.html',
  styleUrls: ['./tasks-page.component.scss'],
})
export class TasksPageComponent implements OnInit {
  public columnDefs: ColDef[] = [
    {
      width: 36,
      cellRenderer: TaskStatusCellRendererComponent,
      valueGetter: (p) => p.data.status?.orderindex,
      comparator,
      sortable: true,
    },
    { width: 800, field: 'name', cellRenderer: TaskNameCellRendererComponent },
    { width: 100, field: 'space' },
    {
      width: 100,
      field: 'priority',
      sortable: true,
      valueGetter: (p) => p.data.priority?.orderindex,
      comparator,
      cellRenderer: PriorityCellRendererComponent,
      sort: 'asc',
      sortingOrder: ['asc', null],
    },
    {
      width: 100,
      field: 'due_date',
      headerName: 'Due Date',
      sortable: true,
      valueFormatter: (p) =>
        p.data.due_date ? moment(+p.data.due_date).format('YYYY-MM-DD') : '',
      comparator,
    },
    {
      width: 150,
      field: 'date_created',
      headerName: 'Created Date',
      sortable: true,
      sortingOrder: ['desc', 'asc', null],
      valueFormatter: (p) =>
        p.data.date_created
          ? moment(+p.data.date_created).format('YYYY-MM-DD HH:mm:ss')
          : '',
      comparator,
    },
  ];
  public rowData$ = this.http
    .get<{ tasks: SummarizedTask[] }>(`/api/tasks`)
    .pipe(
      take(1),
      map((r) => r.tasks)
    );
  constructor(
    private http: HttpClient,
    private pageTitleService: PageTitleService
  ) {}

  public ngOnInit(): void {
    this.pageTitleService.setTitle('Tasks');
  }
}
