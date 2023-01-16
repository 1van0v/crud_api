import http, { IncomingMessage, ServerResponse } from 'http';
import { CustomError } from './errors';

import * as userController from './user.controller';

export const server = http.createServer(
  async (req: IncomingMessage, res: ServerResponse): Promise<void> => {
    try {
      console.log(req.method, req.url);
      if (req.method === 'GET' && req.url === '/api/users') {
        return userController.getAllUsers(req, res);
      } else if (req.method === 'POST' && req.url === '/api/users') {
        return await userController.createUser(req, res);
      }

      res.end('not found');
    } catch (e) {
      const error = e as CustomError;
      const statusCode = error.statusCode || 500;
      const message = error.statusCode
        ? error.message
        : 'Something terribly wrong has happened';

      userController.sendJson(res, { statusCode, data: { message } });
    }
  }
);
