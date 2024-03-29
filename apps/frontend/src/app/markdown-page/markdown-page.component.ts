import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute } from '@angular/router';
import { SseClient } from 'angular-sse-client';
import moment, { Moment } from 'moment';
import { merge, Subject } from 'rxjs';
import { concatMap, debounceTime, take, tap } from 'rxjs/operators';
import { PageTitleService } from './../page-title.service';

@Component({
  selector: 'accel-shooter-markdown-page',
  templateUrl: './markdown-page.component.html',
  styleUrls: ['./markdown-page.component.scss'],
})
export class MarkdownPageComponent implements OnInit {
  public markdownId = '';
  public markdownContent = '';
  public changeSubject = new Subject<void>();
  public saveSubject = new Subject<void>();
  public lastChangedTime!: Moment;
  constructor(
    private http: HttpClient,
    private matSnackBar: MatSnackBar,
    private route: ActivatedRoute,
    private sseClient: SseClient,
    private pageTitleService: PageTitleService
  ) {}

  public ngOnInit(): void {
    this.markdownId = this.route.snapshot.paramMap.get('id') as string;
    this.pageTitleService.setTitle(`Markdown "${this.markdownId}"`);
    this.http
      .get<{
        content: string;
      }>(`/api/markdown/${this.markdownId}`)
      .pipe(take(1))
      .subscribe(({ content }) => {
        this.markdownContent = content;
        this.lastChangedTime = moment();
        if (this.markdownId === 'todo') {
          this.startTodoSse();
        }
      });
    this.startSync();
  }

  public onContentChange(content: string) {
    this.markdownContent = content;
    this.lastChangedTime = moment();
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
            .put(`/api/markdown/${this.markdownId}`, {
              content: this.markdownContent,
            })
            .pipe(
              tap({
                next: () => {
                  this.matSnackBar.open('Saved!', '', { duration: 5000 });
                },
                error: () => {
                  this.matSnackBar.open('Error!', '');
                },
              })
            )
        )
      )
      .subscribe();
  }

  public startTodoSse() {
    this.sseClient.get('/api/todo-sse').subscribe((data) => {
      const receiveTime = moment();
      if (
        receiveTime.isAfter(this.lastChangedTime) &&
        this.markdownContent !== data
      ) {
        this.markdownContent = data;
        this.lastChangedTime = receiveTime;
      }
    });
  }
}
