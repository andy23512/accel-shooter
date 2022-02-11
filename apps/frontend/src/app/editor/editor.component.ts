import { Clipboard } from "@angular/cdk/clipboard";
import {
  AfterViewInit,
  Component,
  ElementRef,
  EventEmitter,
  Input,
  Output,
  ViewChild,
} from "@angular/core";
import { MatSnackBar } from "@angular/material/snack-bar";
import { Router } from "@angular/router";
import { CodemirrorComponent } from "@ctrl/ngx-codemirror";
import { interval } from "rxjs";
import { filter, map, take } from "rxjs/operators";

@Component({
  selector: "accel-shooter-editor",
  templateUrl: "./editor.component.html",
  styleUrls: ["./editor.component.scss"],
})
export class EditorComponent implements AfterViewInit {
  @Input() public content = "";
  @Input() public lineWrapping = false;
  @Output() public contentChange = new EventEmitter<string>();
  @Output() public save = new EventEmitter<void>();
  @ViewChild(CodemirrorComponent)
  public codemirrorComponent?: CodemirrorComponent;

  constructor(
    private elementRef: ElementRef,
    private router: Router,
    private clipboard: Clipboard,
    private matSnackBar: MatSnackBar
  ) {}

  public ngAfterViewInit(): void {
    this.elementRef.nativeElement.addEventListener(
      "auxclick",
      (e: MouseEvent) => {
        if (e.button == 1) {
          const target = e.target as HTMLElement;
          const classNames = target.className.split(" ");
          let url: string | undefined = "";
          if (classNames.includes("cm-url")) {
            url = target?.textContent?.replace(/[()]+/g, "");
          } else if (classNames.includes("cm-link")) {
            url = target.nextSibling?.textContent?.replace(/[()]+/g, "");
          }
          if (url) {
            if (e.metaKey) {
              const match = url.match(/https:\/\/app.clickup.com\/t\/(\w+)/);
              if (match) {
                const taskLink = this.getTaskLink(match[1]);
                window.open(taskLink);
              }
            } else if (e.ctrlKey) {
              const match = url.match(/https:\/\/app.clickup.com\/t\/(\w+)/);
              if (match) {
                const taskId = match[1];
                this.clipboard.copy(taskId);
                this.matSnackBar.open(`Task ID ${taskId} copied!`, "", {
                  duration: 5000,
                });
              }
            } else {
              window.open(url);
            }
          }
        }
      }
    );
    interval(500)
      .pipe(
        map(() => this.codemirrorComponent?.codeMirror),
        filter((c) => !!c),
        take(1)
      )
      .subscribe((codeMirror: any) => {
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
        Vim.mapCommand("z", "action", "checkMdCheckbox");
        Vim.mapCommand("Z", "action", "uncheckMdCheckbox");
        Vim.defineEx("w", null, () => {
          this.save.next();
        });
      });
  }

  public getTaskLink(id: string) {
    const internalUrl = `/task/${id}`;

    // Resolve the base url as the full absolute url subtract the relative url.
    const currentAbsoluteUrl = window.location.href;
    const currentRelativeUrl = this.router.url;
    const index = currentAbsoluteUrl.indexOf(currentRelativeUrl);
    const baseUrl = currentAbsoluteUrl.substring(0, index);

    // Concatenate the urls to construct the desired absolute url.
    return baseUrl + internalUrl;
  }
}
