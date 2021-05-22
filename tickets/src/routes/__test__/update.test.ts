import request from 'supertest';
import { app } from '../../app';
import { signin } from '../../test/fixtures/helper';
import { Types } from 'mongoose';
import stan from '../../stan';
it('returns a 404 if ticket id does not exist', async ()=> {
  const id = new Types.ObjectId().toHexString();
  await request(app)
    .put(`/api/tickets/${id}`)
    .set('Cookie', signin())
    .send({
      title: 'Updated title',
      price: 21,
    })
    .expect(404)
});

it('returns a 401 if the user is not authenticated', async ()=> {
  const id = new Types.ObjectId().toHexString();
  await request(app)
    .put(`/api/tickets/${id}`)
    .send({
      title: 'Updated title',
      price: 21,
    })
    .expect(401);
});

it('returns a 401 if the user does not own the ticket', async ()=> {
  const response = await request(app)
    .post('/api/tickets')
    .set('Cookie', signin())
    .send({
      title: 'id1 ticket',
      price: 21
    })
    .expect(201);
  await request(app)
    .put(`/api/tickets/${response.body.id}`)
    .set('Cookie', signin())
    .send({
      title: 'Updated title',
      price: 21,
    })
    .expect(401);
});

it('returns a 400 if the user provides an invalid title or price', async ()=> {
  const cookie = signin();
  const response = await request(app)
    .post('/api/tickets')
    .set('Cookie', cookie)
    .send({
      title: 'id1 ticket',
      price: 21
    })
    .expect(201);
  const id = response.body.id;
  await request(app)
    .put(`/api/tickets/${id}`)
    .set('Cookie', cookie)
    .send({
      price: 21,
    })
    .expect(400);
  await request(app)
    .put(`/api/tickets/${id}`)
    .set('Cookie', cookie)
    .send({
      title: 'valid title'
    })
    .expect(400);
  await request(app)
    .put(`/api/tickets/${id}`)
    .set('Cookie', cookie)
    .send({
      title: '',
      price: 21,
    })
    .expect(400);
  await request(app)
    .put(`/api/tickets/${id}`)
    .set('Cookie', cookie)
    .send({
      title: 'valid title',
      price: -1,
    })
    .expect(400);
  await request(app)
    .put(`/api/tickets/${id}`)
    .set('Cookie', cookie)
    .send({})
    .expect(400);
});

it('returns a 200 and updates ticket if valid inputs were provided', async ()=> {
  const cookie = signin();
  const response = await request(app)
    .post('/api/tickets')
    .set('Cookie', cookie)
    .send({
      title: 'Valid title',
      price: 20
    }).expect(201);
  await request(app)
    .put(`/api/tickets/${response.body.id}`)
    .set('Cookie', cookie)
    .send({
      title: 'Updated title',
      price: 21,
    })
    .expect(200);
  const newTicket = await request(app)
    .get(`/api/tickets/${response.body.id}`)
    .send();
  expect(newTicket.body.title).toEqual('Updated title');
  expect(newTicket.body.price).toEqual(21);
});

it('publishes an event when updating a ticket', async () => {
  const cookie = signin();
  const response = await request(app)
    .post('/api/tickets')
    .set('Cookie', cookie)
    .send({
      title: 'Valid title',
      price: 20
    }).expect(201);
  await request(app)
    .put(`/api/tickets/${response.body.id}`)
    .set('Cookie', cookie)
    .send({
      title: 'Updated title',
      price: 21,
    })
    .expect(200);
  expect(stan.client.publish).toHaveBeenCalled();
});