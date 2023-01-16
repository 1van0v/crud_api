export class CustomError extends Error {
  statusCode = 500;

  constructor(msg: string, statusCode?: number) {
    super(msg);

    if (statusCode) {
      this.statusCode = statusCode;
    }
  }
}
