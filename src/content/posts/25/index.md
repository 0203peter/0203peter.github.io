---
title: "3653 영화 수집 (C++)"
date: 2022-10-09T23:44:06+09:00
category: "백준 문제 해설"
---

처음 보는 느낌의 segment tree 문제이다 재미있었다.

![](./img/img.png)

풀이

기본적인 segmet tree를 n+m개의 leaf node가 존재하게 선언한다.

처음에는 뒤의 n개 노드에만 1을 표시에 넣어준다

입력을 받을 때마다 새로운 id를 부여해주고 segment tree의 기존 위치에는 -1을 새 위치에는 1을 update 해준다

m이 충분히 작아서 여유공간을 만들어주고 활용할 수 있다는 점이 인상적인 문제이다.

시간 복잡도 : $O(m \\log(n+m))$

소요 시간 : 측정 불가

아쉬운 점

앞으로 맞이하게 될 문제들에 다양한 종류의 segment tree가 많을 건데 이번 문제에서는 처음 보는 형태라고 잘 알아차리지 못해 아쉽다.

전체적인 감상

구현에 직관적이고 흥미로운 아이디어들이 사용되어 재미있는 문제라고 생각한다.

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
ci BN = 200010;
int seg[BN*4], n, m, nidx[BN], f;

int sum(int node, int s, int e, int l, int r){
	if(r < s || e < l) return 0;
	if(l <= s && e <= r) return seg[node];

	int m = (s+e)>>1;
	return sum(node*2, s, m, l, r) + sum(node*2+1, m+1, e, l, r);
}
void upd(int node, int s, int e, int tar, int val){
	if(tar < s || e < tar) return;
	seg[node] += val;
	if(s == e) return;
	int m = (s+e)>>1;
	upd(node*2, s, m, tar, val);
	upd(node*2+1, m+1, e, tar, val);
}

void init(){
	memset(nidx, 0, sizeof nidx);
	memset(seg, 0, sizeof seg);
	for(int i=1;i<=n;i++) nidx[i] = m+i;
}
void solve(){
	cin>>n>>m;
	init();
	for(int i=1;i<=n;i++) upd(1, 1, n+m, nidx[i], 1);
	for(int i=0;i<m;i++){
		cin>>f;
		cout<<sum(1, 1, n+m, 1, nidx[f]-1)<<' ';

		upd(1, 1, n+m, nidx[f], -1);
		nidx[f] = m-i;
		upd(1, 1, n+m, m-i, 1);
	}
	cout<<'\n';
}
int main(){
	fast_io;
	int t;
	cin>>t;
	while(t--){
		solve();
	}
}
```
