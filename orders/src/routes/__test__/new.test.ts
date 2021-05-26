import request from 'supertest';
import mongoose from 'mongoose';
import { app } from '../../app';
import { signin } from '../../test/fixtures/helper';
import { Order, OrderStatus } from '../../models/order';
import { Ticket } from '../../models/ticket';
import stan from '../../stan';

it('has a route handler listening to /api/orders for post request', async ()=> {
  const response = await request(app)
    .post('/api/orders')
    .send({});
  expect(response.status).not.toEqual(404);
});

it('can only be accessed if user is signed in', async () => {
  await request(app)
    .post('/api/orders')
    .send()
    .expect(401);
});

it('returns a status other than 401 if the user is signed in', async () => {
  const response = await request(app)
    .post('/api/orders')
    .set('Cookie', signin())
    .send()
  expect(response.status).not.toEqual(401);
});

it('returns an error if the ticket does not exist', async () => {
  const ticketId = mongoose.Types.ObjectId();
  
  await request(app)
    .post('/api/orders')
    .set('Cookie', signin())
    .send({ ticketId })
    .expect(404);
});

it('returns an error if the ticket is already reserved', async () => {
  const userId = mongoose.Types.ObjectId();
  const ticket = Ticket.build({
    title: 'test',
    price: 20,
  });
  await ticket.save();
  const order = Order.build({
    ticket,
    userId: 'testId',
    status: OrderStatus.Created,
    expiresAt: new Date()
  });
  await order.save();
  await request(app)
    .post('/api/orders')
    .set('Cookie', signin())
    .send({ ticketId: ticket.id })
    .expect(400);
});

it('reserves a ticket successfully', async () => {
  const ticket = Ticket.build({
    title: 'test',
    price: 20,
  });
  await ticket.save();
  await request(app)
    .post('/api/orders') 
    .set('Cookie',signin())
    .send({ ticketId: ticket.id })
    .expect(201);
});

it('emits an order created event', async ()=> {
  const ticket = Ticket.build({
    title: 'test',
    price: 20,
  });
  await ticket.save();
  await request(app)
    .post('/api/orders') 
    .set('Cookie',signin())
    .send({ ticketId: ticket.id })
    .expect(201);
  expect(stan.client.publish).toHaveBeenCalled();
})