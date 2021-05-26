import { DatabaseConnectionError, NotAuthorizedError, NotFoundError, OrderStatus, requireAuth, validateRequest } from '@winston-test/common';
import express, { Request, Response } from 'express';
import { param } from 'express-validator';
import { Order } from '../models/order';

const router = express.Router();
router.patch( 
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
    try {
      await order.set({
        status: OrderStatus.Cancelled,
      });
      await order.save();
      res.send(order);
    } catch (e) {
      throw new DatabaseConnectionError();
    }
  }
);

export {router as updateOrderRouter}