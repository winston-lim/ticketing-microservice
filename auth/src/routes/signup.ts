import express, { Request, Response } from 'express';
import { body, validationResult } from 'express-validator';
import jwt from 'jsonwebtoken';
import { validateRequest } from '../middleware/validate-request';
import { DatabaseConnectionError } from '../errors/database-validation-error';
import { RequestValidationError } from '../errors/request-validation-error';
import { BadRequestError } from '../errors/bad-request-error';
import {User} from '../models/user';
import { validateLocaleAndSetLanguage } from 'typescript';

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
validateRequest,
async (req: Request,res: Response)=>{
    const {email, password} = req.body;
    const existingUser = await User.findOne({email});
    if (existingUser) {
        throw new BadRequestError('Email in use');
    }
    const user = User.build({email, password});
    try {
        await user.save();
        const userJwt = user.generateAuthToken();
        req.session = {
            jwt: userJwt,
        }
        res.status(201).send(user);
    } catch(err) {
        throw new DatabaseConnectionError();
    }
})

export {router as signUpRouter};