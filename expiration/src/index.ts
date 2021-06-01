import stan from './stan';

const start = async ()=> {
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
  } catch(err) {
    console.error(err);
  }
}

start();
