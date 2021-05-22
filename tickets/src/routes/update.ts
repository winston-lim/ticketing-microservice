import express, { Request, Response } from 'express';
import { requireAuth, validateRequest, DatabaseConnectionError, NotFoundError, NotAuthorizedError } from '@winston-test/common';
import { body } from 'express-validator';
import { Ticket } from '../models/ticket';

const router = express.Router();

router.put('/api/tickets/:id', 
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
    const ticket = await Ticket.findById(req.params.id);
    if (!ticket) throw new NotFoundError();
    if (ticket.userId !== req.currentUser!.id) throw new NotAuthorizedError();
    try {
      ticket.set({
        title,
        price,
      });
      await ticket.save();
      res.status(201).send(ticket);
    } catch (e) {
      throw new DatabaseConnectionError();
    }
  }
);

export { router as updateTicketRouter};