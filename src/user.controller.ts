import { IncomingMessage, ServerResponse, STATUS_CODES } from 'http';
import { CustomError } from './errors/custom.error';

import * as userService from './user.service';

const sendJson = (
  res: ServerResponse,
  { statusCode = 200, data }: { statusCode?: number; data?: any }
): void => {
  res.writeHead(statusCode, {
    'Content-Type': 'application/json',
  });

  const statusCodeStr = statusCode.toString();

  if (!STATUS_CODES[statusCodeStr]) {
    throw new CustomError('invalid input');
  }

  if (data) {
    res.end(JSON.stringify(data));
  }
};

export const getAllUsers = (
  req: IncomingMessage,
  res: ServerResponse
): void => {
  sendJson(res, { data: userService.getUsers() });
};
