import { beforeEach, test } from "node:test";
import assert from "node:assert";
import { User } from "../../../shared/user";
import { buildApp } from "../src"
import { FastifyInstance } from "fastify";

let fastify: FastifyInstance;

beforeEach(async () => {
  fastify = await buildApp(':memory:', { disableRequestLogging: true });
  await testCreateUser({ name: 'first-test-user' } as User);
})

async function testCreateUser(user: User): Promise<number> {
  const response = await fastify.inject({
    url: '/new',
    method: 'POST',
    headers: {
      "content-type": 'application/json'
    },
    body: JSON.stringify({ user }),
  })

  assert.strictEqual(response.statusCode, 200);

  const json = await response.json();

  assert.ok(json.id);
  return response.json().id
}

async function testFetchUser(id: number): Promise<{ user: User }> {
  const response = await fastify.inject({
    method: 'get',
    url: `/${id}`
  })

  assert.strictEqual(response.statusCode, 200);
  const json = await response.json();
  assert.ok(json.user.id && json.user.name);
  return json;
}

test('create-user', async () => {
  await testCreateUser({ name: 'test-user' } as User);
})

test('fetch-user', async () => {
  const id = await testCreateUser({ name: 'fetch-test-user' } as User);
  const user = await testFetchUser(id);
})

test('fetch-all-users', async () => {
  const response = await fastify.inject({
    method: 'get',
    url: '/all',
  })

  assert.strictEqual(response.statusCode, 200);
  const json = await response.json();
  assert.ok(json.users && Array.isArray(json.users))
})

test('update-user-with-object', async () => {
  const id = await testCreateUser({ name: 'user-before-update' } as User);
  const updatedUser = { id, name: 'user-after-update' };
  const response = await fastify.inject({
    method: 'patch',
    url: '/update',
    headers: {
      "content-type": 'application/json',
    },
    body: JSON.stringify({ user: updatedUser })
  });
  assert.strictEqual(response.statusCode, 200);

  const userResponse = await testFetchUser(id);
  assert.strictEqual(userResponse.user.name, 'user-after-update');
})

test('update-user-with-id', async () => {
  const id = await testCreateUser({ name: 'user-before-update' } as User);
  const updatedUser = { id, name: 'user-after-update' };
  const response = await fastify.inject({
    method: 'patch',
    url: `/update/${id}`,
    headers: {
      "content-type": 'application/json',
    },
    body: JSON.stringify({ user: updatedUser })
  });
  assert.strictEqual(response.statusCode, 200);

  const userResponse = await testFetchUser(id);
  assert.strictEqual(userResponse.user.name, 'user-after-update');
})
