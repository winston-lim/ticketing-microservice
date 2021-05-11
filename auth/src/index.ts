import mongoose from 'mongoose';
import {app} from './app';
const start = async ()=> {
  if (!process.env.JWT_KEY) {
    throw new Error('JWT_KEY must be defined')
  }
  try {
    await mongoose.connect('mongodb://auth-mongo-srv:27017', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true,
  })
  console.log('Connected to mongodb')
  } catch(err) {
    console.error(err);
  }
  app.listen(8080, ()=> {
    console.log('Listening on 8080!');
  });
}

start();
