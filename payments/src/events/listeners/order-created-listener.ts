import { Listener, OrderCreatedEvent, Subjects } from '@winston-test/common';
import { Message } from 'node-nats-streaming';
import { Order } from '../../models/order';
import { queueGroupName } from './queue-group-name';

export class OrderCreatedListener extends Listener<OrderCreatedEvent> {
  subject: OrderCreatedEvent['subject'] = Subjects.OrderCreated;
  queueGroupName = queueGroupName;
  async onMessage(data: OrderCreatedEvent['data'], msg: Message) {
    const { id, status, userId, version, ticket: { price }} = data;
    const order = Order.build({
      id,
      price,
      status,
      userId,
      version,
    });
    try {
      await order.save();
      msg.ack();
    } catch(e) {
      console.log(e);
      throw e;
    }
  }
}