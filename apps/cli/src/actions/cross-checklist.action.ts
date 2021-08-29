import { CONFIG } from "@accel-shooter/node-shared";
import clipboardy from "clipboardy";
import inquirer from "inquirer";

export async function crossChecklistAction() {
  const answers = await inquirer.prompt([
    {
      name: "initialSpaces",
      message: "Enter prefix spaces",
      type: "input",
    },
    {
      name: "firstLevel",
      message: "Enter first level items",
      type: "editor",
    },
    {
      name: "secondLevel",
      message: "Enter second level items",
      type: "editor",
      default: CONFIG.CrossChecklistDefaultSecondLevel.join("\n"),
    },
  ]);
  const firstLevelItems = (answers.firstLevel as string)
    .split("\n")
    .filter(Boolean);
  const secondLevelItems = (answers.secondLevel as string)
    .split("\n")
    .filter(Boolean);
  const result = firstLevelItems
    .map(
      (e) =>
        answers.initialSpaces +
        "  - [ ] " +
        e +
        "\n" +
        secondLevelItems
          .map((f) => `${answers.initialSpaces}    - [ ] ${f}`)
          .join("\n")
    )
    .join("\n");
  clipboardy.writeSync(result);
  console.log(result);
  console.log("Copied!");
}
