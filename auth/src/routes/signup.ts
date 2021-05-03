import express, { Request, Response } from 'express';
import { body, validationResult } from 'express-validator';
import { DatabaseConnectionError } from '../errors/database-validation-error';
import { RequestValidationError } from '../errors/request-validation-error';

const router = express.Router();

router.post('/api/users/signup', [
    body('email')
        .isEmail()
        .withMessage('Invalid Email'),
    body('password')
        .trim()
        .isLength({min:4, max: 20})
        .withMessage('Password must be between 4 and 20 characters')
],
(req: Request,res: Response)=>{
    const errors = validationResult(req);
    if (!errors.isEmpty()) throw new RequestValidationError(errors.array());
    console.log('Creating a user...')
    throw new DatabaseConnectionError();
    res.send('Signed up!')
})

export {router as signUpRouter};