import untildify from "untildify";
import { CONFIG } from "../config";
import { BaseFileRef } from "./base-file-ref.class";

export class DailyProgress extends BaseFileRef {
  protected get path() {
    return untildify(CONFIG.DailyProgressFile);
  }

  public addProgressToBuffer(dailyProgressString: string) {
    const content = this.readFile();
    const updatedDpContent = content.replace(
      "## Buffer",
      `## Buffer\n    ${dailyProgressString}`
    );
    this.writeFile(updatedDpContent);
  }

  public getRecordByDay(day: string) {
    const content = this.readFile();
    const matchResult = content.match(new RegExp(`(### ${day}.*?)\n###`, "s"));
    if (matchResult) {
      const record = matchResult[1];
      if (/2\. Today\n3\./.test(record)) {
        console.log("Today content is empty.");
        return null;
      } else {
        return record;
      }
    } else {
      console.log("DP record does not exist.");
      return null;
    }
  }

  public writeRecordByDay(day: string, record: string) {
    const oldRecord = this.getRecordByDay(day);
    if (oldRecord) {
      const content = this.readFile();
      const newContent = content.replace(oldRecord, record);
      this.writeFile(newContent);
    }
  }
}
