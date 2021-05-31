import { OrderCreatedEvent, OrderStatus } from '@winston-test/common';
import { Types } from 'mongoose';
import { Message } from 'node-nats-streaming';
import stan from "../../../stan";
import { OrderCreatedListener } from "../../listeners/order-created-listener";
import { Ticket } from "../../../models/ticket";


const setup = async () => {
  const listener = new OrderCreatedListener(stan.client);

  const ticket = Ticket.build({
    userId: 'testUserId',
    title: 'test',
    price: 20,
  });
  await ticket.save();

  const data: OrderCreatedEvent['data'] = {
    id : new Types.ObjectId().toHexString(),
    version: 0,
    status: OrderStatus.Created,
    userId: ticket.userId,
    expiresAt: new Date().toISOString(),
    ticket: {
        id: ticket.id,
        price: ticket.price,
    },
  }

  const msg: Partial<Message> = {
    ack: jest.fn(),
  }

  return { listener, ticket, data, msg };
}

it('sets the orderId of the ticket', async () => {
  const { listener, ticket, data, msg } = await setup();
  await listener.onMessage(data, msg as Message);
  const updatedTicket = await Ticket.findById(ticket.id);
  expect(updatedTicket!.orderId).toEqual(data.id);
});

it('acks the message', async () => {
  const { listener, ticket, data, msg } = await setup();
  await listener.onMessage(data, msg as Message);
  expect(msg.ack).toHaveBeenCalled();
});

it('publishes a ticket updated event', async () => {
  const { listener, ticket, data, msg } = await setup();
  await listener.onMessage(data, msg as Message);
  expect(stan.client.publish).toHaveBeenCalledTimes(1);

  const ticketUpdatedData = JSON.parse((stan.client.publish as jest.Mock).mock.calls[0][1]);
  expect(data.id).toEqual(ticketUpdatedData.orderId);
});