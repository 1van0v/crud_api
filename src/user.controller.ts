import { IncomingMessage, ServerResponse, STATUS_CODES } from 'http';
import { CustomError } from './errors';
import { CreateUser } from './user.model';

import * as userService from './user.service';
import * as userValidator from './user.validator';

export const sendJson = (
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

const readJson = <T>(req: IncomingMessage): Promise<T> => {
  return new Promise((resolve, reject) => {
    const hasJsonHeader = req.headers['content-type'] === 'application/json';

    if (!hasJsonHeader) {
      return reject(new CustomError('invalid content type'));
    }

    let jsonStr = '';

    req.on('data', (chunk: Buffer) => {
      jsonStr += chunk.toString();
    });

    req.on('end', () => {
      try {
        const jsonData = JSON.parse(jsonStr);
        resolve(jsonData);
      } catch (e) {
        console.error(e);
        reject(new CustomError('invalid json format'));
      }
    });
  });
};

export const getAllUsers = (
  req: IncomingMessage,
  res: ServerResponse
): void => {
  sendJson(res, { data: userService.getUsers() });
};

export const createUser = async (
  req: IncomingMessage,
  res: ServerResponse
): Promise<void> => {
  const newUser = (await readJson(req)) as CreateUser;
  userValidator.canCreate(newUser);
  const createdUser = userService.addUser(newUser);
  sendJson(res, { statusCode: 201, data: createdUser });
};
