import { OrderStatus } from '@winston-test/common';
import mongoose, { Document, Model } from 'mongoose';
import { updateIfCurrentPlugin } from 'mongoose-update-if-current';

interface baseOrder {
  id: string;
  status: OrderStatus;
  version: number;
  userId: string;
  price: number;
}

interface OrderDocument extends Document {
  status: OrderStatus;
  version: number;
  userId: string;
  price: number;
}

interface OrderModel extends Model<OrderDocument> {
  build(order: baseOrder): OrderDocument;
}

const orderSchema = new mongoose.Schema({
  status: {
    type: String,
    required: true
  } ,
  userId: {
    type: String,
    required: true
  },
  price: {
    type: Number,
    required: true
  }
}, {
  toJSON: {
    transform(doc, ret) {
      ret.id = ret._id;
      delete ret._id;
    }
  }
});

orderSchema.set('versionKey', 'version');
orderSchema.plugin(updateIfCurrentPlugin);

orderSchema.statics.build = (order: baseOrder) => {
  return new Order({
    _id: order.id,
    status: order.status,
    version: order.version,
    price: order.price,
    userId: order.userId,
  });
}

export const Order = mongoose.model<OrderDocument, OrderModel>('Order', orderSchema);