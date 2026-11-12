// 사이트 전체에 쓰이는 기본 정보입니다. 여기만 고치면 모든 페이지에 반영됩니다.
export const SITE = {
  title: 'hyuncpp',
  author: '이현빈',
  description: '이현빈의 개인 페이지. 알고리즘, 독서, 달리기, 일상의 기록.',
  intro: '문제를 풀고, 책을 읽고, 달리고, 기록합니다.',
  // 첫 화면 독서 현황판이 읽어 오는 글(src/content/posts/ 아래 폴더 이름)
  readingPostId: '106',
  links: [
    // { label: 'GitHub', href: 'https://github.com/아이디' },
  ] as { label: string; href: string }[],
};
