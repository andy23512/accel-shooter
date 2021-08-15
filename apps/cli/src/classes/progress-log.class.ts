import ProgressLog from "progress-logs";

enum StopExitCode {
  success = 0,
  fail = 1,
  warning = 2,
}

export class CustomProgressLog extends ProgressLog {
  constructor(title: string, titles: string[]) {
    super({ title, loadingEffect: 18 });
    this.setGlobalLogColor({
      success: "green",
    });
    this.setGlobalLogEmoji({
      fail: "x",
    });
    titles.forEach((title, index) => {
      this.add(title, undefined, {
        emoji: { success: index % 2 === 0 ? "rabbit" : "carrot" },
      });
    });
  }

  public next(exitCode: StopExitCode = StopExitCode.success) {
    this.currentLogItem?.stop(exitCode);
    this.run();
  }
}
