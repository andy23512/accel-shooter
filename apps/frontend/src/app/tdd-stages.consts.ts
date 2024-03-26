import { TddStage } from '@accel-shooter/api-interfaces';

export const TDD_STAGES = [
  { name: TddStage.Test, label: 'T', color: '#F44336', next: TddStage.Code },
  {
    name: TddStage.Code,
    label: 'C',
    color: '#4CAF50',
    next: TddStage.Refactor,
  },
  {
    name: TddStage.Refactor,
    label: 'R',
    color: '#2196F3',
    next: TddStage.Test,
  },
];
