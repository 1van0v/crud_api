import { v4 as uuid } from 'uuid';

import { CreateUser, User } from "./user.model";

const userStore: User[] = [];

export const getUsers = (): User[] => userStore;

export const addUser = (userToCreate: CreateUser): User => {
  const newUser = {
    ...userToCreate,
    id: uuid()
  };
  userStore.push(newUser);
  return newUser;
}

export const find = (uuid: string): User | undefined => {
  return userStore.find(i => i.id === uuid);
}