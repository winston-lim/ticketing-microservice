import { Types } from "mongoose";
import { Order, OrderStatus } from "../../../models/order";
import { ExpirationCompleteEvent } from '@winston-test/common';
import { Ticket } from "../../../models/ticket";
import stan from "../../../stan";
import { ExpirationCompleteListener } from "../expiration-complete-listener";
import { Message } from "node-nats-streaming";

const setup = async () => {
  const listener = new ExpirationCompleteListener(stan.client);

  const ticket = Ticket.build({
    id: Types.ObjectId().toHexString(),
    title: 'Test',
    price: 20
  });
  await ticket.save();
  const order = Order.build({
    userId: Types.ObjectId().toHexString(),
    status: OrderStatus.Created,
    expiresAt: new Date(),
    ticket,
  });
  await order.save();
  
  const data: ExpirationCompleteEvent['data'] = {
    orderId: order.id
  }

  const msg: Partial<Message> = {
    ack: jest.fn(),
  }

  return { listener, order, ticket, data, msg }
}

it('updates the order status to cancelled', async () => {
  const { listener, order, ticket, data, msg } = await setup();
  await listener.onMessage(data, msg as Message);
  const updatedOrder = await Order.findById(data.orderId);
  expect(updatedOrder!.status).toEqual(OrderStatus.Cancelled);
});

it('emits a OrderCancelled event', async () => {
  const { listener, order, ticket, data, msg } = await setup();
  await listener.onMessage(data, msg as Message);
  expect(stan.client.publish).toHaveBeenCalled();
  const eventData = JSON.parse((stan.client.publish as jest.Mock).mock.calls[0][1]);
  expect(eventData.id).toEqual(order.id);
});

it('ack the message', async () => {
  const { listener, order, ticket, data, msg } = await setup();
  await listener.onMessage(data, msg as Message);
  expect(msg.ack).toHaveBeenCalled();
});