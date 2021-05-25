import mongoose, { Model, Document, Schema } from 'mongoose';

interface baseTicket {
  title: string;
  price: number;
}

export interface TicketDoc extends baseTicket, Document{
  createdBy: string;
  updatedAt: string;
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
  userId: {
    type: String,
    required: true,
  }
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

export const Ticket =  mongoose.model<TicketDoc, TicketModel>('Ticket', ticketSchema);

