import type { APIRequestContext } from '@playwright/test';
import { userSchema, type User } from './schemas';

export class UsersApi {
  constructor(private readonly request: APIRequestContext) {}

  async create(username: string, password: string): Promise<User> {
    const response = await this.request.post('/api/users', { data: { username, password } });
    const body = await response.text();
    if (response.status() !== 201) throw new Error(`Create user failed (${response.status()}): ${body}`);
    return userSchema.parse(JSON.parse(body));
  }
}
