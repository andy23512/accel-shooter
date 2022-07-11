import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute } from '@angular/router';
import { merge, Subject } from 'rxjs';
import { concatMap, debounceTime, take, tap } from 'rxjs/operators';
import { PageTitleService } from '../page-title.service';

@Component({
  selector: 'accel-shooter-merge-request-description-page',
  templateUrl: './merge-request-description-page.component.html',
  styleUrls: ['./merge-request-description-page.component.scss'],
})
export class MergeRequestDescriptionPageComponent implements OnInit {
  public taskId = '';
  public mergeRequestDescriptionContent = '';
  public changeSubject = new Subject();
  public saveSubject = new Subject();

  constructor(
    private route: ActivatedRoute,
    private http: HttpClient,
    private matSnackBar: MatSnackBar,
    private pageTitleService: PageTitleService
  ) {}

  public ngOnInit(): void {
    this.taskId = this.route.snapshot.paramMap.get('id') as string;
    this.pageTitleService.setTitle(`MRD "${this.taskId}"`);
    this.http
      .get<{
        content: string;
      }>(`/api/task/${this.taskId}/mr_description`)
      .pipe(take(1))
      .subscribe(({ content }) => {
        this.mergeRequestDescriptionContent = content;
        this.startSync();
      });
  }

  public onContentChange(content: string) {
    this.mergeRequestDescriptionContent = content;
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
            .put(`/api/task/${this.taskId}/mr_description`, {
              content: this.mergeRequestDescriptionContent,
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
}
