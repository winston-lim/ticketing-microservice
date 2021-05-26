import { DatabaseConnectionError, NotAuthorizedError, NotFoundError, OrderStatus, requireAuth, validateRequest } from '@winston-test/common';
import express, { Request, Response } from 'express';
import stan from '../stan';
import { param } from 'express-validator';
import { Order } from '../models/order';
import { OrderCancelledPublisher } from '../events/publishers/order-cancelled-publisher';
const router = express.Router();
router.patch( 
  '/api/orders/:orderId', 
  requireAuth,
  param('orderId')
    .isMongoId()
    .withMessage('Invalid order id'),
  validateRequest,
  async (req: Request, res: Response)=>{
    const order = await Order.findById(req.params.orderId).populate('ticket');
    if (!order) throw new NotFoundError();
    if (order.userId!==req.currentUser!.id) throw new NotAuthorizedError();
    try {
      await order.set({
        status: OrderStatus.Cancelled,
      });
      await order.save();
      await new OrderCancelledPublisher(stan.client).publish({
        id: order.id,
        ticket: {
          id: order.ticket.id
        }
      })
      res.send(order);
    } catch (e) {
      throw new DatabaseConnectionError();
    }
  }
);

export {router as updateOrderRouter}