import os from 'os';
import request from 'supertest';
import dotenv from 'dotenv';
import { CreateUser, UpdateUser, User } from '../../src/models';

dotenv.config();

const getHost = (index?: number): string => {
  let basePort = +(process.env.PORT as any);

  if (index) {
    basePort = basePort + index;
  }

  return 'http://localhost:' + basePort;
};

describe('Basic CRUD with cluster', () => {
  describe('GET /api/users to load balancer', () => {
    it('return 200 and empty array', async () => {
      const res = await request(getHost()).get('/api/users');

      expect(res.statusCode).toBe(200);
      expect(res.body).toEqual([]);
    });
  });

  let createdUser: User;

  describe('POST /api/users', () => {
    const createUser: CreateUser = {
      username: 'test cluster user',
      age: 82,
      hobbies: ['clustering'],
    };

    it('returns 201 and created user', async () => {
      const res = await request(getHost()).post('/api/users').send(createUser);

      expect(res.statusCode).toBe(201);
      expect(res.body.id).toBeTruthy();
      expect(res.body.username).toBe(createUser.username);
      expect(res.body.age).toBe(createUser.age);
      expect(res.body.hobbies).toEqual(createUser.hobbies);

      createdUser = res.body;
    });

    it('returns the same user for all workers', async () => {
      const requests = os
        .cpus()
        .map((i, index) => request(getHost(index + 1)).get('/api/users'));
      const responses = await Promise.all(requests);

      responses.every((i) => expect(i.body).toEqual([createdUser]));
    });
  });

  describe('PUT /api/users/{id}', () => {
    let updatedUser: User;
    it('returns 200 and an updated user from worker', async () => {
      const updates: UpdateUser = {
        username: 'updated name',
        age: 21,
        hobbies: ['swimming'],
      };
      const res = await request(getHost(1))
        .put('/api/users/' + createdUser.id)
        .send(updates);
      const { id, ...savedUpdates } = (updatedUser = res.body);

      expect(res.statusCode).toBe(200);
      expect(savedUpdates).toEqual(updates);
    });

    it('returns the same updated user from other worker', async () => {
      const index = os.cpus().length > 1 ? 2 : 0;
      const res = await request(getHost(index)).get(
        '/api/users/' + updatedUser.id
      );

      expect(res.body).toEqual(updatedUser);
    });
  });

  describe('DETEL /api/users/{id}', () => {
    it('returns 204 and removes the user from the list', async () => {
      const res = await request(getHost()).delete(
        '/api/users/' + createdUser.id
      );

      expect(res.statusCode).toBe(204);

      const usersRes = await request(getHost()).get('/api/users');

      expect(usersRes.body).toEqual([]);
    });

    it('returns empty list for all workers', async () => {
      const requests = os
        .cpus()
        .map((i, index) => request(getHost(index + 1)).get('/api/users'));
      const responses = await Promise.all(requests);

      responses.every((i) => expect(i.body).toEqual([]));
    });
  });
});
