import mongoose, { Model, Document, Schema } from 'mongoose';
import { Order, OrderStatus } from './order';
import { updateIfCurrentPlugin } from 'mongoose-update-if-current';
interface baseTicket {
	id: string;
	title: string;
	price: number;
}

export interface TicketDoc extends Document {
	title: string;
	price: number;
	version: number;
	isReserved(): Promise<boolean>;
}

export interface TicketModel extends Model<TicketDoc> {
	build(ticket: baseTicket): TicketDoc;
	eventQuery(event: { id: string; version: number }): Promise<TicketDoc | null>;
}

const ticketSchema = new Schema(
	{
		title: {
			type: String,
			required: true,
		},
		price: {
			type: Number,
			required: true,
			min: 0,
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

ticketSchema.set('versionKey', 'version');
ticketSchema.plugin(updateIfCurrentPlugin);
// ticketSchema.pre<TicketDoc>('save', function(next) {
//   const currentVersion = this.get('version');
//   // if (currentVersion !==0) {
//   //   this.$where = {
//   //     version: currentVersion - 1,
//   //   }
//   // }
//   this.$where = {
//     version: currentVersion - 1,
//   }
//   next();
// });

ticketSchema.statics.build = ({ id, title, price }: baseTicket) => {
	return new Ticket({
		_id: id,
		title: title,
		price: price,
	});
};

ticketSchema.statics.eventQuery = async (event: {
	id: string;
	version: number;
}) => {
	return await Ticket.findOne({
		_id: event.id,
		version: event.version - 1,
	});
};

ticketSchema.methods.isReserved = async function () {
	const existingOrder = await Order.findOne({
		ticket: this.id,
		status: {
			$in: [
				OrderStatus.Created,
				OrderStatus.AwaitingPayment,
				OrderStatus.Complete,
			],
		},
	});
	return !!existingOrder;
};

export const Ticket = mongoose.model<TicketDoc, TicketModel>(
	'Ticket',
	ticketSchema
);
