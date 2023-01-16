import { User } from "./user.model";

export interface DbMessage {
  isDbUpdate: true;
  data: User[];
  from?: number;
  to?: number;
}