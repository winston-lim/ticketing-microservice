import request from 'supertest';
import { app } from '../../app';
import { signin } from '../../test/fixtures/helper';
import { Ticket } from '../../models/ticket';
import stan from '../../stan';

it('has a route handler listening to /api/tickets for post request', async ()=> {
  const response = await request(app)
    .post('/api/tickets')
    .send({});
  expect(response.status).not.toEqual(404);
});

it('can only be accessed if user is signed in', async () => {
  await request(app)
    .post('/api/tickets')
    .send({})
    .expect(401);
});

it('returns a status other than 401 if the user is signed in', async () => {
  const response = await request(app)
    .post('/api/tickets')
    .set('Cookie', signin())
    .send({})
  expect(response.status).not.toEqual(401);
});

it('returns an error if an invalid title is provided', async () => {
  await request(app)
    .post('/api/tickets')
    .set('Cookie', signin())
    .send({
        title: '',
        price: 10,
    })
    .expect(400);
    await request(app)
    .post('/api/tickets')
    .set('Cookie', signin())
    .send({
        price: 10,
    })
    .expect(400);
});

it('returns an error if an invalid price is provided', async () => {
  await request(app)
    .post('/api/tickets')
    .set('Cookie', signin())
    .send({
        title: 'test',
        price: -10,
    })
    .expect(400);
    await request(app)
    .post('/api/tickets')
    .set('Cookie', signin())
    .send({
        title: 'test'
    })
    .expect(400);
});

it('creates a ticket with valid inputs', async () => {
  let tickets = await Ticket.find({});
  expect(tickets.length).toEqual(0);

  let title = 'test title';
  let price = 100;
  await request(app)
    .post('/api/tickets')
    .set('Cookie', signin())
    .send({
      title,
      price,
    })
    .expect(201);
  
  const updatedTickets =  await Ticket.find({});
  expect(updatedTickets.length).toEqual(1);
  expect(updatedTickets[0].title).toEqual(title);
  expect(updatedTickets[0].price).toEqual(price);
});

it('publishes an event when creating a ticket', async () => {
  let title = 'test title';
  let price = 100;
  await request(app)
    .post('/api/tickets')
    .set('Cookie', signin())
    .send({
      title,
      price,
    })
    .expect(201);
  expect(stan.client.publish).toHaveBeenCalled();
});