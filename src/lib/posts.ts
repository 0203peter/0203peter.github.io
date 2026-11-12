import { getCollection } from 'astro:content';

export async function getPosts() {
  const all = await getCollection('posts', ({ data }) => !data.draft);
  return all.sort((a, b) => b.data.date.getTime() - a.data.date.getTime());
}

const BASE = import.meta.env.BASE_URL.replace(/\/$/, '');
export const url = (path = '/') => `${BASE}${path.startsWith('/') ? path : '/' + path}`;
export const postUrl = (id: string) => url(`/posts/${id.split('/').map(encodeURIComponent).join('/')}/`);

const fmt = new Intl.DateTimeFormat('ko-KR', { timeZone: 'Asia/Seoul', year: 'numeric', month: '2-digit', day: '2-digit' });
export function ymd(d: Date) {
  const p = Object.fromEntries(fmt.formatToParts(d).map((x) => [x.type, x.value]));
  return { y: p.year, m: p.month, d: p.day, full: `${p.year}.${p.month}.${p.day}` };
}

export function plainText(md = '') {
  return md
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/!\[[^\]]*\]\([^)]*\)/g, ' ')
    .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1')
    .replace(/<[^>]+>/g, ' ')
    .replace(/[#>*_`~\\]/g, ' ')
    .replace(/&lt;/g, '<').replace(/&amp;/g, '&')
    .replace(/\s+/g, ' ')
    .trim();
}
