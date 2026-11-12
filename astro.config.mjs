import { defineConfig } from 'astro/config';

// 사이트 주소는 GitHub 저장소 이름에서 자동으로 정해집니다.
//  - 저장소 이름이 <아이디>.github.io 이면  https://<아이디>.github.io/
//  - 그 외에는                              https://<아이디>.github.io/<저장소>/
// 나중에 개인 도메인을 연결하면 아래 두 줄을 직접 적어 주세요.
//   const site = 'https://내도메인.com'; const base = '/';
const owner = process.env.GITHUB_REPOSITORY_OWNER;
const repo = (process.env.GITHUB_REPOSITORY || '').split('/')[1];
const site = owner ? `https://${owner}.github.io` : 'http://localhost:4321';
const base = repo && repo.toLowerCase() !== `${owner}.github.io`.toLowerCase() ? `/${repo}` : '/';

export default defineConfig({
  site,
  base,
  trailingSlash: 'always',
  markdown: {
    smartypants: false, // 따옴표와 말줄임표를 쓴 그대로 보여 줍니다.
    shikiConfig: { themes: { light: 'github-light', dark: 'github-dark' }, wrap: false },
  },
});
