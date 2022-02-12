import { SummarizedTask } from '@accel-shooter/api-interfaces';
import { Component } from '@angular/core';
import { ICellRendererAngularComp } from 'ag-grid-angular';
import { ICellRendererParams } from 'ag-grid-community';

@Component({
  selector: 'accel-shooter-task-name-cell-renderer',
  template: `<a [href]="data.url" target="_blank">{{ data.name }}</a>`,
  styles: [
    `
      a {
        color: #f5f5f5;
        text-decoration: none;
      }
    `,
  ],
})
export class TaskNameCellRendererComponent implements ICellRendererAngularComp {
  public data!: SummarizedTask;

  agInit(params: ICellRendererParams): void {
    this.data = params.data;
  }

  refresh() {
    return false;
  }
}
