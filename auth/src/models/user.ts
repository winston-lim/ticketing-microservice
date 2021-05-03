import mongoose, { Document, Schema, Model} from 'mongoose';

export interface baseUser {
    email: string;
    password: string;
}

interface UserDocument extends baseUser, Document{
    createdBy: string;
    updatedAt: string;
}

export interface UserModel extends Model<UserDocument>{
    build(user: baseUser): UserDocument;
}

const userSchema = new Schema<UserDocument, UserModel>({
    email: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true,
    }
})

userSchema.statics.build = (user: baseUser) => {
    return new User(user);
}


export const User =  mongoose.model<UserDocument, UserModel>('User', userSchema);