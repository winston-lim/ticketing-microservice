import { OrderCreatedEvent, OrderStatus } from "@winston-test/common";
import { Types } from "mongoose";
import { Message } from "node-nats-streaming";
import { Order } from "../../../models/order";
import stan from "../../../stan";
import { OrderCreatedListener } from "../order-created-listener";

const setup = async () => {
  const listener = new OrderCreatedListener(stan.client);

  const data: OrderCreatedEvent['data'] = {
    id: new Types.ObjectId().toHexString(),
    version: 0,
    status: OrderStatus.Created,
    userId: new Types.ObjectId().toHexString(),
    expiresAt: new Date().toISOString(),
    ticket: {
      id: 'testid',
      price: 20
    }
  }

  const msg: Partial<Message> = {
    ack: jest.fn()
  }

  return { listener, data, msg }
}

it('creates an order with correct data', async () => {
  const { listener, data, msg } = await setup();
  await listener.onMessage(data, msg as Message);
  const order = await Order.findById(data.id);
  expect(order!.id).toEqual(data.id);
  expect(order!.userId).toEqual(data.userId);
  expect(order!.status).toEqual(data.status);
  expect(order!.price).toEqual(data.ticket.price);
  expect(order!.version).toEqual(data.version);
});

it('acks the message', async () => {
  const { listener, data, msg } = await setup();
  await listener.onMessage(data, msg as Message);
  expect(msg.ack).toHaveBeenCalled();
});
