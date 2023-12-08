import { Comment, Task } from '@accel-shooter/node-shared';
import { HttpClient } from '@angular/common/http';
import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { map, Observable } from 'rxjs';

@Component({
  selector: 'accel-shooter-accel-up-page',
  templateUrl: './accel-up-page.component.html',
  styleUrls: ['./accel-up-page.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AccelUpPageComponent implements OnInit {
  public taskId = '';
  public task$!: Observable<Task>;
  public comments$!: Observable<Comment[]>;

  constructor(private route: ActivatedRoute, private http: HttpClient) {}

  public ngOnInit(): void {
    this.taskId = this.route.snapshot.paramMap.get('id') as string;
    this.task$ = this.http
      .get<{ task: Task }>(`/api/task/${this.taskId}`)
      .pipe(map((r) => r.task));
    this.comments$ = this.http
      .get<{ comments: Comment[] }>(`/api/task/${this.taskId}/comments`)
      .pipe(map((r) => r.comments));
  }
}
