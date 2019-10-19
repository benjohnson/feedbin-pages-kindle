import Bull from 'bull';

const queue = new Bull('main');

export default queue;
