import { HttpClient } from "@angular/common/http";
import { Component, OnInit } from "@angular/core";
import { MatSnackBar } from "@angular/material/snack-bar";
import { merge, Subject } from "rxjs";
import { concatMap, debounceTime, take, tap } from "rxjs/operators";

@Component({
  selector: "accel-shooter-todo-page",
  templateUrl: "./todo-page.component.html",
  styleUrls: ["./todo-page.component.scss"],
})
export class TodoPageComponent implements OnInit {
  public todo = "";
  public changeSubject = new Subject();
  public saveSubject = new Subject();
  constructor(private http: HttpClient, private matSnackBar: MatSnackBar) {}

  public ngOnInit(): void {
    this.http
      .get<{
        content: string;
      }>(`/api/todo`)
      .pipe(take(1))
      .subscribe(({ content }) => {
        this.todo = content;
      });
    this.startSync();
  }

  public onContentChange(content: string) {
    this.todo = content;
    this.changeSubject.next();
  }

  public onSave() {
    this.saveSubject.next();
  }

  public startSync() {
    merge(
      this.changeSubject.asObservable().pipe(debounceTime(2000)),
      this.saveSubject.asObservable()
    )
      .pipe(
        concatMap(() =>
          this.http
            .put(`/api/todo`, {
              content: this.todo,
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
