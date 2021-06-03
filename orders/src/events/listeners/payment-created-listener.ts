import { Subjects, Listener, PaymentCreatedEvent, OrderStatus } from '@winston-test/common';
import { Message } from 'node-nats-streaming';
import { Order } from '../../models/order';
import { queueGroupName } from './queue-group-name';

export class PaymentCreatedListener extends Listener<PaymentCreatedEvent> {
  subject: PaymentCreatedEvent['subject'] = Subjects.PaymentCreated;
  queueGroupName = queueGroupName;
  async onMessage(data: PaymentCreatedEvent['data'], msg: Message) {
    const { paymentId, orderId, stripeId } = data;
    const order = await Order.findById(orderId);
    if (!order) throw new Error('Order not found');
    order.set({
      status: OrderStatus.Complete,
    });
    try {
      await order.save();
      msg.ack();
    } catch (e) {
      console.log(e);
      throw e;
    }
  }
}