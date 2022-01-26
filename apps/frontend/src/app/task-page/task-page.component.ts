import { ChecklistItem, NormalizedChecklist } from "@accel-shooter/node-shared";
import { HttpClient } from "@angular/common/http";
import { AfterViewInit, Component, OnInit, ViewChild } from "@angular/core";
import { MatSnackBar } from "@angular/material/snack-bar";
import { ActivatedRoute } from "@angular/router";
import { CodemirrorComponent } from "@ctrl/ngx-codemirror";
import { interval, merge, Subject } from "rxjs";
import {
  debounceTime,
  filter,
  map,
  switchMap,
  take,
  tap,
} from "rxjs/operators";

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
  public taskLink = "";
  public mergeRequestLink = "";
  public frameUrl = "";
  @ViewChild(CodemirrorComponent)
  public codemirrorComponent?: CodemirrorComponent;
  public changeSubject = new Subject();
  public saveSubject = new Subject();

  constructor(
    private route: ActivatedRoute,
    private http: HttpClient,
    private matSnackBar: MatSnackBar
  ) {}

  public ngOnInit(): void {
    this.taskId = this.route.snapshot.paramMap.get("id") as string;
    this.http
      .get<{
        mergeRequestLink: string;
        taskLink: string;
        content: string;
        frameUrl: string;
      }>(`/api/task/${this.taskId}/checklist`)
      .pipe(take(1))
      .subscribe(({ taskLink, mergeRequestLink, content, frameUrl }) => {
        this.taskLink = taskLink;
        this.mergeRequestLink = mergeRequestLink;
        this.frameUrl = frameUrl;
        this.checklistMarkDown = content;
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
        console.log("nanoha");
        const Vim = codeMirror.constructor.Vim;
        Vim.unmap("z");
        Vim.unmap("Z");
        Vim.defineAction("checkMdCheckbox", (cm: any) => {
          if (cm.state.vim.visualMode) {
            Vim.handleEx(cm, "'<,'>s/- \\[\\s\\]/- [x]/g");
          } else {
            Vim.handleEx(cm, "s/- \\[\\s\\]/- [x]/g");
          }
        });
        Vim.defineAction("uncheckMdCheckbox", (cm: any) => {
          if (cm.state.vim.visualMode) {
            Vim.handleEx(cm, "'<,'>s/- \\[x\\]/- [ ]/g");
          } else {
            Vim.handleEx(cm, "s/- \\[x\\]/- [ ]/g");
          }
        });
        Vim.defineAction("save", () => {
          this.saveSubject.next();
        });
        Vim.mapCommand("z", "action", "checkMdCheckbox");
        Vim.mapCommand("Z", "action", "uncheckMdCheckbox");
        Vim.mapCommand("<C-s>", "action", "save");
        Vim.defineEx("w", null, () => {
          this.saveSubject.next();
        });
      });
  }

  public onContentChange(content: string) {
    this.checklistMarkDown = content;
    this.changeSubject.next();
  }

  public startSync() {
    merge(
      this.changeSubject.asObservable().pipe(debounceTime(2000)),
      this.saveSubject.asObservable()
    )
      .pipe(
        switchMap(() =>
          this.http
            .put(`/api/task/${this.taskId}/checklist`, {
              checklist: this.checklistMarkDown,
            })
            .pipe(
              tap({
                next: () => {
                  this.matSnackBar.open("Saved!", "", { duration: 5000 });
                },
                error: () => {
                  this.matSnackBar.open("Error!", "", { duration: 5000 });
                },
              })
            )
        )
      )
      .subscribe();
  }
}
