import mongoose, { Document, Model } from 'mongoose';
import { updateIfCurrentPlugin } from 'mongoose-update-if-current';

interface basePayment {
  orderId: string;
  stripeId: string;
}

interface PaymentDocument extends basePayment, Document {
  version: number;
}

interface PaymentModel extends Model<PaymentDocument> {
  build(payment: basePayment): PaymentDocument;
}

const paymentSchema = new mongoose.Schema({
  orderId: {
    required: true,
    type: String
  },
  stripeId: {
    required: true,
    type: String,
  },
}, {
  toJSON: {
    transform(doc,ret) {
      ret.id = ret._id;
      delete ret._id;
    }
  }
}
);

paymentSchema.set('versionKey', 'version');
paymentSchema.plugin(updateIfCurrentPlugin);

paymentSchema.statics.build = (payment: basePayment) => {
  return new Payment(payment);
}

export const Payment = mongoose.model<PaymentDocument, PaymentModel>('Payment', paymentSchema);