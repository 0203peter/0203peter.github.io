// 글쓰기 페이지의 글 목록에 쓰는 정보(숨긴 글 포함)
import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';

export const GET: APIRoute = async () => {
  const all = await getCollection('posts');
  const out: Record<string, { title: string; date: string; category: string; draft: boolean }> = {};
  for (const p of all) out[p.id] = { title: p.data.title, date: p.data.date.toISOString(), category: p.data.category, draft: p.data.draft };
  return new Response(JSON.stringify(out), { headers: { 'Content-Type': 'application/json; charset=utf-8' } });
};
