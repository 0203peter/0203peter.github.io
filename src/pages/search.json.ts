import type { APIRoute } from 'astro';
import { getPosts, plainText } from '../lib/posts';

export const GET: APIRoute = async () => {
  const posts = await getPosts();
  const index: Record<string, string> = {};
  for (const p of posts) index[p.id] = plainText(p.body).toLowerCase().slice(0, 6000);
  return new Response(JSON.stringify(index), { headers: { 'Content-Type': 'application/json; charset=utf-8' } });
};
