declare module "emoji-progress" {
  interface EmojiProgressOption {
    start: number;
    end: number;
    isLoader: boolean;
    hideState: boolean;
    autostart: boolean;
    reverse: boolean;
    indicator: string;
    unit: string;
    separator: string;
    paddingRight: number;
    fillerLeft: string;
    fillerRight: string;
    intervalTime: number;
  }
  class EmojiProgress {
    public value: number;
    public endValue: number;
    constructor(options: Partial<EmojiProgressOption>);

    public start(): void;

    public increase(v: number): void;

    public complete(): void;
  }
  export = EmojiProgress;
}
