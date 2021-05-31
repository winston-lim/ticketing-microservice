import mongoose from 'mongoose';
import {app} from './app';
import { OrderCancelledListener } from './events/listeners/order-cancelled-listener';
import { OrderCreatedListener } from './events/listeners/order-created-listener';
import stan from './stan';

const start = async ()=> {
  if (!process.env.JWT_KEY) {
    throw new Error('JWT_KEY must be defined')
  }
  if (!process.env.MONGO_URI) {
    throw new Error('MONGO_URI must be defined')
  }
  if (!process.env.NATS_URL) {
    throw new Error('JWT_KEY must be defined')
  }
  if (!process.env.NATS_CLIENT_ID) {
    throw new Error('MONGO_URI must be defined')
  }
  if (!process.env.NATS_CLUSTER_ID) {
    throw new Error('JWT_KEY must be defined')
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
    new OrderCancelledListener(stan.client).listen();

    await mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true,
    });
    console.log('Connected to mongodb');
  } catch(err) {
    console.error(err);
  }
  app.listen(3000, ()=> {
    console.log('Listening on 3000!');
  });
}

start();
