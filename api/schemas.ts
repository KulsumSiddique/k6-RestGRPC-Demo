import { z } from 'zod';

export const userSchema = z.object({
  id: z.number(),
  username: z.string(),
});

export const ratingSchema = z.object({
  id: z.number(),
  stars: z.number().int().min(1).max(5),
  pizza_id: z.number().int(),
});

export const ratingsResponseSchema = z.object({
  ratings: z.array(ratingSchema),
});

export type User = z.infer<typeof userSchema>;
export type Rating = z.infer<typeof ratingSchema>;
