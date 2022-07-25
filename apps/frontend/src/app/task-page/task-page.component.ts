import { ChecklistItem, NormalizedChecklist } from '@accel-shooter/node-shared';
import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute, Router } from '@angular/router';
import { interval, merge, Subject } from 'rxjs';
import {
  concatMap,
  debounceTime,
  startWith,
  switchMap,
  take,
  tap,
} from 'rxjs/operators';
import { PageTitleService } from '../page-title.service';

export function normalizeClickUpChecklist(
  checklist: ChecklistItem[]
): NormalizedChecklist {
  checklist.sort((a, b) => a.orderindex - b.orderindex);
  return checklist.map((item, index) => ({
    name: item.name,
    checked: item.resolved,
    order: index,
    id: item.id,
  }));
}

@Component({
  selector: 'accel-shooter-task-page',
  templateUrl: './task-page.component.html',
  styleUrls: ['./task-page.component.scss'],
})
export class TaskPageComponent implements OnInit {
  public loaded = false;
  public taskId = '';
  public checklistMarkDown = '';
  public taskLink = '';
  public mergeRequestLink = '';
  public frameUrl = '';
  public fullTaskName = '';
  public mrPipelineStatus = '';
  public changeSubject = new Subject();
  public saveSubject = new Subject();

  constructor(
    private route: ActivatedRoute,
    private http: HttpClient,
    private matSnackBar: MatSnackBar,
    private router: Router,
    private pageTitleService: PageTitleService
  ) {}

  public ngOnInit(): void {
    this.taskId = this.route.snapshot.paramMap.get('id') as string;
    this.pageTitleService.setTitle(`Task "${this.taskId}"`);
    this.http
      .get<{
        mergeRequestLink: string;
        taskLink: string;
        content: string;
        frameUrl: string;
        fullTaskName: string;
      }>(`/api/task/${this.taskId}/checklist`)
      .pipe(take(1))
      .subscribe(
        ({ taskLink, mergeRequestLink, content, frameUrl, fullTaskName }) => {
          this.taskLink = taskLink;
          this.mergeRequestLink = mergeRequestLink;
          this.frameUrl = frameUrl;
          this.checklistMarkDown = content;
          this.fullTaskName = fullTaskName;
          this.loaded = true;
          this.startSync();
        }
      );
    interval(30000)
      .pipe(
        startWith(0),
        switchMap(() =>
          this.http.get<{ content: string }>(
            `/api/task/${this.taskId}/mr_pipeline_status`
          )
        ),
        tap((r) => {
          this.mrPipelineStatus = r.content;
        })
      )
      .subscribe();
  }

  public onContentChange(content: string) {
    this.checklistMarkDown = content;
    this.changeSubject.next();
  }

  public onSave() {
    this.saveSubject.next();
  }

  public openMergeRequestDescriptionLink(event: MouseEvent) {
    event.preventDefault();
    window.open(this.getMergeRequestDescriptionLink(this.taskId));
  }

  public startSync() {
    merge(
      this.changeSubject.asObservable().pipe(debounceTime(2000)),
      this.saveSubject.asObservable()
    )
      .pipe(
        concatMap(() =>
          this.http
            .put(`/api/task/${this.taskId}/checklist`, {
              checklist: this.checklistMarkDown,
            })
            .pipe(
              tap({
                next: () => {
                  this.matSnackBar.open('Saved!', '', { duration: 5000 });
                },
                error: () => {
                  this.matSnackBar.open('Error!', '', { duration: 5000 });
                },
              })
            )
        )
      )
      .subscribe();
  }

  private getMergeRequestDescriptionLink(id: string) {
    const internalUrl = `/merge_request_description/${id}`;

    // Resolve the base url as the full absolute url subtract the relative url.
    const currentAbsoluteUrl = window.location.href;
    const currentRelativeUrl = this.router.url;
    const index = currentAbsoluteUrl.indexOf(currentRelativeUrl);
    const baseUrl = currentAbsoluteUrl.substring(0, index);

    // Concatenate the urls to construct the desired absolute url.
    return baseUrl + internalUrl;
  }
}
