import { Listener, Subjects, ExpirationCompleteEvent, OrderStatus } from "@winston-test/common";
import { Message } from "node-nats-streaming";
import { Order } from "../../models/order";
import { OrderCancelledPublisher } from "../publishers/order-cancelled-publisher";
import { queueGroupName } from './queue-group-name';
export class ExpirationCompleteListener extends Listener<ExpirationCompleteEvent> {
  subject: ExpirationCompleteEvent['subject'] = Subjects.ExpirationComplete;
  queueGroupName = queueGroupName;
  async onMessage(data: ExpirationCompleteEvent['data'], msg: Message) {
    const { orderId } = data;
    const order = await Order.findById(orderId).populate('ticket');
    if (!order) throw new Error('Order not found');
    if (order.status === OrderStatus.Complete) {
      return msg.ack();
    }
    order.set({
      status: OrderStatus.Cancelled,
    });
    try {
      await order.save();
      await new OrderCancelledPublisher(this.client).publish({
        id: orderId,
        version: order.version,
        ticket: {
          id: order.ticket.id,
        }
      })
      msg.ack();
    } catch (e) {
      console.log(e);
      throw e;
    }
  }
}
