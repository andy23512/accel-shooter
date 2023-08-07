export enum TaskStatus {
  Open = 'open',
  Pending = 'pending',
  InDiscussion = 'in discussion',

  ReadyToDo = 'ready to do',
  ReadyToDev = 'ready to dev',

  InProgress = 'in progress',
  DevInProgress = 'dev in progress',

  Review = 'review',
  InReview = 'in review',
  DevInReview = 'dev in review',

  ReadyToVerify = 'ready to verify',
  Suspended = 'suspended',
  Verified = 'verified',
  Closed = 'closed',
  Complete = 'complete',
  Done = 'done',
}
