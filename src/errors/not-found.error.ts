import { CustomError } from "./custom.error";

export class NotFound extends CustomError {
  statusCode = 404;
}