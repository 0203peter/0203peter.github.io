---
title: "백준 8558 Silnia"
date: 2022-11-17T21:29:41+09:00
category: "백준 문제 해설"
---

폴란드어 문제..

[https://www.acmicpc.net/problem/8558](https://www.acmicpc.net/problem/8558)

[8558번: Silnia](https://www.acmicpc.net/problem/8558)

![](./img/img.png)

풀이

n 팩토리얼의 일의 자리 수를 물어보는 문제이다.

시간 복잡도 : $O(N)$

전체적인 감상 : 5팩토리얼부터는 모두 0이 되니 그 전만 if문으로 처리한다면 복잡도 $O(1)$에도 가능할 것 같다.

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
	int n, a=1;
	cin>>n;
	for(int i=1;i<=n;i++){
		a*=i;
		a%=10;
	}
	cout<<a;
	cout<<'\n';
}
```
