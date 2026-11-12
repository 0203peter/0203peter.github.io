---
title: "백준 24736 Football Scoring"
date: 2022-10-22T00:22:36+09:00
category: "백준 문제 해설"
---

10/20일의 블로그이다

[https://www.acmicpc.net/problem/24736](https://www.acmicpc.net/problem/24736)

[24736번: Football Scoring](https://www.acmicpc.net/problem/24736)

![](./img/img.png)

풀이  

입력으로 주어지는 수에 대해 가해야하는 가중치가 있다 이 weighted sum을 구하여 출력을 하면 된다. 이를 두번 해준다.  

시간 복잡도 : $O(1)$  

소요 시간 : 5초  

아쉬운 점 : 통합과학 공부 열심히 하자  

전체적인 감상 : 내일 시험은 통합과학이다(반영비율 4%)

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
	int a, b, c, d, e;
	cin>>a>>b>>c>>d>>e;
	cout<<a*6+b*3+c*2+d+e*2<<' ';
	cin>>a>>b>>c>>d>>e;
	cout<<a*6+b*3+c*2+d+e*2<<' ';
}
```
