import readline from "readline";

export function configReadline() {
  readline.emitKeypressEvents(process.stdin);
}
