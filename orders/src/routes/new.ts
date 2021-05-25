import express, { Request, Response } from 'express';
import { requireAuth, validateRequest } from '@winston-test/common';
import { body } from 'express-validator';

const router = express.Router();

router.post('/api/orders',
requireAuth,
[
  body('ticketId')
  .not()
  .isEmpty()
  .isMongoId()
  .withMessage('A valid ticketId must be provided')
],
(req: Request, res: Response)=>{
  res.send({});
});

export {router as newOrderRouter}