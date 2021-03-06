import express from 'express';
import 'express-async-errors';
import { currentUserRouter } from './routes/current-user';
import { signInRouter } from './routes/signin';
import { signOutRouter } from './routes/signout';
import  { signUpRouter } from './routes/signup';
import { errorHandler, NotFoundError } from '@winston-test/common';
import cookieSession from 'cookie-session';

const app = express();
app.set('trust proxy', true); //traffic is being proxied to our app throug ingress-nginx, without this setting, express does not trust the HTTPS connection
app.use(express.json());
app.use(
  cookieSession({
    signed: false, //no encryption on cookie content
    secure: false,
  })
);

app.use(currentUserRouter);
app.use(signInRouter);
app.use(signOutRouter);
app.use(signUpRouter);

app.all('*', ()=> {
  throw new NotFoundError();
})
app.use(errorHandler);

export {app};