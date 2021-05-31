import { Types } from 'mongoose';
import request from 'supertest';
import { app } from '../../app';
import { Order, OrderStatus } from '../../models/order';
import { Ticket } from '../../models/ticket';
import { signin } from '../../test/fixtures/helper';

const buildTicket = async () => {
  const ticket = Ticket.build({
    id: new Types.ObjectId().toHexString(),
    title: 'test',
    price: 20,
  });
  await ticket.save();
  return ticket;
}

it('can only be accessed if user is signed in', async () => {
  await request(app)
    .get('/api/orders')
    .send()
    .expect(401);
});

it('returns a status other than 401 if the user is signed in', async () => {
  const response = await request(app)
    .get('/api/orders/randomId')
    .set('Cookie', signin())
    .send()
  expect(response.status).not.toEqual(401);
});

it('fetches orders for a particular user', async ()=> {
  const ticketA = await buildTicket();
  const ticketB = await buildTicket();
  const ticketC = await buildTicket();
  
  const userOne = signin();
  const userTwo = signin();

  const { body: orderA } = await request(app)
    .post('/api/orders')
    .set('Cookie', userOne)
    .send({ ticketId: ticketA.id })
    .expect(201);
  const { body: orderB } = await request(app)
    .post('/api/orders')
    .set('Cookie', userOne)
    .send({ ticketId: ticketB.id })
    .expect(201);
  const { body: orderC } = await request(app)
    .post('/api/orders')
    .set('Cookie', userTwo)
    .send({ ticketId: ticketC.id })
    .expect(201);
  
  const responseOne = await request(app)
    .get('/api/orders')
    .set('Cookie', userOne)
    .send()
    .expect(200);
  const responseTwo = await request(app)
    .get('/api/orders')
    .set('Cookie', userTwo)
    .send()
    .expect(200);
  expect(responseOne.body.length).toEqual(2);
  expect(responseOne.body[0].id).toEqual(orderA.id);
  expect(responseOne.body[1].id).toEqual(orderB.id);
  expect(responseTwo.body.length).toEqual(1);
  expect(responseTwo.body[0].id).toEqual(orderC.id);
});