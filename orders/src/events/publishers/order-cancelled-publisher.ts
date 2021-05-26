import { Publisher, OrderCancelledEvent, Subjects } from "@winston-test/common";

export class OrderCancelledPublisher extends Publisher<OrderCancelledEvent> {
  subject: Subjects.OrderCancelled = Subjects.OrderCancelled;
}