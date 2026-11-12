# hyuncpp 개인 페이지

티스토리 블로그(글 177개)를 옮겨 만든 개인 사이트입니다. `main` 브랜치에 변경 사항을 올리면 1~2분 뒤 사이트에 자동으로 반영됩니다.

## 폴더 구조

```
src/
  site.config.ts        사이트 이름, 소개 문구, 하단 링크
  pages/about.md        소개 페이지
  content/posts/        글 (폴더 하나 = 글 하나)
    182/
      index.md          글 본문
      img/              이 글에 쓰는 사진
  styles/global.css     디자인(색, 글꼴, 간격)
```

## 새 글 쓰기

1. `src/content/posts/` 아래에 폴더를 하나 만들고 그 안에 `index.md`를 만듭니다. 폴더 이름이 글 주소가 됩니다(예: `first-run` → `/posts/first-run/`). 영문 소문자, 숫자, 하이픈을 권장합니다.
2. 파일 맨 위에 글 정보를 적고, 그 아래에 본문을 마크다운으로 씁니다.

```md
---
title: "글 제목"
date: 2026-11-12
category: "일상"
tags: ["태그1", "태그2"]
---

본문을 여기에 씁니다.

## 소제목

![사진 설명](./img/photo.jpg)
*사진 아래에 보일 캡션*
```

- `category`는 기존 분류(백준 문제 해설, 알고리즘 지식, 독서, 운동, 음악, 일상, 가볍게 쓴 일상) 중 하나를 쓰거나 새 이름을 적으면 분류가 새로 생깁니다. 생략하면 "미분류"가 됩니다.
- `tags`는 생략할 수 있습니다.
- `date`에 시간까지 적으려면 `2026-11-12T21:30:00+09:00` 형식으로 씁니다.
- 사진은 같은 폴더의 `img/`에 넣고 `./img/파일이름`으로 불러옵니다. 올릴 때 자동으로 가볍게 변환됩니다.
- 코드는 ` ```cpp ` 처럼 언어 이름을 붙이면 색이 입혀집니다.

### 휴대폰이나 웹 브라우저에서 쓰기 (프로그램 설치 없이)

1. github.com에서 이 저장소의 `src/content/posts` 폴더로 들어갑니다.
2. **Add file → Create new file**을 누르고 파일 이름 칸에 `폴더이름/index.md`를 입력합니다(슬래시를 치면 폴더가 만들어집니다).
3. 위 형식대로 내용을 쓰고 **Commit changes**를 누릅니다.
4. 사진은 **Add file → Upload files**로 `폴더이름/img/` 안에 올립니다.

### 컴퓨터에서 쓰기

```bash
npm install        # 처음 한 번
npm run dev        # http://localhost:4321 에서 미리보기
git add . && git commit -m "새 글: 제목" && git push
```

## 글 수정, 숨기기, 삭제

- **수정**: 해당 글의 `index.md`를 열어 고치고 커밋합니다. GitHub 웹에서는 파일을 연 뒤 연필 아이콘을 누르면 됩니다.
- **숨기기**: 글 정보에 `draft: true` 한 줄을 추가하면 사이트에서 사라집니다. 지우면 다시 보입니다. 단, 저장소가 공개 상태라면 파일 자체는 GitHub에서 여전히 볼 수 있습니다.
- **삭제**: 글 폴더를 통째로 지웁니다.

## 사이트 정보 바꾸기

- 이름, 첫 화면 문구, 하단 링크: `src/site.config.ts`
- 소개 페이지: `src/pages/about.md`
- 색과 글꼴: `src/styles/global.css` 맨 위의 `:root` 부분

## 처음 한 번만 하는 배포 설정

저장소의 **Settings → Pages → Build and deployment → Source**를 **GitHub Actions**로 바꿉니다. 이후에는 `main`에 올릴 때마다 자동으로 배포됩니다.

주소는 저장소 이름에 따라 정해집니다.

- 저장소 이름이 `<아이디>.github.io` → `https://<아이디>.github.io/`
- 그 외 → `https://<아이디>.github.io/<저장소이름>/`

개인 도메인을 연결하려면 `astro.config.mjs` 위쪽 주석을 참고하세요.

## 옮겨 온 글에 대해

- 주소의 숫자는 티스토리 글 번호와 같습니다(`hyuncpp.tistory.com/103` → `/posts/103/`).
- 사진은 긴 변 2000px 이하로 줄이고 촬영 위치 등 메타데이터를 지웠습니다.
- 글자색과 형광펜 표시는 `<span style="...">` 형태로 남겨 두었습니다.
