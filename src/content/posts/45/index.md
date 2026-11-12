---
title: "백준 25625 샤틀버스"
date: 2022-10-29T23:56:34+09:00
category: "백준 문제 해설"
---

호호호호빵

[https://www.acmicpc.net/problem/25625](https://www.acmicpc.net/problem/25625)

[25625번: 샤틀버스](https://www.acmicpc.net/problem/25625)

![](./img/img.png)

풀이

x가 y보다 크면 더한 것을 아니라면 y-x를 출력한다.

시간 복잡도 : $O(1)$

소요 시간 : 1분

아쉬운 점 : 오늘 NYPC 본선이었다. 나도 내년에는 꼭... 본선 가야지..

전체적인 감상 : 화이팅

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
	int x, y;
	cin>>x>>y;
	if(x > y) cout<<x+y;
	else cout<<y-x;
	cout<<'\n';
}
```
