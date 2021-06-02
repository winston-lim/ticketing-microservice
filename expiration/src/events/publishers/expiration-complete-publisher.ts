import { Publisher, ExpirationCompleteEvent, Subjects } from "@winston-test/common";

export class ExpirationCompletePublisher extends Publisher<ExpirationCompleteEvent> {
  subject: Subjects.ExpirationComplete = Subjects.ExpirationComplete;
}