import axios from 'axios';
import log from './log';
import { Entry } from './types';

const FEEDBIN_API = 'https://api.feedbin.com/v2/';
const MAX_ENTRIES = 15;

const makeRequester = (username, password) => {
  return axios.create({
    baseURL: FEEDBIN_API,
    auth: {
      username,
      password,
    },
  });
};

export const validateCredentials = async ({ username, password }) => {
  const feedbin = makeRequester(username, password);
  const response = await feedbin.request({
    url: 'authentication',
    validateStatus: status => [200, 401].includes(status),
  });
  return response.status === 200;
};

export const getPagesEntries = async ({ username, password }): Promise<Entry[]> => {
  log('Fetching subscriptions...');
  const feedbin = makeRequester(username, password);
  const subscriptions = await feedbin.get('subscriptions.json');
  const pagesSub = subscriptions.data.find(sub =>
    sub.feed_url.includes('pages.feedbinusercontent.com'),
  );
  if (!pagesSub) {
    throw new Error('Pages feed not found!');
  }
  const pagesId = pagesSub.feed_id;
  log(`Pages Subscription ID is ${pagesId}`);
  log('Fetching entries...');
  const entries = await feedbin.get(
    `feeds/${pagesId}/entries.json?per_page=${MAX_ENTRIES}&mode=extended`,
  );
  log(`Fetched ${entries.data.length} pages entries`);
  return entries.data;
};
