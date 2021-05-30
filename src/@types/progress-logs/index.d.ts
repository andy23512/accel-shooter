declare module "progress-logs" {
  interface ProgressLogOptions {
    title?: string;
    record?: boolean;
    loadingEffect?: number;
  }
  interface ProgressLogItemOptions {
    color?: string | Partial<statusOptions>;
    emoji?: string | Partial<statusOptions>;
  }
  interface statusOptions {
    success: string;
    warning: string;
    fail: string;
  }
  enum StopExitCode {
    success = 0,
    fail = 1,
    warning = 2,
  }
  class ProgressLog {
    private queue;
    protected currentLogItem: any;
    private tracker;
    private readonly options;
    constructor(options: ProgressLogOptions);
    /**
     * Add log item into the log queue
     * @param title: the title of the log item
     * @param command: the command of the log item
     * @param options: the emoji config of the log item
     */
    add(
      title: string,
      command?: string,
      options?: ProgressLogItemOptions
    ): void;
    /**
     * Start run the log queue
     */
    public start(): void;
    /**
     * run next log item in the log queue
     */
    public next(): void;
    /**
     * Stop the log queue with exit code
     * @param exitCode exit status code
     */
    public end(exitCode: StopExitCode): void;
    /**
     * set global log item's emoji
     * @param options: the emoji options eg: { success: 'heart' }
     */
    setGlobalLogEmoji(options: Partial<statusOptions>): void;
    /**
     * set global log item's color
     * @param options: the emoji options eg: { success: 'green' }
     */
    setGlobalLogColor(options: Partial<statusOptions>): void;
    /**
     * Start the time record
     * @private
     */
    private startRecord;
    /**
     * Stop the time record
     * @private
     */
    private stopRecord;
    /**
     * Compute the record time and print to console
     * @private
     */
    private printRecord;
    /**
     * Run log queue start the log item
     */
    protected run(): void;
  }
  export = ProgressLog;
}
