// 글쓰기 페이지의 화면 동작입니다.
import { decryptToken, encryptToken, isKeyFile, type KeyFile } from './crypto';
import { nowKST, parsePost, safeImageName, serializePost, slugError, splitTags, type Meta } from './frontmatter';
import { GitHub, GitHubError, filesOfPost, newPostDir, postFiles, type Change } from './github';
import { marked } from 'marked';
import { enhanceReadingHtml } from '../lib/reading';

const root = document.getElementById('admin')!;
const REPO = root.dataset.repo!;
const BRANCH = root.dataset.branch!;
const BASE = root.dataset.base!.replace(/\/$/, '');
const READING_ID = root.dataset.reading ?? '';
const KEY_PATH = 'public/admin-key.json';
const LS_KEY = 'admin-key';
const SS_TOKEN = 'admin-token';
const SS_RECENT = 'admin-recent';
const MIN_PASSWORD = 10;

type Info = { title: string; date: string; category: string; draft?: boolean };
type Pending = { name: string; base64: string; size: number };

const $ = <T extends HTMLElement = HTMLElement>(id: string) => document.getElementById(id) as T;
const esc = (s: string) => s.replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]!);
function show(view: 'loading' | 'login' | 'setup' | 'list' | 'edit') {
  for (const el of root.querySelectorAll<HTMLElement>('[data-view]')) el.hidden = el.dataset.view !== view;
  window.scrollTo(0, 0);
}
function say(id: string, text: string, kind: 'ok' | 'err' | '' = '') {
  const el = $(id);
  el.textContent = text;
  el.dataset.kind = kind;
  el.hidden = !text;
}
const errText = (e: unknown) => (e instanceof GitHubError ? e.message : '문제가 생겼습니다. 잠시 뒤 다시 시도해 주세요.');
async function busy<T>(btn: HTMLButtonElement, label: string, fn: () => Promise<T>): Promise<T> {
  const old = btn.textContent;
  btn.disabled = true;
  btn.textContent = label;
  try { return await fn(); } finally { btn.disabled = false; btn.textContent = old; }
}

let gh: GitHub | null = null;
let paths: string[] = [];
let posts = new Map<string, string>(); // id → 파일 경로
let built: Record<string, Info> = {};  // 사이트에 이미 반영된 글 정보
let editing: { id: string; file: string; isNew: boolean; meta: Meta; original: string } | null = null;
let pending: Pending[] = [];

const recent = (): Record<string, Info> => { try { return JSON.parse(sessionStorage.getItem(SS_RECENT) ?? '{}'); } catch { return {}; } };
const remember = (id: string, info: Info | null) => {
  const r = recent();
  if (info) r[id] = info; else delete r[id];
  sessionStorage.setItem(SS_RECENT, JSON.stringify(r));
};

// ── 로그인 ────────────────────────────────────────────────
async function findKeyFile(): Promise<KeyFile | null> {
  try { const k = JSON.parse(localStorage.getItem(LS_KEY) ?? 'null'); if (isKeyFile(k)) return k; } catch { /* 없음 */ }
  try {
    const r = await fetch(`${BASE}/admin-key.json`, { cache: 'no-store' });
    if (r.ok) { const k = await r.json(); if (isKeyFile(k)) return k; }
  } catch { /* 없음 */ }
  try { const k = JSON.parse(await new GitHub(REPO, BRANCH, null).readText(KEY_PATH)); if (isKeyFile(k)) return k; } catch { /* 없음 */ }
  return null;
}

async function start() {
  show('loading');
  const token = sessionStorage.getItem(SS_TOKEN);
  if (token) { gh = new GitHub(REPO, BRANCH, token); return openList(); }
  const key = await findKeyFile();
  if (!key) return show('setup');
  show('login');
  $<HTMLInputElement>('login-password').focus();
  $<HTMLFormElement>('login-form').onsubmit = async (e) => {
    e.preventDefault();
    const btn = $<HTMLButtonElement>('login-submit');
    await busy(btn, '확인 중…', async () => {
      const t = await decryptToken(key, $<HTMLInputElement>('login-password').value);
      if (!t) return say('login-msg', '비밀번호가 틀렸습니다.', 'err');
      localStorage.setItem(LS_KEY, JSON.stringify(key));
      sessionStorage.setItem(SS_TOKEN, t);
      $<HTMLInputElement>('login-password').value = '';
      gh = new GitHub(REPO, BRANCH, t);
      await openList();
    });
  };
}

$<HTMLFormElement>('setup-form').onsubmit = async (e) => {
  e.preventDefault();
  const token = $<HTMLInputElement>('setup-token').value.trim();
  const pw = $<HTMLInputElement>('setup-password').value;
  if (!token) return say('setup-msg', 'GitHub 토큰을 붙여 넣어 주세요.', 'err');
  if (pw.length < MIN_PASSWORD) return say('setup-msg', `비밀번호는 ${MIN_PASSWORD}자 이상으로 정해 주세요.`, 'err');
  if (pw !== $<HTMLInputElement>('setup-password2').value) return say('setup-msg', '비밀번호 두 칸이 서로 다릅니다.', 'err');
  await busy($<HTMLButtonElement>('setup-submit'), '확인 중…', async () => {
    try {
      const candidate = new GitHub(REPO, BRANCH, token);
      if (!(await candidate.canPush())) return say('setup-msg', '이 토큰으로는 저장소에 쓸 수 없습니다. Contents 권한을 Read and write로 설정했는지 확인해 주세요.', 'err');
      const key = await encryptToken(token, pw);
      if ($<HTMLInputElement>('setup-share').checked) await candidate.commit([{ path: KEY_PATH, text: JSON.stringify(key) + '\n' }], '글쓰기 페이지 로그인 설정');
      localStorage.setItem(LS_KEY, JSON.stringify(key));
      sessionStorage.setItem(SS_TOKEN, token);
      for (const id of ['setup-token', 'setup-password', 'setup-password2']) $<HTMLInputElement>(id).value = '';
      gh = candidate;
      await openList('설정을 마쳤습니다. 다음부터는 비밀번호만 입력하면 됩니다.');
    } catch (err) { say('setup-msg', errText(err), 'err'); }
  });
};
for (const id of ['go-setup', 'go-setup2']) $(id).onclick = () => { say('setup-msg', ''); show('setup'); };
$('setup-cancel').onclick = () => start();
$('logout').onclick = () => { sessionStorage.removeItem(SS_TOKEN); gh = null; start(); };

// ── 글 목록 ───────────────────────────────────────────────
async function openList(message = '') {
  show('list');
  say('list-msg', message, message ? 'ok' : '');
  $('list').innerHTML = '<p class="hint">불러오는 중…</p>';
  try {
    const [p, b] = await Promise.all([gh!.listPaths(), fetch(`${BASE}/admin/posts.json`, { cache: 'no-store' }).then((r) => (r.ok ? r.json() : {})).catch(() => ({}))]);
    paths = p; posts = postFiles(p); built = b;
    for (const [id, r] of Object.entries(recent())) if (built[id] && built[id].title === r.title && !!built[id].draft === !!r.draft) remember(id, null); // 반영이 끝난 글
    drawList();
  } catch (err) {
    if (err instanceof GitHubError && err.status === 401) sessionStorage.removeItem(SS_TOKEN);
    $('list').innerHTML = '';
    say('list-msg', errText(err), 'err');
  }
}
const infoOf = (id: string): Info & { waiting: boolean } => {
  const r = recent()[id];
  if (r) return { ...r, waiting: true };
  return built[id] ? { ...built[id], waiting: false } : { title: id, date: '', category: '', waiting: true };
};
function drawList() {
  const q = $<HTMLInputElement>('list-q').value.trim().toLowerCase();
  const rows = [...posts.keys()].map((id) => ({ id, ...infoOf(id) }))
    .filter((r) => !q || (r.title + ' ' + r.category + ' ' + r.id).toLowerCase().includes(q))
    .sort((a, b) => (b.date || '9999').localeCompare(a.date || '9999'));
  $('list-count').textContent = `${rows.length}개`;
  $('list').innerHTML = rows.length ? rows.map((r) => `
    <div class="item" data-id="${esc(r.id)}">
      <div class="item-main">
        <span class="item-title">${esc(r.title)}</span>
        <span class="item-meta">${esc([r.date.slice(0, 10), r.category, r.draft ? '숨김' : '', r.waiting ? '반영 중' : ''].filter(Boolean).join(' · '))}</span>
      </div>
      <button type="button" data-act="edit">수정</button>
      <button type="button" data-act="delete" class="danger">삭제</button>
    </div>`).join('') : '<p class="hint">글이 없습니다.</p>';
}
$<HTMLInputElement>('list-q').oninput = drawList;
$('list').onclick = async (e) => {
  const btn = (e.target as HTMLElement).closest<HTMLButtonElement>('button[data-act]');
  if (!btn) return;
  const id = btn.closest<HTMLElement>('.item')!.dataset.id!;
  if (btn.dataset.act === 'edit') return openEditor(id);
  if (btn.dataset.armed !== '1') { // 한 번 더 눌러야 삭제
    btn.dataset.armed = '1'; btn.textContent = '정말 삭제';
    setTimeout(() => { if (btn.isConnected) { btn.dataset.armed = ''; btn.textContent = '삭제'; } }, 4000);
    return;
  }
  const title = infoOf(id).title;
  await busy(btn, '삭제 중…', async () => {
    try {
      const fresh = await gh!.listPaths();
      const file = postFiles(fresh).get(id);
      if (file) await gh!.commit(filesOfPost(fresh, id, file).map((path) => ({ path, remove: true as const })), `글 삭제: ${title}`);
      remember(id, null);
      await openList(`"${title}" 글을 삭제했습니다. 1~2분 뒤 사이트에서 사라집니다.`);
    } catch (err) { say('list-msg', errText(err), 'err'); }
  });
};
$('new-post').onclick = () => openEditor(null);

// ── 글 작성·수정 ──────────────────────────────────────────
const f = {
  title: () => $<HTMLInputElement>('f-title'), slug: () => $<HTMLInputElement>('f-slug'), category: () => $<HTMLInputElement>('f-category'),
  tags: () => $<HTMLInputElement>('f-tags'), date: () => $<HTMLInputElement>('f-date'), draft: () => $<HTMLInputElement>('f-draft'), body: () => $<HTMLTextAreaElement>('f-body'),
};
async function openEditor(id: string | null) {
  say('edit-msg', '');
  pending = []; drawPending();
  const cats = [...new Set([...Object.values(built), ...Object.values(recent())].map((i) => i.category).filter(Boolean))].sort();
  $('cat-list').innerHTML = cats.map((c) => `<option value="${esc(c)}"></option>`).join('');
  if (id === null) {
    const d = nowKST();
    editing = { id: '', file: '', isNew: true, original: '', meta: { title: '', date: d, category: '', tags: [], draft: false, extra: [] } };
    f.title().value = ''; f.category().value = ''; f.tags().value = ''; f.body().value = ''; f.draft().checked = false;
    f.date().value = d; f.slug().value = d.slice(0, 16).replace(/[-:]/g, '').replace('T', '-');
    $('slug-row').hidden = false; $('photo-row').hidden = false;
    $('edit-heading').textContent = '새 글';
    $('tb-unfinished').hidden = true; setTab('write');
    show('edit'); f.title().focus();
    return;
  }
  show('loading');
  try {
    const file = posts.get(id)!;
    const original = await gh!.readText(file);
    const { meta, body } = parsePost(original);
    editing = { id, file, isNew: false, meta, original };
    f.title().value = meta.title; f.category().value = meta.category; f.tags().value = meta.tags.join(', ');
    f.date().value = meta.date; f.draft().checked = meta.draft; f.body().value = body;
    $('slug-row').hidden = true; $('photo-row').hidden = !file.endsWith('/index.md');
    $('edit-heading').textContent = '글 수정';
    $('tb-unfinished').hidden = id !== READING_ID; setTab('write');
    show('edit');
  } catch (err) { await openList(); say('list-msg', errText(err), 'err'); }
}
$('edit-cancel').onclick = () => openList();

function drawPending() {
  $('pending').innerHTML = pending.map((p) => `<li>${esc(p.name)} <span>${Math.round(p.size / 1024)}KB</span></li>`).join('');
}
function insertAtCursor(text: string) {
  const ta = f.body();
  const at = ta.selectionStart ?? ta.value.length;
  const before = ta.value.slice(0, at), after = ta.value.slice(ta.selectionEnd ?? at);
  const pad = before && !before.endsWith('\n\n') ? (before.endsWith('\n') ? '\n' : '\n\n') : '';
  ta.value = before + pad + text + '\n\n' + after.replace(/^\n+/, '');
  ta.selectionStart = ta.selectionEnd = (before + pad + text + '\n\n').length;
}
/** 사진을 긴 변 2000px 이하 JPEG로 다시 저장합니다(용량 축소, 촬영 위치 정보 제거). PNG·GIF 등은 그대로 둡니다. */
async function prepareImage(file: File): Promise<{ name: string; blob: Blob }> {
  if (file.type !== 'image/jpeg') return { name: file.name, blob: file };
  const bmp = await createImageBitmap(file, { imageOrientation: 'from-image' });
  const scale = Math.min(1, 2000 / Math.max(bmp.width, bmp.height));
  const c = document.createElement('canvas');
  c.width = Math.round(bmp.width * scale); c.height = Math.round(bmp.height * scale);
  c.getContext('2d')!.drawImage(bmp, 0, 0, c.width, c.height);
  const blob = await new Promise<Blob | null>((ok) => c.toBlob(ok, 'image/jpeg', 0.85));
  return { name: file.name, blob: blob ?? file };
}
const toBase64 = (blob: Blob) => new Promise<string>((ok, no) => {
  const r = new FileReader();
  r.onload = () => ok(String(r.result).split(',')[1] ?? '');
  r.onerror = () => no(r.error);
  r.readAsDataURL(blob);
});
$<HTMLInputElement>('f-photos').onchange = async (e) => {
  const input = e.target as HTMLInputElement;
  const dir = editing && !editing.isNew ? `${newPostDir(editing.id)}/img/` : null;
  const taken = new Set([...pending.map((p) => p.name), ...(dir ? paths.filter((p) => p.startsWith(dir)).map((p) => p.slice(dir.length)) : [])]);
  for (const file of [...(input.files ?? [])]) {
    try {
      if (!file.type.startsWith('image/')) { say('edit-msg', `${file.name}: 사진 파일만 올릴 수 있습니다.`, 'err'); continue; }
      const { blob } = await prepareImage(file);
      if (blob.size > 8 * 1024 * 1024) { say('edit-msg', `${file.name}: 8MB보다 큰 사진은 올릴 수 없습니다.`, 'err'); continue; }
      const name = safeImageName(blob.type === 'image/jpeg' ? file.name.replace(/\.[^.]+$/, '') + '.jpg' : file.name, taken);
      taken.add(name);
      pending.push({ name, base64: await toBase64(blob), size: blob.size });
      insertAtCursor(`![](./img/${name})`);
    } catch { say('edit-msg', `${file.name}: 사진을 읽지 못했습니다.`, 'err'); }
  }
  input.value = '';
  drawPending();
};


// ── 서식 버튼과 미리보기 ─────────────────────────────────
/** 선택한 글자를 앞뒤 기호로 감쌉니다. 선택이 없으면 예시 글자를 넣고 선택해 둡니다. */
function wrapSelection(before: string, after: string, placeholder: string) {
  const ta = f.body();
  const a = ta.selectionStart, b = ta.selectionEnd;
  const sel = ta.value.slice(a, b) || placeholder;
  ta.setRangeText(before + sel + after, a, b, 'end');
  ta.selectionStart = a + before.length; ta.selectionEnd = a + before.length + sel.length;
  ta.focus();
}
/** 선택한 줄들의 맨 앞을 바꿉니다. */
function editLines(fn: (line: string) => string) {
  const ta = f.body();
  const start = ta.value.lastIndexOf('\n', ta.selectionStart - 1) + 1;
  let end = ta.value.indexOf('\n', ta.selectionEnd); if (end < 0) end = ta.value.length;
  const out = ta.value.slice(start, end).split('\n').map(fn).join('\n');
  ta.setRangeText(out, start, end, 'select');
  ta.focus();
}
const UNFIN = '(미완독) ';
const tools: Record<string, () => void> = {
  bold: () => wrapSelection('**', '**', '굵은 글씨'),
  mark: () => wrapSelection('<mark>', '</mark>', '형광펜'),
  link: () => { const ta = f.body(); const sel = ta.value.slice(ta.selectionStart, ta.selectionEnd) || '링크 글자'; const a = ta.selectionStart; ta.setRangeText(`[${sel}](https://)`, a, ta.selectionEnd, 'end'); ta.selectionStart = a + sel.length + 3; ta.selectionEnd = a + sel.length + 11; ta.focus(); },
  heading: () => editLines((l) => (/^##\s/.test(l) ? l.replace(/^##\s+/, '') : `## ${l.replace(/^#+\s*/, '')}`)),
  list: () => editLines((l) => (/^-\s/.test(l) ? l.replace(/^-\s+/, '') : l.trim() ? `- ${l}` : l)),
  code: () => wrapSelection('```\n', '\n```', '코드'),
  unfinished: () => editLines((l) => { if (!l.trim()) return l; const body = l.replace(/^-\s+/, ''); return body.startsWith(UNFIN) || body.startsWith('(읽는 중) ') ? `- ${body.replace(/^\((미완독|읽는 중)\)\s*/, '')}` : `- ${UNFIN}${body}`; }),
};
$('toolbar').onclick = (e) => {
  const b = (e.target as HTMLElement).closest<HTMLButtonElement>('button[data-tool]');
  if (b) tools[b.dataset.tool!]?.();
};

const mime: Record<string, string> = { jpg: 'image/jpeg', jpeg: 'image/jpeg', png: 'image/png', gif: 'image/gif', webp: 'image/webp', svg: 'image/svg+xml' };
function previewHtml(): string {
  let html = marked.parse(f.body().value, { gfm: true, async: false }) as string;
  if (editing && !editing.isNew && editing.id === READING_ID) html = enhanceReadingHtml(html);
  const id = editing?.isNew ? f.slug().value.trim() : editing?.id ?? '';
  // 사진 주소: 방금 고른 사진은 그 자리에서, 이미 올라간 사진은 저장소에서 불러옵니다.
  html = html.replace(/(<img[^>]*\ssrc=")(?:\.\/)?img\/([^"]+)(")/g, (all, a, name, c) => {
    const p = pending.find((x) => x.name === decodeURIComponent(name));
    if (p) return `${a}data:${mime[p.name.split('.').pop()!.toLowerCase()] ?? 'image/jpeg'};base64,${p.base64}${c}`;
    return `${a}https://raw.githubusercontent.com/${REPO}/${BRANCH}/${newPostDir(id).split('/').map(encodeURIComponent).join('/')}/img/${name}${c}`;
  });
  const css = [...document.querySelectorAll<HTMLLinkElement>('link[rel="stylesheet"]')].map((l) => `<link rel="stylesheet" href="${esc(l.href)}">`).join('')
    + [...document.querySelectorAll('style')].map((st) => `<style>${st.textContent}</style>`).join('');
  const reading = editing && editing.id === READING_ID ? ' reading' : '';
  return `<!doctype html><html lang="ko"><head><meta charset="utf-8"><base href="${esc(location.origin + BASE)}/posts/${esc(encodeURIComponent(id))}/">${css}<style>html,body{background:transparent}body{margin:0;padding:2px}a{pointer-events:none}</style></head><body><div class="prose${reading}">${html || '<p style="color:var(--mut)">본문이 비어 있습니다.</p>'}</div></body></html>`;
}
function setTab(tab: 'write' | 'preview') {
  const frame = $<HTMLIFrameElement>('preview');
  $('tab-write').setAttribute('aria-pressed', String(tab === 'write'));
  $('tab-preview').setAttribute('aria-pressed', String(tab === 'preview'));
  $('write-pane').hidden = tab !== 'write';
  frame.hidden = tab !== 'preview';
  if (tab !== 'preview') return;
  const fit = () => { const d = frame.contentDocument; if (d?.documentElement) frame.style.height = `${Math.max(200, d.documentElement.scrollHeight + 8)}px`; };
  frame.onload = () => { fit(); for (const img of frame.contentDocument?.images ?? []) img.addEventListener('load', fit); setTimeout(fit, 400); };
  frame.srcdoc = previewHtml();
}
$('tab-write').onclick = () => { setTab('write'); f.body().focus(); };
$('tab-preview').onclick = () => setTab('preview');

$<HTMLFormElement>('edit-form').onsubmit = async (e) => {
  e.preventDefault();
  if (!editing) return;
  const title = f.title().value.trim();
  if (!title) return say('edit-msg', '제목을 적어 주세요.', 'err');
  const date = f.date().value.trim();
  if (Number.isNaN(new Date(date).getTime())) return say('edit-msg', '날짜 형식이 올바르지 않습니다. 예: 2026-11-16 또는 2026-11-16T22:30:00+09:00', 'err');
  const id = editing.isNew ? f.slug().value.trim() : editing.id;
  await busy($<HTMLButtonElement>('edit-save'), '저장 중…', async () => {
    try {
      if (editing!.isNew) {
        posts = postFiles(paths = await gh!.listPaths());
        const bad = slugError(id, new Set(posts.keys()));
        if (bad) return say('edit-msg', bad, 'err');
      }
      const meta: Meta = { ...editing!.meta, title, date, category: f.category().value.trim(), tags: splitTags(f.tags().value), draft: f.draft().checked };
      const file = editing!.isNew ? `${newPostDir(id)}/index.md` : editing!.file;
      const body = f.body().value;
      const changes: Change[] = [{ path: file, text: serializePost(meta, body) }];
      for (const p of pending) if (body.includes(`./img/${p.name}`)) changes.push({ path: `${newPostDir(id)}/img/${p.name}`, base64: p.base64 });
      if (!editing!.isNew && changes.length === 1 && serializePost(meta, body) === editing!.original) { pending = []; return openList('바뀐 내용이 없어 저장하지 않았습니다.'); }
      await gh!.commit(changes, `${editing!.isNew ? '새 글' : '글 수정'}: ${title}`);
      remember(id, { title, date, category: meta.category || '미분류', draft: meta.draft });
      pending = [];
      await openList(`"${title}" 글을 저장했습니다. 1~2분 뒤 사이트에 반영됩니다.`);
    } catch (err) { say('edit-msg', errText(err), 'err'); }
  });
};

start();
