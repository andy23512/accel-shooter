import * as fs from 'fs';
import { resolve as pathResolve } from 'path';
(async () => {
  const action = process.argv[2];
  switch (action) {
    case 'config':
      const configFile = process.argv[3];
      setConfigFile(configFile);
      break;
    case 'start':
    default:
      throw Error(`Action {action} is not supported`);
  }
})();

function setConfigFile(configFile: string) {
  const src = pathResolve(configFile);
  const dest = pathResolve(__dirname, '../.config.json');
  fs.copyFileSync(src, dest);
}
