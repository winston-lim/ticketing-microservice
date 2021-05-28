import mongoose, { Document, Schema, Model } from 'mongoose';
import { OrderStatus } from '@winston-test/common';
import { TicketDoc } from './ticket';
import { updateIfCurrentPlugin } from 'mongoose-update-if-current';

export { OrderStatus };
export interface baseOrder {
	userId: string;
	status: OrderStatus;
	expiresAt: Date;
	ticket: TicketDoc;
}

interface OrderDocument extends baseOrder, Document {
  version: number;
	isReserved(): boolean;
}
export interface OrderModel extends Model<OrderDocument> {
	build(ticket: baseOrder): OrderDocument;
}

const orderSchema = new Schema(
	{
		userId: {
			type: String,
			required: true,
		},
		status: {
			type: String,
			required: true,
			enum: Object.values(OrderStatus),
		},
		expiresAt: {
			type: mongoose.Schema.Types.Date,
		},
		ticket: {
			type: mongoose.Schema.Types.ObjectId,
			ref: 'Ticket',
		},
	},
	{
		toJSON: {
			transform(doc, ret) {
				ret.id = ret._id;
				delete ret._id;
			},
		},
	}
);

orderSchema.set('versionKey', 'version');
orderSchema.plugin(updateIfCurrentPlugin);

orderSchema.statics.build = (order: baseOrder) => {
	return new Order(order);
};

export const Order = mongoose.model<OrderDocument, OrderModel>(
	'Order',
	orderSchema
);
