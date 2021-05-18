import express, { Request, Response } from 'express';
import { requireAuth, validateRequest, DatabaseConnectionError } from '@winston-test/common';
import { body } from 'express-validator';
import { Ticket, baseTicket } from '../models/ticket';
const router = express.Router();

router.post('/api/tickets', 
  requireAuth,
  [
  body('title')
    .not()
    .isEmpty()
    .withMessage('A valid title is required'),
  body('price')
    .isFloat({ gt: 0 })
    .withMessage('Price must be greater than 0')
  ], 
  validateRequest, 
  async (req: Request, res: Response) => {
    const { title, price } = req.body;
    const ticket = Ticket.build({
      title,
      price,
      userId: req.currentUser!.id,
    })
    try {
      await ticket.save();
      res.status(201).send(ticket);
    } catch (e) {
      throw new DatabaseConnectionError();
    }
  }
);

export { router as createTicketRouter};