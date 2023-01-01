import { Command } from 'commander';

export abstract class Action {
  public abstract command: string;
  public abstract description: string;
  public arguments: { name: string; description: string }[] = [];
  public options: { flags: string; description: string }[] = [];
  public abstract run(...args: any[]): Promise<void>;
  public init(program: Command) {
    const command = program.command(this.command).description(this.description);
    this.arguments.forEach(({ name, description }) => {
      command.argument(name, description);
    });
    this.options.forEach(({ flags, description }) => {
      command.option(flags, description);
    });
    command.action(this.run);
  }
}

/*
export class Action extends Action {
  public command = '';
  public description = '';
  public arguments = [{ name: '', description: '' }];
  public options = [{ flags: '', description: '' }];
  public async run() {}
}
*/
