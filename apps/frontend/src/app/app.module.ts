import { HttpClientModule } from "@angular/common/http";
import { NgModule } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { MatSnackBarModule } from "@angular/material/snack-bar";
import { BrowserModule } from "@angular/platform-browser";
import { BrowserAnimationsModule } from "@angular/platform-browser/animations";
import { RouterModule } from "@angular/router";
import { CodemirrorModule } from "@ctrl/ngx-codemirror";
import { AppComponent } from "./app.component";
import { TaskPageComponent } from "./task-page/task-page.component";

@NgModule({
  declarations: [AppComponent, TaskPageComponent],
  imports: [
    BrowserModule,
    HttpClientModule,
    FormsModule,
    CodemirrorModule,
    BrowserAnimationsModule,
    RouterModule.forRoot([
      {
        path: "task/:id",
        component: TaskPageComponent,
      },
    ]),
    MatSnackBarModule,
  ],
  providers: [],
  bootstrap: [AppComponent],
})
export class AppModule {}
