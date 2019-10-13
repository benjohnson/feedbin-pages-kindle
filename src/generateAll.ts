import fs from 'fs';
import ejs from 'ejs';
import del from 'del';
import log from './log';
import generateEntry from './generateEntry';
import * as types from './types';

async function main() {
  try {
    log('Removing book directory...');
    await del(['book/**']);

    const entries: types.Entry[] = JSON.parse(fs.readFileSync('entries.json', 'utf-8'));

    for (let entry of entries) {
      log(`Generating entry: "${entry.title}"`);
      await generateEntry(entry);
    }

    const templates = fs.readdirSync('templates').filter(x => x !== 'entry.html');
    for (let template of templates) {
      log(`Generating template: ${template}`);
      const today = new Date();
      const shortDate = `${today.getFullYear()}-${today.getMonth()}-${today.getDate()}`;
      const templateContents = fs.readFileSync(`templates/${template}`, 'utf-8');
      fs.writeFileSync(`book/${template}`, ejs.render(templateContents, { entries, shortDate }));
    }

  } catch (err) {
    console.error(err);
  }
}

main();
