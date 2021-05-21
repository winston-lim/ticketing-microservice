import { Publisher, Subjects, TicketCreatedEvent } from "@winston-test/common";

export class TicketCreatedPublisher extends Publisher<TicketCreatedEvent>{
  readonly subject = Subjects.TicketCreated;
}