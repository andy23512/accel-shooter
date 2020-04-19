import { readFileSync, existsSync } from 'fs';
import { resolve as pathResolve } from 'path';
import { Config } from './models';

export function getConfigPath() {
  return pathResolve(__dirname, '../.config.json');
}

export function getConfig(): Config {
  const configPath = getConfigPath();
  return existsSync(configPath)
    ? JSON.parse(readFileSync(configPath, { encoding: 'utf-8' }))
    : {};
}

export const CONFIG = getConfig();
