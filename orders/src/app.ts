import express from 'express';
import 'express-async-errors';
import { errorHandler, NotFoundError, currentUser } from '@winston-test/common';
import cookieSession from 'cookie-session';
import { updateOrderRouter } from './routes/update';
import { indexOrderRouter } from './routes';
import { newOrderRouter } from './routes/new';
import { showOrderRouter } from './routes/show';


const app = express();
app.set('trust proxy', true); //traffic is being proxied to our app throug ingress-nginx, without this setting, express does not trust the HTTPS connection
app.use(express.json());
app.use(
  cookieSession({
    signed: false, //no encryption on cookie content
    secure: process.env.NODE_ENV!=='test',  //require a HTTPS connection for this route
  })
);
app.use(currentUser);

app.use(indexOrderRouter);
app.use(newOrderRouter);
app.use(showOrderRouter);
app.use(updateOrderRouter);

app.all('*', ()=> {
  throw new NotFoundError();
})
app.use(errorHandler);

export {app};