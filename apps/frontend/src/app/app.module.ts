import { ClipboardModule } from '@angular/cdk/clipboard';
import { HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { RouterModule } from '@angular/router';
import { CodemirrorModule } from '@ctrl/ngx-codemirror';
import { LoadingBarModule } from '@ngx-loading-bar/core';
import { LoadingBarHttpClientModule } from '@ngx-loading-bar/http-client';
import { LoadingBarRouterModule } from '@ngx-loading-bar/router';
import { AgGridModule } from 'ag-grid-angular';
import { MarkdownModule } from 'ngx-markdown';
import { AccelUpPageComponent } from './accel-up-page/accel-up-page.component';
import { AppComponent } from './app.component';
import { EditorComponent } from './editor/editor.component';
import { MarkdownPageComponent } from './markdown-page/markdown-page.component';
import { MergeRequestDescriptionPageComponent } from './merge-request-description-page/merge-request-description-page.component';
import { TaskPageComponent } from './task-page/task-page.component';
import { PriorityCellRendererComponent } from './tasks-page/priority-cell-renderer.component';
import { TaskNameCellRendererComponent } from './tasks-page/task-name-cell-renderer.component';
import { TaskStatusCellRendererComponent } from './tasks-page/task-status-cell-renderer.component';
import { TasksPageComponent } from './tasks-page/tasks-page.component';
import { TddWidgetComponent } from './tdd-widget/tdd-widget.component';

@NgModule({
  declarations: [
    AppComponent,
    EditorComponent,
    MarkdownPageComponent,
    TaskPageComponent,
    TasksPageComponent,
    TaskNameCellRendererComponent,
    PriorityCellRendererComponent,
    TaskStatusCellRendererComponent,
    MergeRequestDescriptionPageComponent,
    AccelUpPageComponent,
    TddWidgetComponent,
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    FormsModule,
    CodemirrorModule,
    BrowserAnimationsModule,
    RouterModule.forRoot([
      {
        path: 'tasks',
        component: TasksPageComponent,
      },
      {
        path: 'task/:id',
        component: TaskPageComponent,
      },
      {
        path: 'markdown/:id',
        component: MarkdownPageComponent,
      },
      {
        path: 'merge_request_description/:id',
        component: MergeRequestDescriptionPageComponent,
      },
      {
        path: 'accel-up/:id',
        component: AccelUpPageComponent,
      },
      {
        path: '',
        pathMatch: 'full',
        redirectTo: 'markdown/todo',
      },
    ]),
    MatSnackBarModule,
    MatTooltipModule,
    MatIconModule,
    MatButtonModule,
    LoadingBarHttpClientModule,
    LoadingBarRouterModule,
    LoadingBarModule,
    ClipboardModule,
    AgGridModule,
    MarkdownModule.forRoot(),
  ],
  providers: [],
  bootstrap: [AppComponent],
})
export class AppModule {}
