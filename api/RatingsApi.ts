import type { APIRequestContext } from '@playwright/test';
import { ratingSchema, ratingsResponseSchema, type Rating } from './schemas';

export class RatingsApi {
  constructor(private readonly request: APIRequestContext) {}

  async list(): Promise<Rating[]> {
    const response = await this.request.get('/api/ratings');
    return ratingsResponseSchema.parse(await response.json()).ratings;
  }

  async get(id: number): Promise<Rating> {
    const response = await this.request.get(`/api/ratings/${id}`);
    return ratingSchema.parse(await response.json());
  }

  async create(stars: number, pizzaId: number): Promise<Rating> {
    const response = await this.request.post('/api/ratings', { data: { stars, pizza_id: pizzaId } });
    if (response.status() !== 201)
      throw new Error(`Create rating failed (${response.status()}): ${await response.text()}`);
    return ratingSchema.parse(await response.json());
  }

  async update(id: number, stars: number, pizzaId: number): Promise<Rating> {
    const response = await this.request.put(`/api/ratings/${id}`, { data: { stars, pizza_id: pizzaId } });
    if (response.status() !== 200)
      throw new Error(`Update rating failed (${response.status()}): ${await response.text()}`);
    return ratingSchema.parse(await response.json());
  }

  async delete(id: number): Promise<void> {
    const response = await this.request.delete(`/api/ratings/${id}`);
    if (response.status() !== 204)
      throw new Error(`Delete rating failed (${response.status()}): ${await response.text()}`);
  }
}
