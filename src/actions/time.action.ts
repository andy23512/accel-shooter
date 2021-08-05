import clipboardy from "clipboardy";
import { format } from "date-fns";

export async function timeAction() {
  clipboardy.writeSync(format(new Date(), "yyyyMMdd_HHmmss"));
  console.log("Copied!");
}
