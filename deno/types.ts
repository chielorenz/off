import { Endpoints, z } from "./deps.ts";

export const FacebookPost = z.object({
  id: z.string(),
  message: z.string().optional(),
  created_time: z.string().datetime({ offset: true }),
  type: z.enum(["link", "offer", "photo", "status", "video"]),
  full_picture: z.string().url().optional(),
  permalink_url: z.string().url(),
});

const providers = z.enum(["facebook", "github", "google"]);

export const Post = z.object({
  provider: providers,
  id: z.string(),
  type: z.string(),
  data: z.unknown(),
});

export const User = z.object({
  uuid: z.string().uuid(),
  auth: z.object({
    id: z.string(),
    provider: providers,
  }),
  follows: z.array(z.string()),
  posts: z.array(Post),
  providers: z.array(z.object({
    name: providers,
    accessToken: z.string(),
    lastFetch: z.string().datetime().nullable(),
  })),
});

export type GithubPost =
  Endpoints["GET /users/{username}/events"]["response"]["data"][0];
export type GithubUser = Endpoints["GET /user"]["response"]["data"];

export type User = z.infer<typeof User>;
export type FacebookPost = z.infer<typeof FacebookPost>;
export type Post = z.infer<typeof Post>;
