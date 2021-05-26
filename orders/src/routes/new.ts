import express, { Request, Response } from 'express';
import { BadRequestError, DatabaseConnectionError, NotFoundError, OrderStatus, requireAuth, validateRequest } from '@winston-test/common';
import { body } from 'express-validator';
import { Ticket } from '../models/ticket';
import { Order } from '../models/order';
   
const router = express.Router();

const EXPIRATION_WINDOW_SECONDS = 15*60;

router.post('/api/orders',
requireAuth,
[
  body('ticketId')
  .not()
  .isEmpty()
  .isMongoId()
  .withMessage('A valid ticketId must be provided')
],
async (req: Request, res: Response)=>{
  // Find the ticket the user is trying to order in the database
  const { ticketId } = req.body;
  const ticket = await Ticket.findById(ticketId);
  if (!ticket) {
    throw new NotFoundError();
  }
  // Attempt to reserve it and set an expiration timer to it
  const isReserved = await ticket.isReserved();
  if (isReserved  ) {
    throw new BadRequestError('Ticket is already reserved');
  }

  const expiration = new Date();
  expiration.setSeconds(expiration.getSeconds() + EXPIRATION_WINDOW_SECONDS);

  // Build and save the Order
  const order = Order.build({
    userId: req.currentUser!.id,
    status: OrderStatus.Created,
    expiresAt: expiration,
    ticket: ticket
  })
  try {
    await order.save();
    res.status(201).send(order);
  } catch (e) {
    throw new DatabaseConnectionError();
  }
  // Publish events
});

export {router as newOrderRouter}