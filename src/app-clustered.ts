import { startCluster } from './cluster';

const port = process.env.PORT;

startCluster()?.listen(port, () => console.log('Load Balancer is running on', port));
