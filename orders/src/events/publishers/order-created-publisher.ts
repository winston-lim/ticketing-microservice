import { Publisher, OrderCreatedEvent, Subjects } from "@winston-test/common";

export class OrderCreatedPublisher extends Publisher<OrderCreatedEvent> {
  subject: Subjects.OrderCreated = Subjects.OrderCreated;
}