// GitHub 토큰을 비밀번호로 암호화/복호화합니다. (PBKDF2-SHA256 → AES-GCM 256)
// 암호문만 저장되며, 비밀번호와 토큰 원문은 어디에도 저장되지 않습니다.
export type KeyFile = { v: 1; iter: number; salt: string; iv: string; ct: string };

const ITER = 600_000;
const enc = new TextEncoder();
const dec = new TextDecoder();
const b64 = (u: Uint8Array) => btoa(String.fromCharCode(...u));
const unb64 = (s: string) => Uint8Array.from(atob(s), (c) => c.charCodeAt(0));

async function deriveKey(password: string, salt: Uint8Array, iter: number) {
  const base = await crypto.subtle.importKey('raw', enc.encode(password), 'PBKDF2', false, ['deriveKey']);
  return crypto.subtle.deriveKey({ name: 'PBKDF2', hash: 'SHA-256', salt, iterations: iter }, base, { name: 'AES-GCM', length: 256 }, false, ['encrypt', 'decrypt']);
}

export async function encryptToken(token: string, password: string): Promise<KeyFile> {
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const key = await deriveKey(password, salt, ITER);
  const ct = new Uint8Array(await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, enc.encode(token)));
  return { v: 1, iter: ITER, salt: b64(salt), iv: b64(iv), ct: b64(ct) };
}

/** 비밀번호가 틀리면 null을 돌려줍니다. */
export async function decryptToken(file: KeyFile, password: string): Promise<string | null> {
  try {
    const key = await deriveKey(password, unb64(file.salt), file.iter);
    const pt = await crypto.subtle.decrypt({ name: 'AES-GCM', iv: unb64(file.iv) }, key, unb64(file.ct));
    return dec.decode(pt);
  } catch {
    return null;
  }
}

export function isKeyFile(x: any): x is KeyFile {
  return !!x && x.v === 1 && typeof x.iter === 'number' && [x.salt, x.iv, x.ct].every((s) => typeof s === 'string');
}
