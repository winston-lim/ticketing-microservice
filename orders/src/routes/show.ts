import { NotAuthorizedError, NotFoundError, requireAuth, validateRequest } from '@winston-test/common';
import express, { Request, Response } from 'express';
import { param } from 'express-validator';
import { Order } from '../models/order';

const router = express.Router();

router.get(
  '/api/orders/:orderId', 
  requireAuth,
  param('orderId')
    .isMongoId()
    .withMessage('Invalid order id'),
  validateRequest,
  async (req: Request, res: Response)=>{
    const order = await Order.findById(req.params.orderId);
    if (!order) throw new NotFoundError();
    if (order.userId!==req.currentUser!.id) throw new NotAuthorizedError();
    res.send(order);
  }
);

export {router as showOrderRouter}