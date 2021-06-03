import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';
require('dotenv').config();

jest.mock('../stan.ts');
//jest.mock('../stripe.ts');


let mongo: any;
beforeAll(async()=> {
    process.env.JWT_KEY = 'test';
    mongo = new MongoMemoryServer();
    const mongUri = await mongo.getUri();

    await mongoose.connect(mongUri, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    });
})

beforeEach(async ()=>{
    jest.clearAllMocks();
    const collections = await mongoose.connection.db.collections();
    for (let collection of collections) {
        await collection.deleteMany({});
    }
})

afterAll(async () => {
    await mongo.stop();
    await mongoose.connection.close();
});