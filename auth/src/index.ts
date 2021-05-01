import express from 'express';
import {currentUserRouter} from './routes/current-user';
import {signInRouter} from './routes/signin';
import {signOutRouter} from './routes/signout';
import  {signUpRouter} from './routes/signup';
import {errorHandler} from './middleware/error-handler';
const app = express();
app.use(express.json());

app.get('/api/users/currentuser', (req,res)=>{
  res.send('Info about user')
})

app.use(currentUserRouter);
app.use(signInRouter);
app.use(signOutRouter);
app.use(signUpRouter);
app.use(errorHandler);

app.listen(3000, ()=> {
  console.log('Listening on 3000');
});