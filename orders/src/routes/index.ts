import { DatabaseConnectionError, requireAuth } from '@winston-test/common';
import express, { Request, Response } from 'express';
import { Order } from '../models/order';

const router = express.Router();

router.get('/api/orders', 
  requireAuth,
  async (req: Request, res: Response)=>{
    try {
      const orders = await Order.find({userId: req.currentUser!.id}).populate('ticket');
      res.send(orders);
    } catch (e) {
      throw new DatabaseConnectionError();
    }
  }
);

export {router as indexOrderRouter}