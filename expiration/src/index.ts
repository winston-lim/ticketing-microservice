import stan from './stan';
import { OrderCreatedListener } from './events/listeners/order-created-listener';

const start = async ()=> {
  if (!process.env.NATS_URL) {
    throw new Error('NATS_URL must be defined')
  }
  if (!process.env.NATS_CLIENT_ID) {
    throw new Error('NATS_CLIENT_ID must be defined')
  }
  if (!process.env.NATS_CLUSTER_ID) {
    throw new Error('NATS_CLUSTER_ID must be defined')
  }
  try {
    await stan.connect(process.env.NATS_CLUSTER_ID, process.env.NATS_CLIENT_ID, process.env.NATS_URL);
    stan.client.on('close', ()=>{
      console.log('NATS connection closed');
      process.exit();
    });
    process.on('SIGINT', ()=>stan.client.close());
    process.on('SIGTERM', ()=>stan.client.close());

    new OrderCreatedListener(stan.client).listen();
  } catch(err) {
    console.error(err);
  }
}

start();
