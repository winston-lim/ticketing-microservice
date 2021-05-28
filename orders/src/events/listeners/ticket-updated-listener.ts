import {
	Listener,
	TicketUpdatedEvent,
	Subjects,
	DatabaseConnectionError,
	NotFoundError,
} from '@winston-test/common';
import { Message } from 'node-nats-streaming';
import { Ticket } from '../../models/ticket';
import { queueGroupName } from './queue-group-name';

export class TicketUpdateListener extends Listener<TicketUpdatedEvent> {
	subject: TicketUpdatedEvent['subject'] = Subjects.TicketUpdated;
	queueGroupName = queueGroupName;
	async onMessage(
	  data: TicketUpdatedEvent['data'],
		msg: Message
	) {
		const ticket = await Ticket.eventQuery(data);
    console.log('event query', ticket);
    if (!ticket) throw new Error('Ticket not found');
		try {
      const { title, price, version } = data;
			await ticket!.set({
        title,
        price,
        //version
			});
      console.log('set: ', ticket);
			await ticket!.save();
      console.log('saved');
			msg.ack();
		} catch (e) {
      console.log(e);
			throw new DatabaseConnectionError();
		}
	}
}
