import request from 'supertest';
import { app } from '../../app';
import { signin } from '../../test/fixtures/helper';

const createTicket = () => {
  return request(app)
    .post('/api/tickets')
    .set('Cookie', signin())
    .send({
      title: 'test title',
      price: 20,
    })
}

it('fetches a list of tickets', async () => {
  await createTicket();
  await createTicket();
  await createTicket();
  
  const response = await request(app)
    .get('/api/tickets')
    .send()
    .expect(200);
  expect(response.body.length).toEqual(3);
});