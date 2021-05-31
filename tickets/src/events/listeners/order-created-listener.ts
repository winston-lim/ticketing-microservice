import { Listener, OrderCreatedEvent, Subjects } from "@winston-test/common";
import { Message } from 'node-nats-streaming';
import { Ticket } from "../../models/ticket";
import { TicketUpdatedPublisher } from "../publishers/ticket-updated-publisher";
import { queueGroupName } from "./queue-group-name";


export class OrderCreatedListener extends Listener<OrderCreatedEvent> {
  subject: OrderCreatedEvent['subject'] = Subjects.OrderCreated;
  queueGroupName = queueGroupName;
  async onMessage(data: OrderCreatedEvent['data'], msg: Message) {
    const { id, ticket: { id: ticketId } } = data;
    const ticket = await Ticket.findById(ticketId);
    if (!ticket) {
      throw new Error('Ticket not found');
    }
    if (ticket.orderId) {
      throw new Error('Ticket is reserved');
    }
    ticket.set({
      orderId: id,
    });
    try {
      await ticket.save();
      
      await new TicketUpdatedPublisher(this.client).publish({
        id: ticket.id,
        title: ticket.title,
        price: ticket.price,
        version: ticket.version,
        userId: ticket.userId,
        orderId: ticket.orderId,
      });
      

      msg.ack();
    } catch (e) {
      console.log(e);
      throw e;
    }
  }
}