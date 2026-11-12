// 독서 기록 글(src/content/posts/106/index.md)을 읽어 첫 화면의 독서 현황판 숫자를 만듭니다.
// 글의 형식만 지키면 책을 추가할 때마다 현황판이 자동으로 바뀝니다.
//   - 연도 줄:  2026  (또는 2006 ~ 2022)
//   - 구분 줄:  픽션 / 논픽션
//   - 책 한 줄: 제목 - 저자
//   - 완독하지 않은 책: 파란색 형광펜(<span style="background-color:#99cefa">…</span>)
export type Book = { title: string; author: string; finished: boolean };
export type YearStat = { label: string; fiction: Book[]; nonfiction: Book[] };

const HEADER_BG = ['#f6e199', '#f3c000', '#9feec3']; // 구분·연도 제목에 쓰는 형광펜 색
const strip = (s: string) =>
  s.replace(/<[^>]+>/g, '').replace(/\\([~\-*_.\[\]#+])/g, '$1').replace(/&nbsp;/g, ' ').replace(/&lt;/g, '<').replace(/&amp;/g, '&').replace(/\s+/g, ' ').trim();

export function parseReading(md = ''): YearStat[] {
  const years: YearStat[] = [];
  let cur: YearStat | null = null;
  let genre: 'fiction' | 'nonfiction' = 'fiction';
  let marked = false; // 여러 줄에 걸친 형광펜 안에 있는지
  for (const raw of md.split('\n')) {
    const opens = [...raw.matchAll(/<span style="[^"]*background-color:\s*(#[0-9a-fA-F]{3,8})[^"]*">/g)].filter((m) => !HEADER_BG.includes(m[1].toLowerCase()));
    const lineMarked = marked || opens.length > 0;
    const spanOpen = (raw.match(/<span\b/g) ?? []).length;
    const spanClose = (raw.match(/<\/span>/g) ?? []).length;
    if (opens.length > 0 && spanOpen > spanClose) marked = true;
    else if (marked && spanClose > spanOpen) marked = false;

    const text = strip(raw);
    if (!text || text === '더보기') continue;
    if (/^\d{4}(\s*~\s*\d{4})?$/.test(text)) { cur = { label: text, fiction: [], nonfiction: [] }; years.push(cur); genre = 'fiction'; continue; }
    const g = /^(논픽션|픽션)(\s*\(\d+\))?$/.exec(text);
    if (g) { genre = g[1] === '픽션' ? 'fiction' : 'nonfiction'; continue; }
    if (!cur) continue;
    const i = text.lastIndexOf(' - ');
    cur[genre].push({ title: (i > 0 ? text.slice(0, i) : text).trim(), author: i > 0 ? text.slice(i + 3).trim() : '', finished: !lineMarked });
  }
  return years;
}
