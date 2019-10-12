// Given an Entry, generates and writes a formatted HTML file to disk.
import fs from 'fs';
import path from 'path';
import { URL } from 'url';
import cheerio from 'cheerio';
import sanitizeHtml from 'sanitize-html'
import ejs from 'ejs';
import axios from 'axios';
import uuid from 'uuid/v4';
import * as types from './types';
import log from './log';

const MOBI_SUPPORTED_TAGS = [
    'a', 'address', 'article', 'aside', 'b', 'blockquote', 'body', 'br',
    'caption', 'center', 'cite', 'code', 'col', 'dd',
    'del', 'dfn', 'div', 'dl', 'dt', 'em', 'figcaption',
    'figure', 'footer', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
    'head', 'header', 'hgroup', 'hr', 'html', 'i', 'img', 'ins',
    'kbd', 'li', 'link', 'mark', 'map', 'menu', 'ol',
    'output', 'p', 'pre', 'q', 'rp', 'rt', 'samp', 'section',
    'small', 'span', 'strong', 'style', 'strike', 'sub',
    'sup', 'table', 'tbody', 'td', 'tfoot', 'th', 'thead', 'time',
    'title', 'tr', 'u', 'ul', 'var', 'wbr', 'nav', 'summary', 'details',
    'meta'
];
// Removed source

export default async function generateEntry(entry: types.Entry) {
  const file = ejs.render(fs.readFileSync(__dirname + '/../templates/entry.html', 'utf-8'), { entry });

  const $ = cheerio.load(sanitizeHtml(file, {
    allowedTags: MOBI_SUPPORTED_TAGS,
    allowedAttributes: {
      meta: [ 'charset', 'content', 'http-equiv'],
      a   : [ 'href', 'name', 'target' ],
      img : [ 'src', 'srcset' ],
      '*' :  [ 'style' ] // Removed class
    },
    exclusiveFilter: function(frame) {
        // Strip out empty <a> tags.
        return frame.tag === 'a' && !frame.text.trim();
    }
  }));

  // Remove img references without a src.
  $('img:not([src])').remove();

  // Rewrite image paths to local paths.
  for (let img of $('img').toArray()) {
    const $img = $(img);
    let imgSrc = $img.attr('src');
    if (imgSrc) {
      const url = new URL(imgSrc);
      const imgExt = path.extname(url.origin + url.pathname);
      const uid = `images/${uuid()}${imgExt}`;
      try {
        log(`Fetching ${imgSrc}`);
        const imgData = await axios.get(imgSrc, { responseType: 'arraybuffer' });
        fs.writeFileSync(`${__dirname}/../book/${uid}`, imgData.data);
        $img.attr('src', uid);
      } catch (err) {
        console.error(`Error: Failed to fetch: ${imgSrc}`);
      }
    }
  }

  // Write the html template for the entry.
  const filePath = `${__dirname}/../book/0-${entry.id}.html`;
  log(`Writing html file: ${filePath}`);
  fs.writeFileSync(filePath, $.html());
}
