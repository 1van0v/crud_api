import cluster, { Worker } from 'cluster';

import { DbMessage } from './models';
import { cpus, getMaster, getWorker } from './worker';

export const startCluster = () => {
  if (cluster.isPrimary) {
    const basePort = +(process.env.PORT as string);

    console.log(`Forking for ${cpus} CPUs`);
    for (let i = 1; i <= cpus; i++) {
      cluster.fork({ PORT: basePort + i, CLUSTER_MODE: true });
    }

    for (const i in cluster.workers) {
      cluster.workers[i]?.on('message', (msg: DbMessage) => {
        if (msg.isDbUpdate) {
          const workers = cluster.workers as any;

          Object.values(workers as Worker[]).forEach((worker: Worker): void => {
            if (worker.id !== msg.from) {
              worker.send({ ...msg, to: worker.id });
            }
          });
        }
      });
    }
    return getMaster();
  } else {
    return getWorker();
  }
};
