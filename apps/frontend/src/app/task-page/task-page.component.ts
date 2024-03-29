import { TddStage } from '@accel-shooter/api-interfaces';
import { ChecklistItem, NormalizedChecklist } from '@accel-shooter/node-shared';
import { Clipboard } from '@angular/cdk/clipboard';
import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject, interval, merge } from 'rxjs';
import {
  concatMap,
  debounceTime,
  startWith,
  switchMap,
  take,
  takeWhile,
  tap,
} from 'rxjs/operators';
import { PageTitleService } from '../page-title.service';
import { TDD_STAGES } from '../tdd-stages.consts';

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
  public fullTaskName = '';
  public mrPipelineStatus = '';
  public mrLinked = false;
  public changeSubject = new Subject<void>();
  public saveSubject = new Subject<void>();
  public links: { name: string; url: string }[] = [];
  public currentTddStage: TddStage = TddStage.Test;

  constructor(
    private route: ActivatedRoute,
    private http: HttpClient,
    private matSnackBar: MatSnackBar,
    private router: Router,
    private pageTitleService: PageTitleService,
    private clipboard: Clipboard
  ) {}

  public ngOnInit(): void {
    this.taskId = this.route.snapshot.paramMap.get('id') as string;
    this.pageTitleService.setTitle(`Task "${this.taskId}"`);
    this.http
      .get<{
        mergeRequestLink: string;
        taskLink: string;
        content: string;
        fullTaskName: string;
        links: { name: string; url: string }[];
      }>(`/api/task/${this.taskId}/checklist`)
      .pipe(take(1))
      .subscribe(
        ({ taskLink, mergeRequestLink, content, fullTaskName, links }) => {
          this.taskLink = taskLink;
          this.mergeRequestLink = mergeRequestLink;
          this.checklistMarkDown = content;
          this.fullTaskName = fullTaskName;
          this.loaded = true;
          this.links = links;
          this.startSync();
        }
      );
    this.http
      .get<{ stage: TddStage }>(`/api/task/${this.taskId}/tdd_stage`)
      .subscribe(({ stage }) => {
        this.currentTddStage = stage;
      });
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
    interval(30000)
      .pipe(
        startWith(0),
        switchMap(() =>
          this.http.get<{ linked: boolean }>(
            `/api/task/${this.taskId}/mr_link_status`
          )
        ),
        takeWhile(({ linked }) => !linked, true),
        tap(({ linked }) => {
          this.mrLinked = linked;
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

  public copyTaskId() {
    this.clipboard.copy(this.taskId);
    this.matSnackBar.open(`Task ID ${this.taskId} copied!`, '', {
      duration: 5000,
    });
  }

  public saveStage(stage: TddStage) {
    this.http
      .put(`/api/task/${this.taskId}/tdd_stage`, { stage })
      .subscribe(() => {
        this.currentTddStage = stage;
      });
  }

  public goToNextTddStage() {
    const nextStage = TDD_STAGES.find((s) => s.name === this.currentTddStage)
      ?.next as TddStage;
    this.saveStage(nextStage);
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
