import {
  ChecklistItem,
  NormalizedChecklist,
  Task,
} from "@accel-shooter/node-shared";
import { HttpClient } from "@angular/common/http";
import { AfterViewInit, Component, OnInit, ViewChild } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { CodemirrorComponent } from "@ctrl/ngx-codemirror";
import { interval, merge, Subject } from "rxjs";
import { filter, map, switchMap, take, throttleTime } from "rxjs/operators";

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
  selector: "accel-shooter-task-page",
  templateUrl: "./task-page.component.html",
  styleUrls: ["./task-page.component.scss"],
})
export class TaskPageComponent implements OnInit, AfterViewInit {
  public taskId = "";
  public checklistMarkDown = "";
  @ViewChild(CodemirrorComponent)
  public codemirrorComponent?: CodemirrorComponent;
  public changeSubject = new Subject();
  public saveSubject = new Subject();

  constructor(private route: ActivatedRoute, private http: HttpClient) {}

  public ngOnInit(): void {
    this.taskId = this.route.snapshot.paramMap.get("id") as string;
    this.http
      .get<Task>(`/api/task/${this.taskId}`)
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
        this.startSync();
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
        Vim.defineEx("w", null, () => {
          this.saveSubject.next();
        });
      });
  }

  public startSync() {
    merge(
      this.changeSubject.asObservable().pipe(throttleTime(30 * 1000)),
      this.saveSubject.asObservable()
    )
      .pipe(
        switchMap(() =>
          this.http.put(`/api/task/${this.taskId}/checklist`, {
            checklist: this.checklistMarkDown,
          })
        )
      )
      .subscribe();
  }
}
