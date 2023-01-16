import * as dotenv from 'dotenv';
import { startServer } from './server';

dotenv.config();

const port = process.env.PORT || 3000;

startServer(+port);
