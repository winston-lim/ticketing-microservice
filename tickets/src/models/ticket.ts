import mongoose, { Document, Schema, Model} from 'mongoose';

export interface baseTicket {
    title: string;
    price: number;
    userId: string;
}

interface baseTicketDocument extends baseTicket, Document{
    createdBy: string;
    updatedAt: string;
}

interface TicketDocument extends baseTicketDocument {
}

export interface TicketModel extends Model<TicketDocument>{
  build(ticket: baseTicket): TicketDocument;
}

const TicketSchema = new Schema<TicketDocument, TicketModel>({
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

TicketSchema.statics.build = (ticket: baseTicket) => {
  return new Ticket(ticket);
}

export const Ticket =  mongoose.model<TicketDocument, TicketModel>('Ticket', TicketSchema);