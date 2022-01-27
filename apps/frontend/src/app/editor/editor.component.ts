import {
  AfterViewInit,
  Component,
  EventEmitter,
  Input,
  Output,
  ViewChild,
} from "@angular/core";
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
  @Output() public contentChange = new EventEmitter<string>();
  @Output() public save = new EventEmitter<void>();
  @ViewChild(CodemirrorComponent)
  public codemirrorComponent?: CodemirrorComponent;

  public ngAfterViewInit(): void {
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
}
