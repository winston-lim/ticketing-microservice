import mongoose, { Document, Schema, Model} from 'mongoose';
import { updateIfCurrentPlugin } from 'mongoose-update-if-current';
export interface baseTicket {
    title: string;
    price: number;
    userId: string;
}

interface TicketDocument extends baseTicket, Document{
    version: number;
    orderId?: string;
}

export interface TicketModel extends Model<TicketDocument>{
  build(ticket: baseTicket): TicketDocument;
}

const ticketSchema = new Schema({
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
    },
    orderId: {
      type: String,
    }
}, {
    toJSON: {
        transform(doc, ret) {
            ret.id=ret._id;
            delete ret._id;
        }
    }
})
ticketSchema.set('versionKey', 'version');
ticketSchema.plugin(updateIfCurrentPlugin);

ticketSchema.statics.build = (ticket: baseTicket) => {
  return new Ticket(ticket);
}

export const Ticket =  mongoose.model<TicketDocument, TicketModel>('Ticket', ticketSchema);