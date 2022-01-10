import {
  ChecklistItem,
  NormalizedChecklist,
  Task,
} from "@accel-shooter/node-shared";
import { HttpClient } from "@angular/common/http";
import { AfterViewInit, Component, OnInit, ViewChild } from "@angular/core";
import { CodemirrorComponent } from "@ctrl/ngx-codemirror";
import { interval } from "rxjs";
import { filter, map, take } from "rxjs/operators";

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
export class AppComponent implements OnInit, AfterViewInit {
  public checklistMarkDown = "";
  @ViewChild(CodemirrorComponent)
  public codemirrorComponent?: CodemirrorComponent;

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

  public ngAfterViewInit(): void {
    interval(500)
      .pipe(
        map(() => this.codemirrorComponent?.codeMirror),
        filter((c) => !!c),
        take(1)
      )
      .subscribe((codeMirror: any) => {
        const Vim = codeMirror.constructor.Vim;
        Vim.unmap("c");
        Vim.unmap("C");
        Vim.defineAction("checkMdCheckbox", (cm: any) => {
          Vim.handleEx(cm, "s/- \\[\\s\\]/- [x]/g");
        });
        Vim.defineAction("uncheckMdCheckbox", (cm: any) => {
          console.log(cm);
          Vim.handleEx(cm, "s/- \\[x\\]/- [ ]/g");
          Vim.handleEx(cm, "s/someimpossibleword//g");
        });
        Vim.mapCommand("c", "action", "checkMdCheckbox");
        Vim.mapCommand("C", "action", "uncheckMdCheckbox");
      });
  }
}
