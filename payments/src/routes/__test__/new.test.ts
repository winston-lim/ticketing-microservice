import { OrderStatus } from '@winston-test/common';
import { Types } from 'mongoose';
import request from 'supertest';
import { app } from '../../app';
import { Order } from '../../models/order';
import { Payment } from '../../models/payment';
import { stripe } from '../../stripe';
import { signin } from '../../test/fixtures/helper';

it('returns a 404 when attempting to purchase an order that does not exist', async () => {
  await request(app)
    .post('/api/payments')
    .set('Cookie', signin())
    .send({
      token: 'testToken',
      orderId: new Types.ObjectId().toHexString(),
    })
    .expect(404);
});

it('returns a 401 when purchasing an order that does not belong to current user', async () => {
  const order = Order.build({
    id: new Types.ObjectId().toHexString(),
    status: OrderStatus.Created,
    version: 0,
    userId: new Types.ObjectId().toHexString(),
    price: 20
  });
  await order.save();
  await request(app)
    .post('/api/payments')
    .set('Cookie', signin())
    .send({
      token: 'testToken',
      orderId: order.id,
    })
    .expect(401);
});

it('returns a 400 when purchasing a cancelled order', async () => {
  const order = Order.build({
    id: new Types.ObjectId().toHexString(),
    status: OrderStatus.Cancelled,
    version: 0,
    userId: new Types.ObjectId().toHexString(),
    price: 20
  });
  await order.save();
  await request(app)
    .post('/api/payments')
    .set('Cookie', signin(order.userId))
    .send({
      token: 'testToken',
      orderId: order.id,
    })
    .expect(400);
});

// using mock stripe client
// it('returns a 201 with valid inputs', async () => {
//   const order = Order.build({
//     id: new Types.ObjectId().toHexString(),
//     status: OrderStatus.Created,
//     version: 0,
//     userId: new Types.ObjectId().toHexString(),
//     price: 20
//   });
//   await order.save();
//   await request(app)  
//     .post('/api/payments')
//     .set('Cookie', signin(order.userId))
//     .send({
//       token: 'tok_visa',
//       orderId: order.id
//     })
//     .expect(201);
//   const chargeOptions = (stripe.charges.create as jest.Mock).mock.calls[0][0];
//   expect(stripe.charges.create).toHaveBeenCalled();
//   expect(chargeOptions.amount).toEqual(order.price*100);
//   expect(chargeOptions.source).toEqual('tok_visa');
//   expect(chargeOptions.currency).toEqual('usd');
// });

//using real Stripe  API
it('returns 201 with valid inputs', async () => {
  const price = Math.floor(Math.random()*100000);
  const order = Order.build({
    id: new Types.ObjectId().toHexString(),
    status: OrderStatus.Created,
    version: 0,
    userId: new Types.ObjectId().toHexString(),
    price,
  });
  await order.save();
  await request(app)  
    .post('/api/payments')
    .set('Cookie', signin(order.userId))
    .send({
      token: 'tok_visa',
      orderId: order.id
    })
    .expect(201);
  
  const stripeCharges = await stripe.charges.list({ limit: 50});
  const stripeCharge = stripeCharges.data.find(charge => {
    return charge.amount === price*100
  });
  expect(stripeCharge).toBeDefined();
  expect(stripeCharge!.currency).toEqual('usd');

  const payment = await Payment.findOne({
    orderId: order.id,
    stripeId: stripeCharge!.id,
  });
  expect(payment).not.toBeNull();
});
