import Bull from 'bull';

const queue = new Bull('main', process.env.REDIS_URL);

export default queue;
