---
title: "백준 15749 Snow Boots"
date: 2022-11-06T22:41:52+09:00
category: "백준 문제 해설"
---

2022 USACO DEC Silver 얼마 안남았다..

[15749번: Snow Boots](https://www.acmicpc.net/problem/15749)

![](./img/img.png)

풀이

N 제한이 250이어서 그냥 완전탐색 느낌의 dp를 진행해주면 시간제한 안에 들어간다.

1\~N번까지

i번 부츠로 도달할 수 있는 모든 곳 체크

i번 부츠로 도달할 수 있는 모든 곳에서 i번 이후 부츠로 바꾸어줄 수 있는 모든 곳 체크

시간 복잡도 : $O(N^{3})$

소요 시간 : 35분

아쉬운 점 : 아이디어 떠올리고 구현까지 더 빠르게 할 수 있었으면 좋았겠다.

전체적인 감상 : 재미있는 dp 문제이다.

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
ci BN = 260;
int n, b, f[BN], s[BN], d[BN];
bool dp[BN][BN];
// dp
int main(){
	fast_io;
	cin>>n>>b;
	// f1 = fn = 0
	for(int i=0;i<n;i++){
		cin>>f[i];
	}
	for(int i=0;i<b;i++){
		// s and d : depth(at most) and distance(at most)
		cin>>s[i]>>d[i];
	}
	dp[0][0] = 1;
	// minimum number of boots FJ needs to discard
	for(int i=0;i<b;i++){ // only using ith boots
		for(int j=0;j<n;j++){
			if(dp[i][j]){
				for(int k=1;(k<=d[i])&&(j+k<n);k++){
					if(s[i] >= f[j+k]){
						// k만큼 진행
						dp[i][j+k] = 1;
					}
				}
			}
		}
		if(i==n-1) continue;
		for(int j=0;j<n;j++){
			for(int k=i+1;k<b;k++){ // 바꿔줄 수 있는 상황에는 무조건
				if(dp[i][j] && f[j] <= s[i] && f[j] <= s[k]){
					dp[k][j] = 1;
				}
			}
		}
	}

	for(int i=0;i<b;i++){
		if(dp[i][n-1]){
			cout<<i;
			cout<<'\n';
			return 0;
		}
	}
	assert(0);
}
```
