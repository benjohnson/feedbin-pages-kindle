require('dotenv').config();

import path from 'path';
import ejs from 'ejs';
import { readdir, readFile, ensureDir, writeFile } from 'fs-extra';
import uuid from 'uuid/v4';
import { getPagesEntries } from './feedbin';
import log from './log';
import generateEntry from './worker/generateEntry';
import kindlegen from './worker/kindlegen';

// import Bull from 'bull';
// const queue = new Bull('main');
// queue.process(async job => {
// });

const shortDate = () => {
  const today = new Date();
  return `${today.getFullYear()}-${today.getMonth()}-${today.getDate()}`;
};

const job = async ({ username, password, kindle }) => {
  try {
    const folderPath = `tmp/${Date.now()}-${uuid().slice(0, 6)}`;
    log(`Creating directory ${folderPath}`);
    await ensureDir(folderPath);

    // Get entries and write a JSON file for debugging purposes.
    let entries = await getPagesEntries({ username, password });
    // We don't care about entries that have no content...
    entries = entries.filter(entry => entry.content);
    await writeFile(
      `${folderPath}/entries.json`,
      JSON.stringify(entries, null, 2),
    );

    // Generate HTML files for the entries.
    for (let entry of entries) {
      await generateEntry(folderPath, entry);
    }

    // Get templates.
    let templateList = await readdir(path.join(__dirname, 'templates'));
    templateList = templateList.filter(template => template !== 'entry.html');

    // Process templates for TOCs etc.
    await Promise.all(
      templateList.map(async template => {
        log(`Generating template: ${template}`);
        const templateContents = await readFile(
          path.join(__dirname, 'templates', template),
          'utf-8',
        );
        await writeFile(
          path.join(folderPath, template),
          ejs.render(templateContents, { entries, shortDate: shortDate() }),
        );
      }),
    );

    // Generate the mobi file.
    await kindlegen(folderPath);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

job({
  username: process.env.FEEDBIN_USERNAME,
  password: process.env.FEEDBIN_PASSWORD,
  kindle: process.env.KINDLE_EMAIL,
});
