---
title: "백준 3056 007"
date: 2022-11-11T10:25:42+09:00
category: "백준 문제 해설"
---

오늘 AP 신청했다. Psychology, Spanish Language and Culture, World History: Modern 정말 잘 볼 수 있을지는 내년 5월에 맡긴다..

[https://www.acmicpc.net/problem/3056](https://www.acmicpc.net/problem/3056)

[3056번: 007](https://www.acmicpc.net/problem/3056)

![](./img/img.png)

풀이

비트마스크를 활용한 바텀업 dp를 구현해주면 된다.

비트에 1이 표시된 개수를 tmp를 통해 구해준다.

알아보니 \_\_builtin\_popcount()라는 C++ 함수도 있더라..

나는 그냥 손으로 구현해줬다.

모든 경우의 수 (1&lt;&lt;N) 동안 다 for(int j=0;j&lt;n;j++)을 올려줄 수 있는지 확인하고 dp max(dp, dp\*vc)를 통해서 위로 올려준다.

시간 복잡도 : $O(N\*2^N)$

소요 시간 : 측정 불가

아쉬운 점 : 혼자 완벽하게 풀지는 못했다.

전체적인 감상 : 비트마스킹 점점 익숙해지는 것 같다.

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
ci BN = 20;
int n, a, b;
int vc[BN][BN];
double dp[1<<21];
// 지미 본드 i가 미션 j를 성공적으로 마칠 확률이며, 퍼센트로 주어진다
int main(){
	fast_io;
	cin>>n;
	dp[0] = 1;
	for(int i=0;i<n;i++){
		for(int j=0;j<n;j++){
			cin>>vc[i][j];
		}
	}
	cout<<fixed;
	cout.precision(6);
	for(int i=0;i<(1<<n);i++){
		int tmp = 0;
		int f = i;
		while(f != 0){ // 갯수 세기
			if((f&1) != 0){
				tmp ++;
			}
			f >>=1;
		}
		for(int j=0;j<n;j++){
			if((i&(1<<j))==0){ // i번이 j를 사용하지 않은 환경이라면
				// (dp i번 상황) xor (j번 1 켜놓은 것)
				dp[i|(1<<j)] = max(dp[i|(1<<j)], dp[i]*vc[j][tmp]/100); // tmp개 사용
			}
		}
	}
	cout<<dp[(1<<n)-1]*100;
	cout<<'\n';
}
```
