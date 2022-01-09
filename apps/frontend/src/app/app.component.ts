import {
  ChecklistItem,
  NormalizedChecklist,
  Task,
} from "@accel-shooter/node-shared";
import { HttpClient } from "@angular/common/http";
import { Component, OnInit } from "@angular/core";
import { map, take } from "rxjs/operators";

export function normalizeClickUpChecklist(
  checklist: ChecklistItem[]
): NormalizedChecklist {
  return checklist
    .sort((a, b) => a.orderindex - b.orderindex)
    .map((item, index) => ({
      name: item.name,
      checked: item.resolved,
      order: index,
      id: item.id,
    }));
}

@Component({
  selector: "accel-shooter-root",
  templateUrl: "./app.component.html",
  styleUrls: ["./app.component.scss"],
})
export class AppComponent implements OnInit {
  public checklistMarkDown = "";
  constructor(private http: HttpClient) {}

  public ngOnInit(): void {
    this.http
      .get<Task>("/api/task/aj55xx")
      .pipe(
        take(1),
        map((task) => {
          const targetChecklist = task.checklists.find((c) =>
            c.name.toLowerCase().includes("synced checklist")
          );
          if (targetChecklist) {
            const clickUpNormalizedChecklist = normalizeClickUpChecklist(
              targetChecklist.items
            );
            return clickUpNormalizedChecklist
              .map((c) =>
                c.name.replace(
                  /^-*/,
                  (dashes) =>
                    dashes.replace(/-/g, " ") +
                    (c.checked ? "- [x] " : "- [ ] ")
                )
              )
              .join("\n");
          }
          return "";
        })
      )
      .subscribe((markdown) => {
        this.checklistMarkDown = markdown;
      });
  }
}
