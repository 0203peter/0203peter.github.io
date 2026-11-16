// 독서 기록 글(src/content/posts/106/index.md)을 읽어 독서 현황판 숫자를 만들고,
// 글 페이지에서 색·형광펜·권수를 자동으로 입힙니다.
//
// 글은 이렇게만 쓰면 됩니다.
//   ## 2026                      ← 연도 (또는 "2006 ~ 2022")
//   ### 픽션                     ← 구분: 픽션 / 논픽션
//   - 제목 - 저자                ← 책 한 권
//   - (미완독) 제목 - 저자       ← 완독하지 않은 책. "(읽는 중)"도 같은 뜻으로 인식합니다.
export type Book = { title: string; author: string; finished: boolean };
export type YearStat = { label: string; fiction: Book[]; nonfiction: Book[] };

const YEAR = /^\d{4}(\s*~\s*\d{4})?$/;
const GENRE = /^(논픽션|픽션)(\s*\(\d+\))?$/;
const UNFINISHED = /^\((미완독|읽는 중)\)\s*/;
const OLD_HEADER_BG = ['#f6e199', '#f3c000', '#9feec3']; // 예전 표기에서 제목에 쓰던 형광펜 색
const strip = (s: string) =>
  s.replace(/<[^>]+>/g, '').replace(/\[([^\]]*)\]\([^)]*\)/g, '$1').replace(/\\([~\-*_.\[\]#+()])/g, '$1')
    .replace(/&nbsp;/g, ' ').replace(/&lt;/g, '<').replace(/&amp;/g, '&').replace(/\s+/g, ' ').trim();

export function parseReading(md = ''): YearStat[] {
  const years: YearStat[] = [];
  let cur: YearStat | null = null;
  let genre: 'fiction' | 'nonfiction' = 'fiction';
  let marked = false; // (예전 표기) 여러 줄에 걸친 형광펜 안에 있는지
  for (const raw of md.split('\n')) {
    const opens = [...raw.matchAll(/<span style="[^"]*background-color:\s*(#[0-9a-fA-F]{3,8})[^"]*">/g)].filter((m) => !OLD_HEADER_BG.includes(m[1].toLowerCase()));
    let unfinished = marked || opens.length > 0;
    const spanOpen = (raw.match(/<span\b/g) ?? []).length;
    const spanClose = (raw.match(/<\/span>/g) ?? []).length;
    if (opens.length > 0 && spanOpen > spanClose) marked = true;
    else if (marked && spanClose > spanOpen) marked = false;

    let text = strip(raw).replace(/^#{1,6}\s+/, '').replace(/^[-*+]\s+/, '');
    if (!text || text === '더보기') continue;
    if (YEAR.test(text)) { cur = { label: text, fiction: [], nonfiction: [] }; years.push(cur); genre = 'fiction'; continue; }
    const g = GENRE.exec(text);
    if (g) { genre = g[1] === '픽션' ? 'fiction' : 'nonfiction'; continue; }
    if (!cur) continue;
    if (UNFINISHED.test(text)) { unfinished = true; text = text.replace(UNFINISHED, ''); }
    const i = text.lastIndexOf(' - ');
    cur[genre].push({ title: (i > 0 ? text.slice(0, i) : text).trim(), author: i > 0 ? text.slice(i + 3).trim() : '', finished: !unfinished });
  }
  return years;
}

/**
 * 마크다운이 HTML로 바뀐 뒤에 독서 기록용 꾸밈을 입힙니다.
 *  - (미완독)/(읽는 중)으로 시작하는 책 → 파란 형광펜
 *  - 픽션/논픽션 제목 옆에 권수
 *  - 가장 최근 연도를 뺀 나머지 연도는 접어 두기
 */
export function enhanceReadingHtml(html: string): string {
  const text = (s: string) => s.replace(/<[^>]+>/g, '').replace(/&nbsp;/g, ' ').trim();
  html = html.replace(/<li>(\s*(?:<p>)?)\((?:미완독|읽는 중)\)\s*([\s\S]*?)((?:<\/p>)?\s*)<\/li>/g, '<li class="unfinished">$1<mark>$2</mark>$3</li>');
  // 구분 제목(h3) 옆에 권수 붙이기
  html = html.replace(/(<h3[^>]*>)([\s\S]*?)(<\/h3>)([\s\S]*?)(?=<h[23][\s>]|$)/g, (all, open, inner, close, rest) => {
    const g = GENRE.exec(text(inner));
    if (!g) return all;
    const n = (rest.match(/<li[\s>]/g) ?? []).length;
    return `${open}${g[1]} <span class="count">${n}</span>${close}${rest}`;
  });
  // 연도별로 나눠, 마지막 연도만 펼쳐 두기
  const parts = html.split(/(?=<h2[\s>])/);
  const isYear = (p: string) => { const m = /^<h2[^>]*>([\s\S]*?)<\/h2>/.exec(p); return !!m && YEAR.test(text(m[1])); };
  const lastYear = parts.map(isYear).lastIndexOf(true);
  return parts.map((p, i) => {
    if (!isYear(p) || i === lastYear) return p;
    const m = /^(<h2[^>]*>[\s\S]*?<\/h2>)([\s\S]*)$/.exec(p)!;
    const n = (m[2].match(/<li[\s>]/g) ?? []).length;
    return `${m[1]}<details><summary>${n}권 보기</summary>${m[2]}</details>`;
  }).join('');
}
