import express, { Request, Response } from 'express';
import { body } from 'express-validator';
import jwt from 'jsonwebtoken';
import { BadRequestError } from '../errors/bad-request-error';
import { validateRequest } from '../middleware/validate-request';
import { User } from '../models/user';
import { Password } from '../services/password';

const router = express.Router();

router.post('/api/users/signin', [
  body('email')
    .isEmail()
    .withMessage('Enter a valid email'),
  body('password')
    .trim()
    .notEmpty()
    .withMessage('Enter a password')
],
validateRequest,
async (req: Request, res: Response) => {
  const { email, password } = req.body;
  const user = await User.login(email, password);
  const userJwt = user.generateAuthToken();
  req.session = {
    jwt: userJwt,
  }
  res.send(user);
});

export { router as signInRouter };
