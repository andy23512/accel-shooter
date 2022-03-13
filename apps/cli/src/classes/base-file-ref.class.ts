import { readFileSync, writeFileSync } from 'fs';

export abstract class BaseFileRef {
  protected abstract get path(): string;

  public readFile() {
    return readFileSync(this.path, { encoding: 'utf-8' });
  }

  public writeFile(content: string) {
    writeFileSync(this.path, content);
  }
}
