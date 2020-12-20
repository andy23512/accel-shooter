import { readFileSync, writeFileSync } from 'fs';

export abstract class BaseFileRef {
  protected abstract get path(): string;

  protected readFile() {
    return readFileSync(this.path, { encoding: 'utf-8' });
  }

  protected writeFile(content: string) {
    writeFileSync(this.path, content);
  }
}
