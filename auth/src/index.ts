import express from 'express';
import 'express-async-errors';
import mongoose from 'mongoose';
import { currentUserRouter } from './routes/current-user';
import { signInRouter } from './routes/signin';
import { signOutRouter } from './routes/signout';
import  { signUpRouter } from './routes/signup';
import { errorHandler } from './middleware/error-handler';
import { NotFoundError } from './errors/not-found-error';
const app = express();
app.use(express.json());

app.get('/api/users/currentuser', (req,res)=>{
  res.send('Info about user')
})

app.use(currentUserRouter);
app.use(signInRouter);
app.use(signOutRouter);
app.use(signUpRouter);

app.all('/*', async ()=> {
  throw new NotFoundError();
})
app.use(errorHandler);

const start = async ()=> {
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
