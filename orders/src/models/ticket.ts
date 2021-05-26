import mongoose, { Model, Document, Schema } from 'mongoose';
import { Order, OrderStatus } from './order';

interface baseTicket {
  title: string;
  price: number;
}

export interface TicketDoc extends baseTicket, Document{
  createdBy: string;
  updatedAt: string;
  isReserved(): Promise<boolean>;
}

export interface TicketModel extends Model<TicketDoc>{
  build(ticket: baseTicket): TicketDoc;
}

const ticketSchema = new Schema<TicketDoc, TicketModel>({
  title: {
      type: String,
      required: true
  },
  price: {
      type: Number,
      required: true,
  },
}, {
  toJSON: {
      transform(doc, ret) {
          ret.id=ret._id;
          delete ret._id;
      }
  }
})

ticketSchema.statics.build = (ticket: baseTicket) => {
return new Ticket(ticket);
}

ticketSchema.methods.isReserved = async function(this: TicketDoc) {
  const existingOrder = await Order.findOne({
    ticket: this,
    status: {
      $in: [
        OrderStatus.Created,
        OrderStatus.AwaitingPayment,
        OrderStatus.Complete,
      ]
    }
  });
  return !!existingOrder;
}

export const Ticket =  mongoose.model<TicketDoc, TicketModel>('Ticket', ticketSchema);

