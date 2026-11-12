---
title: "백준 18398 HOMWRK"
date: 2022-11-16T23:57:50+09:00
category: "백준 문제 해설"
---

뭐랄까 풀기 싫다고나 할까

[https://www.acmicpc.net/problem/18398](https://www.acmicpc.net/problem/18398)

[18398번: HOMWRK](https://www.acmicpc.net/problem/18398)

![](./img/img.png)

풀이

합과 곱을 출력해주면 되는 문제이다.

시간 복잡도 : $O(N\*T)$

아쉬운 점 : 없다

전체적인 감상 : 없다.

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
	int t;
	cin>>t;
	while(t--){
		int n, a, b;
		cin>>n;
		while(n--){
			cin>>a>>b;
			cout<<a+b<<' '<<a*b<<'\n';
		}
	}
}
```
