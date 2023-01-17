import cluster from 'cluster';
import os from 'os';
import http, { IncomingMessage, ServerResponse } from 'http';
import * as dotenv from 'dotenv';

import { startServer } from './server';

export const cpus = os.cpus().length;
let nextWorkerId = 1;

const proxy = async (
  req: IncomingMessage,
  res: ServerResponse
): Promise<void> => {
  const { host, ...headersToForward } = req.headers;
  const url = new URL(req.url as string, `http://${host}`);
  url.port = (+url.port + nextWorkerId++).toString();

  if (nextWorkerId > cpus) {
    nextWorkerId = 1;
  }

  const clientReq = http.request(
    url.toString(),
    { headers: headersToForward, method: req.method },
    (clientRes: IncomingMessage) => {
      res.writeHead(clientRes.statusCode as number, clientRes.headers);

      clientRes.pipe(res);
    }
  );

  req.pipe(clientReq);
};

if (cluster.isPrimary) {
  dotenv.config();
}

export const getMaster = () => {
  console.log('getting Master');
  if (cluster.isWorker) {
    return;
  }

  return http.createServer(proxy);
};
export const getWorker = () => {
  console.log('getting worker');
  if (cluster.isPrimary) {
    return;
  }
  return startServer(process.env.PORT as any);
};
