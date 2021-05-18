import request from 'supertest';
import { app } from '../../app';
import { signin } from '../../test/fixtures/helper';
import mongoose from 'mongoose';
it('returns a 404 if the ticket is not found', async () => {
  const id = new mongoose.Types.ObjectId().toHexString();
  await request(app)
    .get(`/api/tickets/${id}`)
    .send()
    .expect(404);
})

it('returns a 400 if a invalid ticketID is passed in', async () => {
  await request(app)
    .get('/api/tickets/badId')
    .send()
    .expect(400);
})

it('returns a ticket if it exists', async () => {
  const title = 'test title';
  const price = 20;
  const response = await request(app)
    .post('/api/tickets')
    .set('Cookie', signin())
    .send({ title, price })
    .expect(201);
  const ticketResponse = await request(app)
      .get(`/api/tickets/${response.body.id}`)
      .send()
      .expect(200);
  expect(ticketResponse.body.title).toEqual(title);
  expect(ticketResponse.body.price).toEqual(price);
})