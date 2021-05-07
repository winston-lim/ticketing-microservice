import {Request, Response, NextFunction} from 'express';
import { validationResult } from 'express-validator';
import { RequestValidationError } from '../errors/request-validation-error';
export const validateRequest = (
    err: Error,
    req: Request,
    res: Response,
    next: NextFunction,
) => {
    const error = validationResult(req);
    if (!error.isEmpty()) throw new RequestValidationError(error.array());
    console.log('No validation errors');
    next();
}