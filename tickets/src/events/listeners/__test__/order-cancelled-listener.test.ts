import { OrderCancelledEvent, OrderStatus } from '@winston-test/common';
import { Types } from 'mongoose';
import { Message } from 'node-nats-streaming';
import stan from "../../../stan";
import { OrderCancelledListener } from '../order-cancelled-listener'; 
import { Ticket } from "../../../models/ticket";


const setup = async () => {
  const listener = new OrderCancelledListener(stan.client);

  const orderId = new Types.ObjectId().toHexString();
  const ticket = Ticket.build({
    userId: 'testUserId',
    title: 'test',
    price: 20,
  });
  ticket.set({
    orderId,
  })
  await ticket.save();

  const data: OrderCancelledEvent['data'] = {
    id : orderId,
    version: 0,
    ticket: {
        id: ticket.id,
    },
  }

  const msg: Partial<Message> = {
    ack: jest.fn(),
  }

  return { listener, orderId, ticket, data, msg };
}

it('removes the orderId of the ticket', async () => {
  const { listener, orderId, ticket, data, msg } = await setup();
  await listener.onMessage(data, msg as Message);
  const updatedTicket = await Ticket.findById(ticket.id);
  expect(updatedTicket!.orderId).toEqual(undefined);
});

it('acks the message', async () => {
  const { listener, orderId, ticket, data, msg } = await setup();
  await listener.onMessage(data, msg as Message);
  expect(msg.ack).toHaveBeenCalled();
});

it('publishes a ticket updated event', async () => {
  const { listener, orderId, ticket, data, msg } = await setup();
  await listener.onMessage(data, msg as Message);
  expect(stan.client.publish).toHaveBeenCalledTimes(1);
});