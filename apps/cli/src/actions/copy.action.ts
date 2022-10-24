import clipboardy from 'clipboardy';

import { getInfoFromArgv } from '../utils';

export async function copyAction() {
  const { clickUp } = await getInfoFromArgv(true);
  const string = await clickUp.getTaskString('todo');
  clipboardy.writeSync(string);
  console.log('Copied!');
}
