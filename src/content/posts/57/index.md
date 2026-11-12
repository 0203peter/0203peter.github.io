---
title: "백준 19851 버거운 버거"
date: 2022-11-10T22:53:03+09:00
category: "백준 문제 해설"
---

아직 나에게는 너무 어려운 문제라는 생각이 든다. [JusticeHui님의 블로그](https://justicehui.github.io/ps/2021/09/21/BOJ19851/)를 전적으로 참고하여 재구성한 풀이이다. 금광 세그가 사용되는 문제인 것 같은데 더 많은 고민이 필요하다고 생각하다.

[https://www.acmicpc.net/problem/19851](https://www.acmicpc.net/problem/19851)

[19851번: 버거운 버거](https://www.acmicpc.net/problem/19851)

![](./img/img.png)

풀이

주로 segment tree의 lazy propagation을 활용한 풀이이다.

segment tree node 하나 하나에 정수 하나만 저장해주는 것이 아닌 struct를 활용하여 mn, mx, sum 세 가지 변수를 관리해준다.

버거를 뒤집는 연산은 구간에 -1을 곱하는 방법을 통해 진행한다.

버거를 먹는 연산은 풀이 설명을 위해 추가적인 공부가 필요할 것 같다.

2일 안에 완전히 학습하고 해당 내용을 추가하겠다.

시간 복잡도 : $O(Q \\log N)$

소요 시간 : 측정 불가

아쉬운 점 : 혼자 잘 풀고싶었는데 아직은 너무 어렵다.

전체적인 감상 : 그래도 어려운거 하니 실력이 증가하는 느낌이다.

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
// 버거운 버거의 top, bottom
// 버거운 버거의 높이 max(top, bottom)*2
// 한 주문이 끝난 이후 그 주문을 받기 이전의 상태대로 빵의 위아래를 맞춰서 채워 둔다.
// s1은 init할때만 쓰고 필요 없음
// lazy propagation
ci BN = 1000001;
int n, q, t, a, b;
string s1;

int lax[BN*4];
struct node{ // 트리 노드 하나하나에 빵 종류 두 가지를 모두 기록하기
	int mn, mx, sum;
	node() : node(0) {}
	node(int v) : node(v,v,v) {}
	node(int mn, int mx, int sum) : mn(mn), mx(mx), sum(sum) {}
} seg[BN*4];
node operator + (const node &a, const node &b){
	// min, max, sum
	return {min(a.mn, a.sum+b.mn), max(a.mx, a.sum+b.mx), a.sum+b.sum};
}
void propa(int nd, int s, int e){
	if(lax[nd]==0) return;
	seg[nd].sum *= -1;
	seg[nd].mn *= -1;
	seg[nd].mx *= -1;
	swap(seg[nd].mn, seg[nd].mx);
	if(s != e) lax[nd<<1] ^= 1, lax[(nd<<1)|1] ^= 1;// 두 식은 같은 역할
	// 마지막 노드가 아닐 경우
	lax[nd]=0;
}
void init(int nd=1, int s=1, int e=n){
	if(s==e){
		seg[nd]=node(s1[s]=='('?1:-1);
		// ( is 1 and ) is -1
		return;
	}
	int m = (s+e)>>1;
	init(nd<<1,s,m);
	init((nd<<1)|1,m+1,e);
	seg[nd] = seg[nd<<1]+seg[(nd<<1)|1];
}
void upd(int nd, int s, int e, int l, int r){
	propa(nd, s, e);
	if(r < s || e < l) return;
	if(l <= s && e <= r){
		lax[nd] ^= 1;
		propa(nd, s, e);
		return;
	}
	int m = (s+e)>>1;
	upd(nd*2, s, m, l, r);
	upd(nd*2+1, m+1, e, l, r);
	seg[nd] = seg[nd*2] + seg[nd*2+1];
}
node sum(int nd, int s, int e, int l, int r){
	propa(nd, s, e);
	if(r < s || e < l) return node();
	if(l<=s&&e<=r) return seg[nd];
	int m = (s+e)>>1;
	return sum(nd*2, s, m, l, r) + sum(nd*2+1, m+1, e, l, r);
}

int main(){
	fast_io;
	cin>>n>>s1>>q; // ( = 0, ) = 1
	s1 = "0" + s1;
	init(1, 1, n);
	for(int i=0;i<q;i++){
		cin>>t>>a>>b;
		if(t == 1){
			// a, b까지 segtree 뒤집어주는 연산 진행
			upd(1, 1, n, a, b);
		}
		else{ // t == 2
			// a, b까지 구간합 구함
			// max(sum, sum-(b-a+1))*2 출력
			// segtree update 필요 없음
			node upbrd = sum(1, 1, n, a, b);
			int prt = 0;
			if(upbrd.mn < 0){
				prt -= upbrd.mn;
				upbrd.sum -= upbrd.mn;
			}
			prt += upbrd.sum;
			cout<<prt+(b-a+1);
			cout<<'\n';
		}
	}
}
```
