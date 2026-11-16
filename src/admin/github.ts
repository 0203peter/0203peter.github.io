// GitHub 저장소에 글을 읽고 쓰는 부분입니다. 한 번의 저장은 커밋 하나로 묶입니다.
export type Change =
  | { path: string; text: string }      // 글 파일 쓰기
  | { path: string; base64: string }    // 사진 파일 쓰기
  | { path: string; remove: true };     // 삭제

export class GitHubError extends Error {
  constructor(public status: number, message: string) { super(message); }
}

const messages: Record<number, string> = {
  401: 'GitHub 토큰이 만료됐거나 잘못됐습니다. "비밀번호·토큰 다시 설정"에서 새 토큰을 등록해 주세요.',
  403: '이 토큰에는 저장소에 쓸 권한이 없습니다. 토큰의 Contents 권한이 Read and write인지 확인해 주세요.',
  404: '저장소나 파일을 찾지 못했습니다. 토큰이 이 저장소에 접근할 수 있는지 확인해 주세요.',
  409: '다른 변경과 겹쳤습니다. 잠시 뒤 다시 저장해 주세요.',
  422: '다른 변경과 겹쳤습니다. 잠시 뒤 다시 저장해 주세요.',
};

export function utf8ToBase64(s: string) {
  const u = new TextEncoder().encode(s);
  let bin = '';
  for (let i = 0; i < u.length; i += 0x8000) bin += String.fromCharCode(...u.subarray(i, i + 0x8000));
  return btoa(bin);
}
export function base64ToUtf8(b: string) {
  return new TextDecoder().decode(Uint8Array.from(atob(b.replace(/\s/g, '')), (c) => c.charCodeAt(0)));
}

export class GitHub {
  constructor(private repo: string, private branch: string, private token: string | null, private fetcher: typeof fetch = (...a) => fetch(...a)) {}

  private async api(path: string, init: { method?: string; body?: unknown } = {}) {
    const headers: Record<string, string> = { Accept: 'application/vnd.github+json', 'X-GitHub-Api-Version': '2022-11-28' };
    if (this.token) headers.Authorization = `Bearer ${this.token}`;
    if (init.body !== undefined) headers['Content-Type'] = 'application/json';
    let res: Response;
    try {
      res = await this.fetcher(`https://api.github.com/repos/${this.repo}${path}`, { method: init.method ?? 'GET', headers, body: init.body === undefined ? undefined : JSON.stringify(init.body), cache: 'no-store' });
    } catch {
      throw new GitHubError(0, 'GitHub에 연결하지 못했습니다. 인터넷 연결을 확인해 주세요.');
    }
    if (!res.ok) throw new GitHubError(res.status, messages[res.status] ?? `GitHub 오류가 발생했습니다 (${res.status}).`);
    return res.status === 204 ? null : res.json();
  }

  /** 토큰이 이 저장소에 쓸 수 있는지 확인합니다. */
  async canPush(): Promise<boolean> {
    const r = await this.api('');
    return r?.permissions ? !!r.permissions.push : true; // 권한 정보가 없으면 실제 저장 때 확인됩니다.
  }

  /** 저장소의 모든 파일 경로 */
  async listPaths(): Promise<string[]> {
    const r = await this.api(`/git/trees/${encodeURIComponent(this.branch)}?recursive=1`);
    return (r.tree as { path: string; type: string }[]).filter((t) => t.type === 'blob').map((t) => t.path);
  }

  async readText(path: string): Promise<string> {
    const r = await this.api(`/contents/${path.split('/').map(encodeURIComponent).join('/')}?ref=${encodeURIComponent(this.branch)}`);
    return base64ToUtf8(r.content);
  }

  /** 여러 파일의 추가·수정·삭제를 커밋 하나로 저장합니다. */
  async commit(changes: Change[], message: string): Promise<string> {
    const ref = await this.api(`/git/ref/heads/${encodeURIComponent(this.branch)}`);
    const parent: string = ref.object.sha;
    const head = await this.api(`/git/commits/${parent}`);
    const tree = [] as { path: string; mode: '100644'; type: 'blob'; sha: string | null }[];
    for (const c of changes) {
      if ('remove' in c) { tree.push({ path: c.path, mode: '100644', type: 'blob', sha: null }); continue; }
      const blob = await this.api('/git/blobs', { method: 'POST', body: 'text' in c ? { content: c.text, encoding: 'utf-8' } : { content: c.base64, encoding: 'base64' } });
      tree.push({ path: c.path, mode: '100644', type: 'blob', sha: blob.sha });
    }
    const newTree = await this.api('/git/trees', { method: 'POST', body: { base_tree: head.tree.sha, tree } });
    const commit = await this.api('/git/commits', { method: 'POST', body: { message, tree: newTree.sha, parents: [parent] } });
    await this.api(`/git/refs/heads/${encodeURIComponent(this.branch)}`, { method: 'PATCH', body: { sha: commit.sha } });
    return commit.sha;
  }
}

const POSTS = 'src/content/posts/';
/** 파일 경로 목록에서 글 주소(id) → 글 파일 경로를 뽑습니다. */
export function postFiles(paths: string[]): Map<string, string> {
  const out = new Map<string, string>();
  for (const p of paths) {
    if (!p.startsWith(POSTS) || !p.endsWith('.md')) continue;
    const rel = p.slice(POSTS.length);
    out.set(rel.replace(/\/index\.md$/, '').replace(/\.md$/, ''), p);
  }
  return out;
}
/** 글 하나에 딸린 모든 파일(본문 + 사진) */
export function filesOfPost(paths: string[], id: string, file: string): string[] {
  return file.endsWith('/index.md') ? paths.filter((p) => p.startsWith(`${POSTS}${id}/`)) : [file];
}
export const newPostDir = (id: string) => `${POSTS}${id}`;
