import { Subjects, Publisher, PaymentCreatedEvent } from '@winston-test/common';

export class PaymentCreatedPublisher extends Publisher<PaymentCreatedEvent> {
  subject: PaymentCreatedEvent['subject'] = Subjects.PaymentCreated;
}
