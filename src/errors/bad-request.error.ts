import { CustomError } from './custom.error';

export class BadRequest extends CustomError {
  statusCode = 400;
}
