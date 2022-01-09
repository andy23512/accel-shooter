import {
  ChecklistItem,
  NormalizedChecklist,
  Task,
} from "@accel-shooter/node-shared";
import { HttpClient } from "@angular/common/http";
import { Component, OnInit } from "@angular/core";

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
  public task$ = this.http.get<Task>("/api/task/aj55xx");
  constructor(private http: HttpClient) {}

  public ngOnInit(): void {
    this.task$.subscribe((task) => {
      const targetChecklist = task.checklists.find((c) =>
        c.name.toLowerCase().includes("synced checklist")
      );
      if (targetChecklist) {
        const clickUpNormalizedChecklist = normalizeClickUpChecklist(
          targetChecklist.items
        );
        const checklistMarkdown = clickUpNormalizedChecklist
          .map((c) =>
            c.name.replace(
              /^-*/,
              (dashes) =>
                dashes.replace(/-/g, " ") + (c.checked ? "- [x] " : "- [ ] ")
            )
          )
          .join("\n");
        console.log(checklistMarkdown);
      }
    });
  }
}
