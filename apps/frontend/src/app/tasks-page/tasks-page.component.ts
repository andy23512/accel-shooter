import { SummarizedTask } from '@accel-shooter/api-interfaces';
import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import { ColDef } from 'ag-grid-community';
import moment from 'moment';
import { map, take } from 'rxjs/operators';
import { PriorityCellRendererComponent } from './priority-cell-renderer.component';
import { TaskNameCellRendererComponent } from './task-name-cell-renderer.component';

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
  styleUrls: ['./tasks-page.component.css'],
})
export class TasksPageComponent {
  public columnDefs: ColDef[] = [
    { width: 800, field: 'name', cellRenderer: TaskNameCellRendererComponent },
    {
      width: 100,
      field: 'priority',
      sortable: true,
      valueGetter: (p) => p.data.priority?.orderindex,
      comparator,
      cellRenderer: PriorityCellRendererComponent,
      sort: 'asc',
    },
    {
      width: 100,
      field: 'due_date',
      sortable: true,
      valueFormatter: (p) =>
        p.data.due_date ? moment(+p.data.due_date).format('YYYY-MM-DD') : '',
      comparator,
    },
  ];
  public rowData$ = this.http
    .get<{ tasks: SummarizedTask[] }>(`/api/tasks`)
    .pipe(
      take(1),
      map((r) => r.tasks)
    );
  constructor(private http: HttpClient) {}
}
