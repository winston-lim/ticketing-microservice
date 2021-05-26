import mongoose, { Document, Schema, Model} from 'mongoose';
import { OrderStatus } from '@winston-test/common';
import { TicketDoc } from './ticket';

export { OrderStatus }
export interface baseOrder {
    userId: string;
    status: OrderStatus;
    expiresAt: Date;
    ticket: TicketDoc;
}

interface baseOrderDocument extends baseOrder, Document{
    createdBy: string;
    updatedAt: string;
    isReserved(): boolean
}

interface OrderDocument extends baseOrderDocument {
}

export interface OrderModel extends Model<OrderDocument>{
  build(ticket: baseOrder): OrderDocument;
}

const orderSchema = new Schema<OrderDocument, OrderModel>({
    userId: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      required: true,
      enum: Object.values(OrderStatus)
    },
    expiresAt: {
      type: mongoose.Schema.Types.Date,
    },
    ticket: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Ticket'
    }
}, {
    toJSON: {
        transform(doc, ret) {
            ret.id=ret._id;
            delete ret._id;
        }
    }
})

orderSchema.statics.build = (order: baseOrder) => {
  return new Order(order);
}

export const Order =  mongoose.model<OrderDocument, OrderModel>('Order', orderSchema);