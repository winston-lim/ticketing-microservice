export abstract class CustomError extends Error {
	abstract statusCode: number;
	constructor(message: string) {
		super(message);
		//As we are extending a base class
		Object.setPrototypeOf(this, CustomError.prototype);
	}
	abstract serializeErrors(): {
		message: string,
		field?: string,
	}[]
}