import Bull from 'bull';
const queue = new Bull('main');

queue.process(async job => {
});
