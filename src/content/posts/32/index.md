---
title: "백준 25377 빵"
date: 2022-10-22T00:13:54+09:00
category: "백준 문제 해설"
---

10/16일의 블로그이다. 글쓰기가 잘 안되어 늦게 올리게 되었다.

[25377번: 빵](https://www.acmicpc.net/problem/25377)

![](./img/img.png)

풀이

n개의 입력에 대해 조건에 맞는 최적의 d를 찾아 출력해주면 된다

시간 복잡도 : $O(n)$

소요 시간 : 1분

아쉬운 점 : 없다

전체적인 감상 : 빵! 으악!

```cpp
#include<stdio.h>
int main(){
	int n,a,b,d=1e9;
	scanf("%d",&n);
	while(n--){
		scanf("%d %d",&a,&b);
		if(a<=b&&b<d) d=b;
	}
	printf("%d",(d==1e9)?-1:d);
}
```
