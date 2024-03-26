import { TddStage } from '@accel-shooter/api-interfaces';
import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  Output,
} from '@angular/core';
import { TDD_STAGES } from '../tdd-stages.consts';

@Component({
  selector: 'accel-shooter-tdd-widget',
  templateUrl: './tdd-widget.component.html',
  styleUrls: ['./tdd-widget.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TddWidgetComponent {
  @Input() public currentStage: TddStage | null = null;
  @Output() public stageClick = new EventEmitter<TddStage>();
  public size = 100;
  public stageRadius = 13;
  public stageBorderWidth = 2;
  public cycleRadius = 35;

  get viewBox() {
    const s = this.size;
    return [-s / 2, -s / 2, s, s].join(' ');
  }

  public stages = TDD_STAGES;

  public indexToX(index: number) {
    return Math.sin(((2 * Math.PI) / this.stages.length) * index);
  }
  public indexToY(index: number) {
    return -Math.cos(((2 * Math.PI) / this.stages.length) * index);
  }

  public getStageCenterX(index: number) {
    return this.cycleRadius * this.indexToX(index);
  }

  public getStageCenterY(index: number) {
    return this.cycleRadius * this.indexToY(index);
  }

  public getPathD(index: number) {
    const cycleOuterRadius = this.cycleRadius + this.stageRadius;
    const cycleInnerRadius = this.cycleRadius - this.stageRadius;
    const startPoint = {
      x: cycleInnerRadius * this.indexToX(index),
      y: cycleInnerRadius * this.indexToY(index),
    };
    const secondPoint = {
      x: cycleOuterRadius * this.indexToX(index),
      y: cycleOuterRadius * this.indexToY(index),
    };
    const previousIndex = (index - 1 + this.stages.length) % this.stages.length;
    const thirdPoint = {
      x: cycleOuterRadius * this.indexToX(previousIndex),
      y: cycleOuterRadius * this.indexToY(previousIndex),
    };
    const fourthPoint = {
      x: cycleInnerRadius * this.indexToX(previousIndex),
      y: cycleInnerRadius * this.indexToY(previousIndex),
    };
    return `
      M ${startPoint.x},${startPoint.y}
      A ${this.stageRadius},${this.stageRadius} 0 0 0 ${secondPoint.x},${secondPoint.y}
      A ${cycleOuterRadius},${cycleOuterRadius} 0 0 0 ${thirdPoint.x},${thirdPoint.y}
      A ${this.stageRadius},${this.stageRadius} 0 0 1 ${fourthPoint.x},${fourthPoint.y}
      A ${cycleInnerRadius},${cycleInnerRadius} 0 0 1 ${startPoint.x},${startPoint.y}
      Z
    `;
  }
}
