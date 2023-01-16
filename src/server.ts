import http, { IncomingMessage, ServerResponse } from 'http';

import * as userController from './user.controller';

export const server = http.createServer((req: IncomingMessage, res: ServerResponse): void => {

  console.log(req.method, req.url)
  if (req.method === 'GET' && req.url === '/api/users') {
    return userController.getAllUsers(req, res);
  }

  res.end('not found');
});

