import { enableProdMode } from '@angular/core';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import 'codemirror/addon/edit/continuelist';
import 'codemirror/keymap/vim';
import 'codemirror/mode/gfm/gfm';
import * as darkreader from 'darkreader';
import { AppModule } from './app/app.module';
import { environment } from './environments/environment';

darkreader.enable(
  {},
  {
    invert: [],
    css: `.cm-s-one-dark .CodeMirror-cursor, .cm-fat-cursor .CodeMirror-cursor {
  border-left-color: #fff !important;
  background: #fff !important;
}`,
    ignoreInlineStyle: [],
    ignoreImageAnalysis: [],
    disableStyleSheetsProxy: false,
  }
);

if (environment.production) {
  enableProdMode();
}

platformBrowserDynamic()
  .bootstrapModule(AppModule)
  .catch((err) => console.error(err));
