import fs from 'fs';
import ejs from 'ejs';
import log from './log';
import generateEntry from './generateEntry';
import * as types from './types';

async function main() {
  try {

    const entries: types.Entry[] = JSON.parse(fs.readFileSync('entries.json', 'utf-8'));

    for (let entry of entries) {
      await generateEntry(entry);
    }

    const templates = fs.readdirSync('templates').filter(x => x !== 'entry.html');
    for (let template of templates) {
      log(`Generating template: ${template}`);
      const templateContents = fs.readFileSync(`templates/${template}`, 'utf-8');
      fs.writeFileSync(`book/${template}`, ejs.render(templateContents, { entries }));
    }

  } catch (err) {
    console.error(err);
  }
}

main();
