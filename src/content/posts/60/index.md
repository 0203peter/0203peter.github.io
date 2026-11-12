---
title: "백준 4714 Lunacy"
date: 2022-11-13T23:33:05+09:00
category: "백준 문제 해설"
---

조건문 들어가면 난이도 최소가 브4인건가?

[https://www.acmicpc.net/problem/4714](https://www.acmicpc.net/problem/4714)

[4714번: Lunacy](https://www.acmicpc.net/problem/4714)

![](./img/img.png)

풀이

cout&lt;&lt;fixed;

cout.precision(2);

를 통해서 cout을 통해 출력할 실수형 자료의 자릿수를 정해주고 고정해준다.

반올림인 것으로 알고 있다.

cout&lt;&lt;fixed;가 없을 경우 cout.precision()은 한 번만 적용됨에 유의하라.

시간 복잡도 : $O(T)$

소요 시간 : 1분

아쉬운 점: 오늘도 꽤 많이 놀았던 것 같다.

전체적인 감상 : 갈축 키보드 사고 싶다.

```cpp
/* basic setup {{{ */
#include<bits/stdc++.h>
#define ff first
#define ss second
#define pb push_back
#define sz(x) ((int)x.size())
#define all(x) x.begin(),x.end()
#define compress(x) sort(all(x)), x.erase(unique(all(x)), x.end())
#define fast_io ios_base::sync_with_stdio(0),cin.tie(0),cout.tie(0)
using namespace std;
typedef long long ll;
typedef pair<int,int> pii;
typedef pair<ll,ll> pll;
typedef const int ci;
const int MOD = 1e9+7;
const int INF = 0x3f3f3f3f;
const ll LINF = 0x3f3f3f3f3f3f3f3f;
/*}}}*/

int main(){
	fast_io;
	cout<<fixed;
	cout.precision(2);
	double f;
	while(cin>>f){
		if(f < 0) break;
		cout<<"Objects weighing "<<f<<" on Earth will weigh "<<f*0.167<<" on the moon.\n";
	}
}
```
