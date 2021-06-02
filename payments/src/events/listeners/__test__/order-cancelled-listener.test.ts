import { OrderCancelledEvent, OrderStatus } from "@winston-test/common";
import { Types } from "mongoose";
import { Message } from "node-nats-streaming";
import { Order } from "../../../models/order";
import stan from "../../../stan";
import { OrderCancelledListener } from "../order-cancelled-listener";

const setup = async () => {
  const listener = new OrderCancelledListener(stan.client);

  const order = Order.build({
    id: new Types.ObjectId().toHexString(),
    status: OrderStatus.Created,
    version: 0,
    userId: 'testUserId',
    price: 20,
  });
  await order.save();

  const data: OrderCancelledEvent['data'] = {
    id: order.id,
    version: order.version + 1,
    ticket: {
      id: 'testTicketId',
    },
  }

  const msg: Partial<Message> = {
    ack: jest.fn()
  }

  return { listener, order, data, msg }
}

it('updates the status of an order', async () => {
  const { listener, order, data, msg } = await setup();
  await listener.onMessage(data, msg as Message);
  const updatedOrder = await Order.findById(order.id);
  expect(updatedOrder!.status).toEqual(OrderStatus.Cancelled);
});

it('acks the message', async () => {
  const { listener, order, data, msg } = await setup();
  await listener.onMessage(data, msg as Message);
  expect(msg.ack).toHaveBeenCalled();
});
