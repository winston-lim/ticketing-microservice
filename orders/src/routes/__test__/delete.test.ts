import request from 'supertest';
import { app } from '../../app';
import { Ticket } from '../../models/ticket';
import { signin } from "../../test/fixtures/helper";
import mongoose from 'mongoose';
import { OrderStatus } from '@winston-test/common';
import { Order } from '../../models/order';

it('can only be accessed if user is signed in', async () => {
  await request(app)
    .patch('/api/orders/randomId')
    .send()
    .expect(401);
});

it('returns a status other than 401 if the user is signed in', async () => {
  const response = await request(app)
    .patch('/api/orders/randomId')
    .set('Cookie', signin())
    .send()
  expect(response.status).not.toEqual(401);
});

it('throws a 400 error if an invalid orderId is given i.e. not a mongoId', async () => {
  await request(app)
    .patch('/api/orders/invalidOrderId')
    .set('Cookie', signin())
    .send()
    .expect(400);
});

it('throws a 404 error if a order does not exist', async ()=> {
  await request(app)
    .patch(`/api/orders/${new mongoose.Types.ObjectId().toHexString()}`)
    .set('Cookie', signin())
    .send()
    .expect(404);
});

it('throws a 401 if a order does not belong the the user', async () => {
  const ticket = Ticket.build({
    title:'Test',
    price:20
  });
  await ticket.save();
  
  const { body: order } = await request(app)
    .post('/api/orders')
    .set('Cookie', signin())
    .send({ ticketId: ticket.id })
    .expect(201);

  await request(app)
    .patch(`/api/orders/${order.id}`)
    .set('Cookie', signin())
    .send()
    .expect(401);
});

it('changes the status of an order to cancelled successfully', async () => {
  const ticket = Ticket.build({
    title:'Test',
    price:20
  });
  await ticket.save();
  
  const user = signin()
  const { body: order } = await request(app)
    .post('/api/orders')
    .set('Cookie', user)
    .send({ ticketId: ticket.id })
    .expect(201);

  const { body: updatedOrder} = await request(app)
    .patch(`/api/orders/${order.id}`)
    .set('Cookie', user)
    .send()
    .expect(200);
  
  const fetchedOrder = await Order.findById(updatedOrder.id);
  expect(fetchedOrder!.status).toEqual(OrderStatus.Cancelled);
});

it.todo('publishes an event');