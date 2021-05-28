import { Listener, TicketCreatedEvent, Subjects, DatabaseConnectionError  } from "@winston-test/common";
import { Message } from 'node-nats-streaming';
import { Ticket } from '../../models/ticket';
import { queueGroupName } from "./queue-group-name";
export class TicketCreatedListener extends Listener<TicketCreatedEvent> {
  subject: TicketCreatedEvent['subject'] = Subjects.TicketCreated;
  queueGroupName = queueGroupName;
  async onMessage(data: TicketCreatedEvent['data'], msg: Message) {
    const ticket = Ticket.build({
      id: data.id,
      title: data.title,
      price: data.price
    });
    try {
      // ticket.set({
      //   version: 0,
      // });
      await ticket.save();
      msg.ack();
    } catch (e) {
      throw new DatabaseConnectionError();
    }
  }
}
