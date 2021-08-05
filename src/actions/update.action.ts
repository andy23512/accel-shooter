import { format } from "date-fns";
import { DailyProgress } from "../classes/daily-progress.class";
import { updateTaskStatusInDp } from "../utils";

export async function updateAction() {
  const day =
    process.argv.length >= 4
      ? process.argv[3]
      : format(new Date(), "yyyy/MM/dd");
  const dp = new DailyProgress();
  const record = dp.getRecordByDay(day);
  if (record) {
    const newDpRecord = await updateTaskStatusInDp(record);
    dp.writeRecordByDay(day, newDpRecord);
    console.log(newDpRecord);
    console.log("Updated!");
  }
}
