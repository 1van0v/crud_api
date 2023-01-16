import request from 'supertest';
import { v4 as uuid } from 'uuid';

import { CreateUser, UpdateUser, User } from '../src/models';

import { server } from '../src/server';

describe('Basic CRUD', () => {
  const createUser: CreateUser = {
    username: 'test user',
    age: 12,
    hobbies: ['running'],
  };
  let createdUser: User;

  describe('GET /api/users', () => {
    it('returns 200 and empty list of users', async () => {
      const res = await request(server).get('/api/users');

      expect(res.statusCode).toBe(200);
      expect(res.body).toEqual([]);
    });
  });

  describe('POST /api/users', () => {
    it('returns 201 and created user', async () => {
      const res = await request(server).post('/api/users').send(createUser);

      expect(res.statusCode).toBe(201);
      expect(res.body.id).toBeTruthy();
      expect(res.body.username).toBe(createUser.username);
      expect(res.body.age).toBe(createUser.age);
      expect(res.body.hobbies).toEqual(createUser.hobbies);

      createdUser = res.body;
    });
  });

  describe('GET /api/users after POST', () => {
    it('returns 200 and list of previously created users', async () => {
      const res = await request(server).get('/api/users');

      expect(res.statusCode).toBe(200);
      expect(res.body).toEqual([createdUser]);
    });
  });

  describe('GET /api/users/{id}', () => {
    it('returns 200 and created user', async () => {
      const res = await request(server).get('/api/users/' + createdUser.id);

      expect(res.statusCode).toBe(200);
      expect(res.body).toEqual(createdUser);
    });
  });

  describe('PUT /api/users/{id}', () => {
    it('returns 200 and an updated user', async () => {
      const updates: UpdateUser = {
        username: 'updated name',
        age: 21,
        hobbies: ['swimming'],
      };
      const res = await request(server)
        .put('/api/users/' + createdUser.id)
        .send(updates);
      const { id, ...savedUpdates } = res.body;

      expect(res.statusCode).toBe(200);
      expect(savedUpdates).toEqual(updates);
    });
  });

  describe('DELETE /api/users/{id}', () => {
    it('returns 204 and removes the user from the list', async () => {
      const res = await request(server).delete('/api/users/' + createdUser.id);

      expect(res.statusCode).toBe(204);

      const usersRes = await request(server).get('/api/users');

      expect(usersRes.body).toEqual([]);
    });
  });
});

describe('Validation', () => {
  describe('GET /api/users/{id}', () => {
    it('returns 400 id is not valid uuid', async () => {
      const res = await request(server).get('/api/users/bla-bla');

      expect(res.statusCode).toEqual(400);
    });
  });

  describe('PUT /api/users/{id}', () => {
    it('returns 400 id is not valid uuid', async () => {
      const res = await request(server)
        .put('/api/users/bla-bla')
        .send({ username: 'invalid' });

      expect(res.statusCode).toEqual(400);
    });
  });

  describe('DELETE /api/users/{id}', () => {
    it('returns 400 id is not valid uuid', async () => {
      const res = await request(server).delete('/api/users/bla-bla');

      expect(res.statusCode).toEqual(400);
    });
  });

  describe('unsupported path', () => {
    it('returns 404 for unsupported path', async () => {
      const res = await request(server).get('/api/super-users');

      expect(res.statusCode).toBe(404);
    });
  });

  describe('Action with nonexisting id', () => {
    describe('GET /api/users/{nonexistingId}', () => {
      it('returns 404 for nonexisting ID', async () => {
        const res = await request(server).get('/api/super-users/' + uuid());

        expect(res.statusCode).toBe(404);
      });
    });

    describe('PUT /api/users/{nonexistingId}', () => {
      it('returns 404 for nonexisting ID', async () => {
        const res = await request(server)
          .put('/api/super-users/' + uuid())
          .send({});

        expect(res.statusCode).toBe(404);
      });
    });

    describe('DELETE /api/users/{nonexistingId}', () => {
      it('returns 404 for nonexisting ID', async () => {
        const res = await request(server).delete('/api/super-users/' + uuid());

        expect(res.statusCode).toBe(404);
      });
    });
  });
});
