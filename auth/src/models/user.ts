import mongoose, { Document, Schema, Model} from 'mongoose';
import jwt from 'jsonwebtoken';
import { Password } from '../services/password';
import { BadRequestError } from '@winston-test/common';
export interface baseUser {
    email: string;
    password: string;
}

interface baseUserDocument extends baseUser, Document{
    generateAuthToken(): string;
}

interface UserDocument extends baseUserDocument {
    currentUser: string;
}
export interface UserModel extends Model<UserDocument>{
    build(user: baseUser): UserDocument;
    login(email: string, password: string): UserDocument;
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
}, {
    toJSON: {
        transform(doc, ret) {
            delete ret.password;
            delete ret.__v;
            ret.id=ret._id;
            delete ret._id;
        }
    }
})

userSchema.pre('save', async function(done) {
    if (this.isModified('password')) {
        const hashed = await Password.toHash(this.get('password'));
        this.set('password', hashed);
    }
    done();
})

userSchema.statics.build = (user: baseUser) => {
    return new User(user);
}

userSchema.statics.login = async (email: string, password: string) => {
    const user = await User.findOne({email});
    if (!user) throw new BadRequestError('Invalid credentials');
    const passwordMatch = await Password.compare(user.password, password);
    if (!passwordMatch) throw new BadRequestError('Invalid credentials');
    return user;
}

userSchema.methods.generateAuthToken = function (this: baseUserDocument) {
    const user = this;
    const token = jwt.sign({
        id: user.id,
        email: user.email,
    }, process.env.JWT_KEY!);
    return token;
}


export const User =  mongoose.model<UserDocument, UserModel>('User', userSchema);