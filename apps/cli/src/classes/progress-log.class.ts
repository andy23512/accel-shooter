import ProgressLog from 'progress-logs';

enum StopExitCode {
  success = 0,
  fail = 1,
  warning = 2,
}

export class CustomProgressLog extends ProgressLog {
  constructor(title: string, titles: string[]) {
    super({ title, loadingEffect: 18 });
    this.setGlobalLogColor({
      success: 'green',
    });
    this.setGlobalLogEmoji({
      fail: 'x',
      success: 'o',
    });
    titles.forEach((title) => {
      this.add(title);
    });
  }

  public next(exitCode: StopExitCode = StopExitCode.success) {
    this.currentLogItem?.stop(exitCode);
    this.run();
  }
}
