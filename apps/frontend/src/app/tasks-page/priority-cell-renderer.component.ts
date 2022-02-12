import { SummarizedTask } from '@accel-shooter/api-interfaces';
import { Component } from '@angular/core';
import { ICellRendererAngularComp } from 'ag-grid-angular';
import { ICellRendererParams } from 'ag-grid-community';

@Component({
  selector: 'accel-shooter-priority-cell-renderer',
  template: `<span [style.color]="data.priority?.color">{{
    data.priority?.priority
  }}</span>`,
})
export class PriorityCellRendererComponent implements ICellRendererAngularComp {
  public data!: SummarizedTask;

  agInit(params: ICellRendererParams): void {
    this.data = params.data;
  }

  refresh() {
    return false;
  }
}
