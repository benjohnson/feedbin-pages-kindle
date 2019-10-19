import path from 'path';
import { spawn } from 'child_process';
import { ensureFile } from 'fs-extra';
import log from '../log';

export default folderPath => {
  return new Promise((resolve, reject) => {
    const kindlegen = spawn('kindlegen', [
      '-c2',
      'contents.opf',
      '-o',
      'feedbin.mobi',
    ], { cwd: folderPath });

    kindlegen.stdout.on('data', data => log(data.toString()));
    kindlegen.stderr.on('data', reject);
    kindlegen.on('close', code => {
      ensureFile(path.join(folderPath, 'feedbin.mobi'))
        .then(resolve)
        .catch(reject);
    });
  });
};
