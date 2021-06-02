import Queue from 'bull';
import { ExpirationCompletePublisher } from '../events/publishers/expiration-complete-publisher';
import stan from '../stan';

interface Payload {
  orderId: string;
}

export const expirationQueue = new Queue<Payload>('order:expiration', {
  redis: {
    host: process.env.REDIS_HOST
  }
});
//is called a bucket, in concept its similar to a subscription channel

expirationQueue.process(async (job) => {
  await new ExpirationCompletePublisher(stan.client).publish({
    orderId: job.data.orderId
  });
});
//job is similar to a message, it is an abstraction that comes with certain behaviors(Message comes with their own set such as msg.ack())





