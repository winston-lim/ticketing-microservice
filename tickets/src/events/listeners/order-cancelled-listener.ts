import { Listener, OrderCancelledEvent, Subjects } from "@winston-test/common";
import { Message } from 'node-nats-streaming';
import { Ticket } from "../../models/ticket";
import { TicketUpdatedPublisher } from "../publishers/ticket-updated-publisher";
import { queueGroupName } from "./queue-group-name";


export class OrderCancelledListener extends Listener<OrderCancelledEvent> {
  subject: OrderCancelledEvent['subject'] = Subjects.OrderCancelled;
  queueGroupName = queueGroupName;
  async onMessage(data: OrderCancelledEvent['data'], msg: Message) {
    const { id, ticket: { id: ticketId }} = data;
    const ticket = await Ticket.findById(ticketId);
    if (!ticket) throw new Error('Ticket not found');
    if (!ticket.orderId) throw new Error('Ticket not reserved');
    ticket.set({
      orderId: undefined,
    });
    try {
      await ticket.save();

      await new TicketUpdatedPublisher(this.client).publish({
        id: ticket.id,
        version: ticket.version,
        title: ticket.title,
        price: ticket.price,
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