import { v4 as uuid } from 'uuid';

import { CreateUser, UpdateUser, User } from './user.model';

let userStore: User[] = [];

export const getUsers = (): User[] => userStore;

export const addUser = (userToCreate: CreateUser): User => {
  const newUser = {
    ...userToCreate,
    id: uuid(),
  };
  userStore.push(newUser);
  return newUser;
};

export const find = (uuid: string): User | undefined => {
  return userStore.find((i) => i.id === uuid);
};

export const update = (user: User, updates: UpdateUser): User => {
  const updatedUser: User = (Object.keys(user) as Array<keyof User>).reduce(
    (updated, prop) => {
      if (prop in updates && prop !== 'id' && updates[prop]) {
        Object.assign(updated, { [prop]: updates[prop] });
      }
      return updated;
    },
    { ...user } as User
  );

  userStore = userStore.map((i) => (i.id === updatedUser.id ? updatedUser : i));

  return updatedUser;
};
