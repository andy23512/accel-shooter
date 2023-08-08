import { existsSync } from 'fs';
import { glob } from 'glob';
import path from 'path';
import { Action } from '../classes/action.class';
import { promiseSpawn } from '../utils';

export class GenAction extends Action {
  public command = 'gen';
  public description = 'shorthand for nx angular generate command';
  public arguments = [
    { name: 'generator', description: 'generator name' },
    { name: 'name', description: 'instance name' },
  ];

  public async run(generator: string, name: string) {
    const cwd = process.cwd();
    let modulePath = '';
    let rootPath = '';
    let folder = cwd;
    while (folder !== '/') {
      if (!modulePath) {
        const findModuleResult = await glob(path.join(folder, '*.module.ts'));
        if (findModuleResult.length > 0) {
          modulePath = findModuleResult[0];
        }
      }
      if (existsSync(path.join(folder, 'nx.json'))) {
        rootPath = folder;
      }
      folder = path.resolve(folder, '../');
    }
    const moduleRelativePath = path.relative(cwd, modulePath);
    const cwdRelativePath = path.relative(rootPath, cwd);
    let args = [];
    if (['c', 'component'].includes(generator)) {
      args = [
        'nx',
        'g',
        `@nrwl/angular:${generator}`,
        `--path=${cwdRelativePath}`,
        `--module=${moduleRelativePath}`,
        `--changeDetection=OnPush`,
        '--style=scss',
        name,
      ];
    } else if (['p', 'pipe'].includes(generator)) {
      args = [
        'nx',
        'g',
        `@nrwl/angular:${generator}`,
        `--path=${cwdRelativePath}`,
        `--module=${moduleRelativePath}`,
        name,
      ];
    } else if (['s', 'service', 'g', 'guard'].includes(generator)) {
      args = [
        'nx',
        'g',
        `@nrwl/angular:${generator}`,
        `--path=${cwdRelativePath}`,
        name,
      ];
    }
    if (args.length) {
      await promiseSpawn('yarn', args);
    }
  }
}
