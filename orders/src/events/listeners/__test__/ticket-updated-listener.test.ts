import { Message, Stan } from 'node-nats-streaming';
import { TicketCreatedEvent as TicketUpdatedEvent } from "@winston-test/common";
import { Types } from "mongoose";
import { Ticket } from '../../../models/ticket';
import { TicketUpdateListener } from '../ticket-updated-listener';
import stan from '../../../stan';


const setup = async () => {
  const listener = new TicketUpdateListener(stan.client as unknown as Stan);

  const ticketId = new Types.ObjectId().toHexString();
  const ticket = Ticket.build({
    id: ticketId,
    title: 'test',
    price: 20,
  });
  await ticket.save();
  console.log ('saved', ticket);

  const data: TicketUpdatedEvent['data'] = {
    id: ticketId,
    version: ticket.version + 1,
    title: 'updated title',
    price: 21,
    userId: new Types.ObjectId().toHexString(),
  }

  const msg: Partial<Message> = {
    ack: jest.fn(),
  }
  return {
    listener,
    data,
    msg
  }
}

it('finds, updates and saves a ticket', async ()=> {
  const { listener, data, msg } = await setup();
  await listener.onMessage(data, msg as Message);
  
  const updatedTicket = await Ticket.findById(data.id);
  expect(updatedTicket!.title).toEqual(data.title);
  expect(updatedTicket!.price).toEqual(data.price);
  expect(updatedTicket!.version).toEqual(data.version);
});

it('acks the message on applying a update successfully', async ()=> {
  const { listener, data, msg } = await setup();
  await listener.onMessage(data, msg as Message);
  expect(msg.ack).toHaveBeenCalledTimes(1);
});

it('does not ack the message when an invalid update is applied', async () => {
  const { listener, data: { id, title, price, userId }, msg } = await setup();
  try {
    await listener.onMessage({ id, title, price, userId, version: 100} , msg as Message); 
  } catch (e) {

  }

  expect(msg.ack).not.toHaveBeenCalled();
})