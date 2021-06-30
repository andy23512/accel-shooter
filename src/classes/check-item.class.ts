import { concat, defer, of } from "rxjs";
import { map } from "rxjs/operators";
import { CheckContext } from "./../models/check.models";

export class CheckItem {
  public displayName: string;

  constructor(
    public group: string,
    public name: string,
    public defaultChecked: boolean,
    public run: (context: CheckContext) => Promise<{
      stdout?: string;
      stderr?: string;
      code: number;
    }>,
    public stdoutReducer?: (output: string) => string
  ) {
    this.displayName = `[${this.group}] ${this.name}`;
  }

  public getObs(context: CheckContext) {
    return concat(
      of({
        group: this.group,
        name: this.name,
        code: -1,
        stdout: "",
        stderr: "",
      }),
      defer(() => this.run(context)).pipe(
        map((d: any) => {
          const result: {
            group?: string;
            name?: string;
            code: number;
            stdout?: string;
            stderr?: string;
          } = d;
          result.group = this.group;
          result.name = this.name;
          if (this.stdoutReducer && result.stdout) {
            result.stdout = this.stdoutReducer(result.stdout);
          }
          return result;
        })
      )
    );
  }
}
