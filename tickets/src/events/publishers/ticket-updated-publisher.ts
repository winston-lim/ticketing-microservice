import { Publisher, Subjects, TicketUpdatedEvent } from "@winston-test/common";

export class TicketUpdatedPublisher extends Publisher<TicketUpdatedEvent>{
  readonly subject = Subjects.TicketUpdated;
}