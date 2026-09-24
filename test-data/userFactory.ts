import { randomUUID } from 'node:crypto';
import type { APIRequestContext } from '@playwright/test';
import { UsersApi } from '../api/UsersApi';
import type { User } from '../api/schemas';

export type DisposableUser = User & { password: string };

export async function createDisposableUser(request: APIRequestContext): Promise<DisposableUser> {
  const username = `pw-${randomUUID().slice(0, 20)}`;
  const password = randomUUID();
  const user = await new UsersApi(request).create(username, password);
  return { ...user, password };
}
