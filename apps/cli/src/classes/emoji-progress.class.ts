import EmojiProgress from "emoji-progress";

export class CustomEmojiProgress extends EmojiProgress {
  constructor(start: number, end: number) {
    super({
      start,
      end,
      unit: "🥕",
      fillerRight: "🥕",
      fillerLeft: " ",
      indicator: "🐰",
      autostart: true,
    });
  }

  public setValueAndEndValue(value: number, endValue: number) {
    this.endValue = endValue;
    this.value = value;
    if (this.value >= this.endValue) {
      this.value = this.endValue;
      this.complete();
    }
  }
}
