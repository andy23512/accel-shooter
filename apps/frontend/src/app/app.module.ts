import { ClipboardModule } from '@angular/cdk/clipboard';
import { HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { RouterModule } from '@angular/router';
import { CodemirrorModule } from '@ctrl/ngx-codemirror';
import { LoadingBarModule } from '@ngx-loading-bar/core';
import { LoadingBarHttpClientModule } from '@ngx-loading-bar/http-client';
import { LoadingBarRouterModule } from '@ngx-loading-bar/router';
import { AgGridModule } from 'ag-grid-angular';
import { AppComponent } from './app.component';
import { EditorComponent } from './editor/editor.component';
import { MarkdownPageComponent } from './markdown-page/markdown-page.component';
import { TaskPageComponent } from './task-page/task-page.component';
import { PriorityCellRendererComponent } from './tasks-page/priority-cell-renderer.component';
import { TaskNameCellRendererComponent } from './tasks-page/task-name-cell-renderer.component';
import { TasksPageComponent } from './tasks-page/tasks-page.component';

@NgModule({
  declarations: [
    AppComponent,
    EditorComponent,
    MarkdownPageComponent,
    TaskPageComponent,
    TasksPageComponent,
    TaskNameCellRendererComponent,
    PriorityCellRendererComponent,
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
        path: '',
        pathMatch: 'full',
        redirectTo: 'markdown/todo',
      },
    ]),
    MatSnackBarModule,
    LoadingBarHttpClientModule,
    LoadingBarRouterModule,
    LoadingBarModule,
    ClipboardModule,
    AgGridModule.withComponents([
      TaskNameCellRendererComponent,
      PriorityCellRendererComponent,
    ]),
  ],
  providers: [],
  bootstrap: [AppComponent],
})
export class AppModule {}
