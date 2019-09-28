// Given an Entry, generates and writes a formatted HTML file to disk.

const fs = require('fs');
const path = require('path');
const cheerio = require('cheerio');
const sanitizeHtml = require('sanitize-html');
const { log } = console;
const axios = require('axios');
const uuid = require('uuid/v4');

const MOBI_SUPPORTED_TAGS = [
    'a', 'address', 'article', 'aside', 'b', 'blockquote', 'body', 'br',
    'caption', 'center', 'cite', 'code', 'col', 'dd',
    'del', 'dfn', 'div', 'dl', 'dt', 'em', 'figcaption',
    'figure', 'footer', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
    'head', 'header', 'hgroup', 'hr', 'html', 'i', 'img', 'ins',
    'kbd', 'li', 'link', 'mark', 'map', 'menu', 'ol',
    'output', 'p', 'pre', 'q', 'rp', 'rt', 'samp', 'section',
    'small', 'source', 'span', 'strong', 'style', 'strike', 'sub',
    'sup', 'table', 'tbody', 'td', 'tfoot', 'th', 'thead', 'time',
    'title', 'tr', 'u', 'ul', 'var', 'wbr', 'nav', 'summary', 'details',
    'meta'
];

async function main() {
const entries = JSON.parse(fs.readFileSync('entries.json', 'utf-8'));
const entry = entries[0];

  const header = '<html><head><meta content="text/html; charset=utf-8" http-equiv="Content-Type"/></head><body>';
  const footer = '</body></html>';

  const body = entry.content;

  const file = header + body + footer;

  const $ = cheerio.load(sanitizeHtml(file, {
    allowedTags: MOBI_SUPPORTED_TAGS,
    allowedAttributes: {
      meta: [ 'charset', 'content', 'http-equiv'],
      a   : [ 'href', 'name', 'target' ],
      img : [ 'src', 'srcset' ],
      '*' :  [ 'style', 'class' ]
    },
    exclusiveFilter: function(frame) {
        // Strip out empty <a> tags.
        return frame.tag === 'a' && !frame.text.trim();
    }
  }));

  const images = new Map();

  $('img').each((idx, img) => {
    const $img = $(img);
    const imgSrc = $img.attr('src');
    const imgExt = path.extname(imgSrc);
    const uid = `images/${uuid()}.${imgExt}`;
    images.set(imgSrc, uid);
    $img.attr('src', uid);
  });

  log('Writing html file');
  fs.writeFileSync('booktest/0-00000.html', $.html());

  log('Fetching images...');
  const imagesToFetch = images.keys();
  for (image of imagesToFetch) {
    log(`Fetching: ${image}`);
    const imgData = await axios.get(image, { responseType: 'arraybuffer' });
    fs.writeFileSync(`booktest/${images.get(image)}`, imgData.data);
  }
}

main();
