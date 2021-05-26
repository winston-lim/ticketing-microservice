import jwt from 'jsonwebtoken';
import { Types } from 'mongoose';

const signin = () => {
	// Build a JWT payload
	const payload = {
		id: new Types.ObjectId().toHexString(),
		email: 'test@id1.com'
	}
  // Create a JWT
	const token = jwt.sign(payload, process.env.JWT_KEY!);
  //Build req.session object which is { jwt: JWT }
	const session = { jwt: token }
  //Turn req.session into JSON
	const sessionJSON = JSON.stringify(session);
  //Encode JSON as base64
	const base64 = Buffer.from(sessionJSON).toString('base64');
  //return a string that is the base54 encoded JSON
	return [`express:sess=${base64}`]; //we return an array as supertest expects an array
}
export {signin}