import ProgressLog from "progress-logs";

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
}
