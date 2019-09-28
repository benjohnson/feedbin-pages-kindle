require("dotenv").config();
const periodical = require("kindle-periodical");
const axios = require("axios");
const fs = require('fs');
const { log } = console;

const FEEDBIN_API = "https://api.feedbin.com/v2/";

const feedbin = axios.create({
  baseURL: FEEDBIN_API,
  auth: {
    username: process.env.FEEDBIN_USERNAME,
    password: process.env.FEEDBIN_PASSWORD
  }
});

async function getPagesEntries() {
  log("Fetching subscriptions...");
  const subscriptions = await feedbin.get("subscriptions.json");
  const pagesSub = subscriptions.data.find(sub =>
    sub.feed_url.includes("pages.feedbinusercontent.com")
  );
  if (!pagesSub) {
    throw new Error("Pages feed not found!");
  }
  const pagesId = pagesSub.feed_id;
  log(`Pages Subscription ID is ${pagesId}`);
  log("Fetching entries");
  const entries = await feedbin.get(`feeds/${pagesId}/entries.json?per_page=10&mode=extended`);
  log(`Fetched ${entries.data.length} pages entries`);
  return entries.data;
}

function formatBookData(entries) {
  return {
    title: "Feedbin Pages",
    creator: "Feedbin",
    publisher: "Feedbin",
    // subject: "subject",
    // language: "language (en-Gb, de-De)",
    // cover: "path-to-cover",
    // description: "description",
    sections: [
      {
        title: "Pages",
        articles: entries.map(entry => ({
          title: entry.title,
          author: entry.author,
          content: entry.content
        }))
      }
    ]
  };
}

async function main() {
  try {
    // const entries = await getPagesEntries();
    // if (!entries.length) {
    //   log("No Pages Entries found. Quitting.");
    //   process.exit(0);
    // }

    // fs.writeFileSync('entries.json', JSON.stringify(entries, null, 2));

    // log("Formatting book data...");
    // const bookData = formatBookData(entries);

    // log('Creating book...');
    // periodical.create(bookData);


    const entries = JSON.parse(fs.readFileSync('entries.json', 'utf-8'));

  } catch (err) {
    console.error(err);
  }
}

main();

