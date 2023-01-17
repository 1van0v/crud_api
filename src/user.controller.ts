import * as uuid from 'uuid';

import { IncomingMessage, ServerResponse, STATUS_CODES } from 'http';
import { BadRequest, CustomError, NotFound } from './errors';
import { CreateUser, UpdateUser, User } from './models/user.model';
import * as userService from './user.service';
import * as userValidator from './user.validator';

const parseUuid = (url?: string): string => {
  const requestedUuid =
    url
      ?.split('/')
      .reverse()
      .find((i) => i !== 'a') || '';

  if (!uuid.validate(requestedUuid)) {
    throw new BadRequest('uuid is invalid');
  }

  return requestedUuid;
};

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

const findOrThrow = (url?: string): User => {
  const id = parseUuid(url);
  const user = userService.find(id);

  if (!user) {
    throw new NotFound(`User with id = ${id} does not exist`);
  }

  return user;
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
  const newUser = await readJson<CreateUser>(req);
  userValidator.canCreate(newUser);
  const createdUser = await userService.addUser(newUser);
  sendJson(res, { statusCode: 201, data: createdUser });
};

export const getUserById = (
  req: IncomingMessage,
  res: ServerResponse
): void => {
  const data = findOrThrow(req.url);

  sendJson(res, { data });
};

export const updateUser = async (
  req: IncomingMessage,
  res: ServerResponse
): Promise<void> => {
  const user = findOrThrow(req.url);
  const updates = await readJson<UpdateUser>(req);
  userValidator.canUpdate(updates);
  const updatedUser = await userService.update(user, updates);

  sendJson(res, { data: updatedUser });
};

export const deleteUser = (req: IncomingMessage, res: ServerResponse): void => {
  const user = findOrThrow(req.url);
  userService.deleteUser(user);

  res.statusCode = 204;
  res.end();
};
