import {Request, Response, NextFunction} from 'express';

export const errorHandler = (
    err: Error,
    req: Request,
    res: Response,
    next: NextFunction,
) => {
    console.log('ERROR', err);
    res.status(500).send({
        message: 'Something went wrong',
    })
}