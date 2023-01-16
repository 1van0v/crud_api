import * as dotenv from 'dotenv';
import { server } from './server';

dotenv.config();

const PORT = process.env.PORT;

server.listen(PORT, () => console.log('Server is listening on', PORT));
