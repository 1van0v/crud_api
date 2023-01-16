import http, { IncomingMessage, ServerResponse } from 'http';
import { CustomError, NotFound } from './errors';

import * as userController from './user.controller';

export const server = http.createServer(
  async (req: IncomingMessage, res: ServerResponse): Promise<void> => {
    try {
      console.log(req.method, req.url);
      if (req.url === '/api/users') {
        if (req.method === 'GET') {
          return userController.getAllUsers(req, res);
        } else if (req.method === 'POST') {
          return await userController.createUser(req, res);
        }
      }  else if (/\/api\/users\/\w/.test(req.url || '')) {
        if (req.method === 'GET') {
          return userController.getUserById(req, res);
        }
      }
      
      throw new NotFound('Not Found');
    } catch (e) {
      const error = e as CustomError;
      const statusCode = error.statusCode || 500;
      const message = error.statusCode
        ? error.message
        : 'Something terribly wrong has happened';

      if (!error.statusCode) {
        console.log(error);
      }
      userController.sendJson(res, { statusCode, data: { message } });
    }
  }
);
