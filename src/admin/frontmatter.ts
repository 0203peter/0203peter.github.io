// 글 파일 맨 위의 글 정보(--- 사이 부분)를 읽고 씁니다.
export type Meta = { title: string; date: string; category: string; tags: string[]; draft: boolean; extra: string[] };

const unquote = (v: string) => {
  v = v.trim();
  if (v.startsWith('"')) { try { return String(JSON.parse(v)); } catch { /* 아래로 */ } }
  if (v.length >= 2 && v.startsWith("'") && v.endsWith("'")) return v.slice(1, -1).replace(/''/g, "'");
  return v;
};

export function parsePost(text: string): { meta: Meta; body: string } {
  const meta: Meta = { title: '', date: '', category: '', tags: [], draft: false, extra: [] };
  text = text.replace(/^﻿/, '').replace(/\r\n/g, '\n');
  const m = /^---\n([\s\S]*?)\n---[ \t]*(?:\n|$)/.exec(text);
  if (!m) return { meta, body: text };
  const lines = m[1].split('\n');
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const kv = /^([A-Za-z_][\w-]*):\s*(.*)$/.exec(line);
    if (!kv) { if (line.trim()) meta.extra.push(line); continue; }
    const [, key, val] = kv;
    if (key === 'title') meta.title = unquote(val);
    else if (key === 'date') meta.date = unquote(val);
    else if (key === 'category') meta.category = unquote(val);
    else if (key === 'draft') meta.draft = val.trim() === 'true';
    else if (key === 'tags') {
      const v = val.trim();
      if (v.startsWith('[')) {
        try { meta.tags = (JSON.parse(v) as unknown[]).map(String); }
        catch { meta.tags = v.slice(1, -1).split(',').map(unquote).filter(Boolean); }
      } else if (!v) {
        while (i + 1 < lines.length && /^\s*-\s+/.test(lines[i + 1])) meta.tags.push(unquote(lines[++i].replace(/^\s*-\s+/, '')));
      } else meta.tags = [unquote(v)];
    } else {
      meta.extra.push(line);
      while (i + 1 < lines.length && /^\s+\S/.test(lines[i + 1])) meta.extra.push(lines[++i]);
    }
  }
  return { meta, body: text.slice(m[0].length).replace(/^\n+/, '') };
}

export function serializePost(meta: Meta, body: string): string {
  const out = ['---', `title: ${JSON.stringify(meta.title)}`, `date: ${meta.date}`];
  if (meta.category) out.push(`category: ${JSON.stringify(meta.category)}`);
  if (meta.tags.length) out.push(`tags: ${JSON.stringify(meta.tags)}`);
  if (meta.draft) out.push('draft: true');
  out.push(...meta.extra, '---', '');
  return out.join('\n') + '\n' + body.replace(/\r\n/g, '\n').replace(/\s+$/, '') + '\n';
}

/** 한국 시간 기준 현재 시각 (예: 2026-11-16T22:30:00+09:00) */
export function nowKST(d = new Date()): string {
  const k = new Date(d.getTime() + 9 * 3600_000).toISOString();
  return `${k.slice(0, 19)}+09:00`;
}

export function splitTags(s: string): string[] {
  return [...new Set(s.split(/[,#\n]/).map((t) => t.trim()).filter(Boolean))];
}

export function slugError(slug: string, existing: Set<string>): string | null {
  if (!/^[a-z0-9][a-z0-9-]{0,79}$/.test(slug)) return '주소는 영문 소문자, 숫자, 하이픈(-)만 쓸 수 있습니다.';
  if (existing.has(slug)) return '이미 같은 주소의 글이 있습니다.';
  return null;
}

/** 사진 파일 이름을 주소에 쓰기 안전한 이름으로 바꿉니다. */
export function safeImageName(name: string, taken: Set<string>): string {
  const dot = name.lastIndexOf('.');
  const ext = (dot > 0 ? name.slice(dot + 1) : 'jpg').toLowerCase().replace(/[^a-z0-9]/g, '') || 'jpg';
  let base = (dot > 0 ? name.slice(0, dot) : name).toLowerCase().replace(/[^a-z0-9-_]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 40) || 'photo';
  let out = `${base}.${ext}`;
  for (let n = 2; taken.has(out); n++) out = `${base}-${n}.${ext}`;
  return out;
}
