---
title: "백준 16099 Large Sport Facility"
date: 2022-11-12T23:56:23+09:00
category: "백준 문제 해설"
---

브 5 100 솔!

[https://www.acmicpc.net/problem/16099](https://www.acmicpc.net/problem/16099)

[16099번: Larger Sport Facility](https://www.acmicpc.net/problem/16099)

![](./img/img.png)

풀이

두 직사각형의 넓이를 비교해준다.

같을 때와 둘 중 하나가 더 클 때 모두 조건문으로 처리해준다.

시간 복잡도 : $O(T)$

소요 시간 : 1분

아쉬운 점 : 플 5 풀던 거 마저 풀어야 하는데 오늘 너무 놀았다.

전체적인 감상 : 오늘 Steam R&E 최종 발표 나쁘지 않았다.

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
int t;
ll a, b, c, d, p, q;
int main(){
	fast_io;
	cin>>t;
	while(t--){
		cin>>a>>b>>c>>d;
		p = a*b;
		q = c*d;
		if(p==q) cout<<"Tie\n";
		else if(p > q) cout<<"TelecomParisTech\n";
		else cout<<"Eurecom\n";
	}
}
```
