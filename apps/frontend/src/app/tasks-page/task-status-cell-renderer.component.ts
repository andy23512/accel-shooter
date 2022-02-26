import { SummarizedTask } from '@accel-shooter/api-interfaces';
import { Component } from '@angular/core';
import { ICellRendererAngularComp } from 'ag-grid-angular';
import { ICellRendererParams } from 'ag-grid-community';

@Component({
  selector: 'accel-shooter-task-name-cell-renderer',
  template: `<span
    [style.color]="data.status.color"
    [matTooltip]="data.status.status"
    >&#x25A0;</span
  >`,
})
export class TaskStatusCellRendererComponent
  implements ICellRendererAngularComp
{
  public data!: SummarizedTask;

  agInit(params: ICellRendererParams): void {
    this.data = params.data;
  }

  refresh() {
    return false;
  }
}
