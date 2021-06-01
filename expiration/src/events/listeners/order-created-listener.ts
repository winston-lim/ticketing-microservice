import { Listener, OrderCreatedEvent, Subjects } from "@winston-test/common";
import { Message } from 'node-nats-streaming';
import { queueGroupName } from "./queue-group-name";


export class OrderCreatedListener extends Listener<OrderCreatedEvent> {
  subject: OrderCreatedEvent['subject'] = Subjects.OrderCreated;
  async onMessage(data: OrderCreatedEvent['data'], msg: Message) {
    try {
      msg.ack();
    } catch (e) {
      console.log(e);
      throw e;
    }
  }
}