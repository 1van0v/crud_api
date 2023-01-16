import { v4 as uuid } from 'uuid';

import { User } from "./user.model";

const userStore: User[] = [];

export const getUsers = (): User[] => userStore;

export const addUser = (userToCreate: Omit<User, 'id'>) => {
  userStore.push({
    ...userToCreate,
    id: uuid()
  })
}