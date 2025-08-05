import Crypto from 'crypto';

export function generateUnhashedToken(length = 64) {
  // Generates 'length' random bytes and converts them to a hexadecimal string
  return Crypto.randomBytes(length).toString('hex');
}

export class ErrorHelper extends Error {
  status: number;
  errorCode: string;

  constructor(errorCode: string, message: string, status: number) {
    // errorCode

    super(message);

    this.name = 'CustomError';
    this.status = status;
    this.errorCode = errorCode;

    // Set the prototype explicitly (for older TS versions)
    Object.setPrototypeOf(this, ErrorHelper.prototype);
  }
}
