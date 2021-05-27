import { Ticket } from '../ticket';

it('implements optimistic concurrency control', async (done) => {
  const ticket = Ticket.build({
    title: 'test',
    price: 20,
    userId: 'test'
  });
  await ticket.save();

  const ticketOne = await Ticket.findById(ticket.id);
  const ticketTwo = await Ticket.findById(ticket.id);

  ticketOne!.set({
    title: 'update One',
  });

  ticketTwo!.set({
    title: 'update Two'
  });

  await ticketOne!.save();
  try {
    await ticketTwo!.save();
  } catch (e) {
    return done();
  }

  throw new Error('Should reach this point');
});

it('increments the version number on multiple saves', async () => {
  const ticket = Ticket.build({
    title: 'test',
    price: 20,
    userId: 'test'
  });
  await ticket.save();
  expect(ticket.version).toEqual(0);

  const update = await Ticket.findById(ticket.id);
  update!.set({
    title: 'updated',
    price: 21
  });
  await update!.save();
  expect(update!.version).toEqual(1);
});