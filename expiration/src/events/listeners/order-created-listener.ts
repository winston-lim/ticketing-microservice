import { Listener, OrderCreatedEvent, Subjects } from "@winston-test/common";
import { Message } from 'node-nats-streaming';
import { expirationQueue } from "../../queues/expiration-queue";
import { queueGroupName } from "./queue-group-name";
 
export class OrderCreatedListener extends Listener<OrderCreatedEvent> {
  subject: OrderCreatedEvent['subject'] = Subjects.OrderCreated;
  queueGroupName = queueGroupName;
  async onMessage(data: OrderCreatedEvent['data'], msg: Message) {
    const { id, expiresAt } = data;
    const delay = new Date(expiresAt).getTime() - new Date().getTime();
    console.log('Delay set to: ', delay);
    try {
      await expirationQueue.add({
        orderId: id,
      }, {
        delay: 10000,
      });
      msg.ack();
    } catch (e) {
      console.log(e);
      throw e;
    }
  }
}