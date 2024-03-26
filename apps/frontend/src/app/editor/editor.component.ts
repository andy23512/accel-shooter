import { EditorConfiguration } from 'codemirror';
import { fromEvent, interval } from 'rxjs';
import { filter, map, take } from 'rxjs/operators';

import { Clipboard } from '@angular/cdk/clipboard';
import {
  AfterViewInit,
  Component,
  ElementRef,
  EventEmitter,
  Input,
  OnChanges,
  Output,
  SimpleChanges,
  ViewChild,
} from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { CodemirrorComponent } from '@ctrl/ngx-codemirror';

@Component({
  selector: 'accel-shooter-editor',
  templateUrl: './editor.component.html',
  styleUrls: ['./editor.component.scss'],
})
export class EditorComponent implements AfterViewInit, OnChanges {
  @Input() public content = '';
  @Input() public lineWrapping = false;
  @Output() public contentChange = new EventEmitter<string>();
  @Output() public save = new EventEmitter<void>();
  @Output() public externalAction = new EventEmitter<void>();
  @ViewChild(CodemirrorComponent)
  public codemirrorComponent?: CodemirrorComponent;
  public previewMode = false;
  public option: EditorConfiguration = {
    lineNumbers: true,
    theme: 'one-dark',
    mode: 'gfm',
    tabSize: 2,
    indentWithTabs: false,
    keyMap: 'vim',
    lineWrapping: this.lineWrapping,
    extraKeys: {
      Enter: 'newlineAndIndentContinueMarkdownList',
      Tab: function (cm) {
        const tab = '\t';

        // contruct x length spaces
        const spaces = Array(
          parseInt(cm.getOption('indentUnit') as unknown as string) + 1
        ).join(' ');

        // auto indent whole line when in list or blockquote
        const cursor = cm.getCursor();
        const line = cm.getLine(cursor.line);

        // this regex match the following patterns
        // 1. blockquote starts with "> " or ">>"
        // 2. unorder list starts with *+-
        // 3. order list starts with "1." or "1)"
        const regex = /^(\s*)(>[> ]*|[*+-]\s|(\d+)([.)]))/;

        let match;
        const multiple =
          cm.getSelection().split('\n').length > 1 ||
          cm.getSelections().length > 1;

        if (multiple) {
          cm.execCommand('defaultTab');
        } else if ((match = regex.exec(line)) !== null) {
          const ch = match[1].length;
          const pos = {
            line: cursor.line,
            ch: ch,
          };
          if (cm.getOption('indentWithTabs')) {
            cm.replaceRange(tab, pos, pos, '+input');
          } else {
            cm.replaceRange(spaces, pos, pos, '+input');
          }
        } else {
          if (cm.getOption('indentWithTabs')) {
            cm.execCommand('defaultTab');
          } else {
            cm.replaceSelection(spaces);
          }
        }
      },
    },
  };

  constructor(
    private elementRef: ElementRef,
    private router: Router,
    private clipboard: Clipboard,
    private matSnackBar: MatSnackBar
  ) {}

  public ngOnChanges(changes: SimpleChanges): void {
    if (changes.lineWrapping) {
      this.option = {
        ...this.option,
        lineWrapping: this.lineWrapping,
      };
    }
  }

  public ngAfterViewInit(): void {
    this.elementRef.nativeElement.addEventListener(
      'auxclick',
      (e: MouseEvent) => {
        if (e.button == 1) {
          const target = e.target as HTMLElement;
          const classNames = target.className.split(' ');
          let url: string | undefined = '';
          if (classNames.includes('cm-url')) {
            url = target?.textContent?.replace(/[()]+/g, '');
          } else if (classNames.includes('cm-link')) {
            url = target.nextSibling?.textContent?.replace(/[()]+/g, '');
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
                this.matSnackBar.open(`Task ID ${taskId} copied!`, '', {
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
        Vim.unmap('z');
        Vim.unmap('Z');
        Vim.defineAction('checkMdCheckbox', (cm: any) => {
          if (cm.state.vim.visualMode) {
            Vim.handleEx(cm, "'<,'>s/- \\[\\s\\]/- [x]/g");
            Vim.handleKey(cm, 'j');
          } else {
            Vim.handleEx(cm, 's/- \\[\\s\\]/- [x]/g');
            Vim.handleKey(cm, 'j');
          }
        });
        Vim.defineAction('uncheckMdCheckbox', (cm: any) => {
          if (cm.state.vim.visualMode) {
            Vim.handleEx(cm, "'<,'>s/- \\[x\\]/- [ ]/g");
            Vim.handleKey(cm, 'j');
          } else {
            Vim.handleEx(cm, 's/- \\[x\\]/- [ ]/g');
            Vim.handleKey(cm, 'j');
          }
        });
        Vim.defineAction('externalAction', () => {
          this.externalAction.emit();
        });
        Vim.mapCommand('z', 'action', 'checkMdCheckbox');
        Vim.mapCommand('Z', 'action', 'uncheckMdCheckbox');
        Vim.mapCommand('\\', 'action', 'externalAction');
        Vim.defineEx('w', null, () => {
          this.save.next();
        });
      });
    fromEvent(this.elementRef.nativeElement, 'mouseup').subscribe(() => {
      const codeMirror = this.codemirrorComponent?.codeMirror;
      const selectedText = codeMirror?.getSelection();
      if (selectedText) {
        this.clipboard.copy(selectedText);
      }
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
