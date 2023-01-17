import { v4 as uuid } from 'uuid';
import cluster from 'cluster';

import { CreateUser, UpdateUser, User, DbMessage } from './models';

let userStore: User[] = [];

if (process.env.CLUSTER_MODE) {
  console.log(cluster.worker?.id, 'subscribed to DB updates');
  process.on('message', (msg: DbMessage) => {
    if (msg.isDbUpdate) {
      console.log('worker', cluster.worker?.id, 'DB was updated by', msg.from);
      userStore = msg.data;
    }
  });
}

const updateStore = async (newStore: User[]): Promise<void> => {
  if (!cluster.isWorker) {
    return;
  }

  return new Promise((resolve, reject) => {
    const message = {
      isDbUpdate: true,
      data: newStore,
      from: cluster.worker?.id,
    };
    console.log('worker', cluster.worker?.id, 'updates db');

    cluster.worker?.send(message, (err) => {
      if (err) {
        return reject(err);
      }

      resolve();
    });
  });
};

export const getUsers = (): User[] => userStore;

export const addUser = async (userToCreate: CreateUser): Promise<User> => {
  const newUser = {
    ...userToCreate,
    id: uuid(),
  };
  userStore.push(newUser);

  await updateStore(userStore);

  return newUser;
};

export const find = (uuid: string): User | undefined => {
  return userStore.find((i) => i.id === uuid);
};

export const update = async (
  user: User,
  updates: UpdateUser
): Promise<User> => {
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

  await updateStore(userStore);

  return updatedUser;
};

export const deleteUser = async (user: User): Promise<void> => {
  userStore = userStore.filter((i) => i.id !== user.id);
  await updateStore(userStore);
};
