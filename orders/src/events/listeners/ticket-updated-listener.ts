import { Listener, TicketUpdatedEvent, Subjects, DatabaseConnectionError, NotFoundError  } from "@winston-test/common";
import { Message } from 'node-nats-streaming';
import { Ticket } from '../../models/ticket';
import { queueGroupName } from "./queue-group-name";

export class TicketUpdateListener extends Listener<TicketUpdatedEvent>{
  subject: TicketUpdatedEvent['subject'] = Subjects.TicketUpdated;
  queueGroupName = queueGroupName;
  async onMessage({ id, price, title, userId }: TicketUpdatedEvent['data'], msg: Message) {
     const ticket = await Ticket.findById(id);
    if (!ticket) throw new Error('Ticket not found');
    try {
      await ticket.set({
        price,
        title,
      });
      await ticket.save();
      msg.ack();
    } catch (e) {
      throw new DatabaseConnectionError();
    }
  }
}