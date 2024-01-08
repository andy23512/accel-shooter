import { existsSync, readFileSync } from 'fs';
import { glob } from 'glob';
import path from 'path';
import { Action } from '../classes/action.class';
import { promiseSpawn } from '../utils';

export class GenAction extends Action {
  public command = 'gen';
  public description = 'shorthand for nx angular generate command';
  public alias = 'g';
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
    const packageJsonPath = path.join(rootPath, 'package.json');
    const packageJsonObject = JSON.parse(
      readFileSync(packageJsonPath, {
        encoding: 'utf-8',
      })
    );
    let packageName: string = null;
    if (packageJsonObject.devDependencies['@nrwl/angular']) {
      packageName = '@nrwl/angular';
    } else if (packageJsonObject.devDependencies['@nx/angular']) {
      packageName = '@nx/angular';
    } else {
      throw Error(
        'Both @nrwl/angular and @nx/angular are not exist in project.'
      );
    }
    let args = [];
    if (['c', 'component'].includes(generator)) {
      args = [
        'nx',
        'g',
        `${packageName}:${generator}`,
        `--path=${cwdRelativePath}`,
        `--module=${moduleRelativePath}`,
        `--changeDetection=OnPush`,
        '--style=scss',
        name,
      ];
    } else if (['d', 'directive', 'p', 'pipe'].includes(generator)) {
      args = [
        'nx',
        'g',
        `${packageName}:${generator}`,
        `--path=${cwdRelativePath}`,
        `--module=${moduleRelativePath}`,
        name,
      ];
    } else if (
      ['s', 'service', 'g', 'guard', 'm', 'module'].includes(generator)
    ) {
      args = [
        'nx',
        'g',
        `${packageName}:${generator}`,
        `--path=${cwdRelativePath}`,
        name,
      ];
    }
    if (args.length) {
      await promiseSpawn('yarn', args);
    }
  }
}
