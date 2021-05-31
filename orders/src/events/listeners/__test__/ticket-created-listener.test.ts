import { TicketCreatedEvent } from '@winston-test/common';
import { Message, Stan } from 'node-nats-streaming';
import { Types } from 'mongoose';
import { TicketCreatedListener } from "../ticket-created-listener";
import { Ticket } from '../../../models/ticket';
import stan from '../../../stan';

const setup = async () => {
  const listener = new TicketCreatedListener(stan.client as unknown as Stan);
  const data: TicketCreatedEvent['data'] = {
    id: new Types.ObjectId().toHexString(),
    version: 0,
    title: 'test',
    price: 20,
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

it('creates and save a ticket', async ()=> {
  const { listener, data, msg } = await setup();
  await listener.onMessage(data,msg as Message);
  
  const ticket = await Ticket.findById(data.id);
  expect(ticket).not.toBeNull();
  expect(ticket!.title).toEqual(data.title);
  expect(ticket!.price).toEqual(data.price);
});

it('acks the message', async ()=> {
  const { listener, data, msg } = await setup();
  await listener.onMessage(data, msg as Message);
  expect(msg.ack).toBeCalledTimes(1);
});