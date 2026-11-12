---
title: "백준 17267 상남자"
date: 2022-11-23T10:31:36+09:00
category: "백준 문제 해설"
---

0-1 bfs 응용문제?

[https://www.acmicpc.net/problem/17267](https://www.acmicpc.net/problem/17267)

[17267번: 상남자](https://www.acmicpc.net/problem/17267)

![](./img/img.png)

풀이

그래프를 탐색하며 상하로 이동하는 것의 비용은 0이고 좌우로 이동하는 것의 비용은 1이다.

단순 bfs에 push\_front 를 추가한다고 생각하면 된다.

비용이 0인 이동을 push\_front로 이동해 도달할 수 있는 모든 곳을 도달해야한다.

백준 [게시판](https://www.acmicpc.net/board/view/37868)에서 반례를 찾아보고 해결하였다.

상하좌우로 한칸씩 이동할 경우 다음의 케이스에서 (2,3) 지점을 탐색해줄 수 없다.

쓸 수 있는 좌우 이동기회를 최대한 아끼면서 bfs를 진행하기 위해 0-1 bfs를 활용해주는 것이다.

8 5  
1 4  
00000  
01110  
02100  
10110  
10110  
10110  
10000  
11111

시간 복잡도 : $O(N^2)$

감상 :

이왜플? 문제 풀면서 플레면 이것보다 어려운 풀이가 아닐까.. 하고 처음 풀이를 계속 다시 검토했다.

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
struct pal{
	int x, y, rl, rr;
};
ci BN = 1001;
int n, m, l, r;
bool chk[BN][BN];
char c[BN][BN];
int dx[] = {1, -1, 0, 0}, dy[] = {0, 0, 1, -1};
bool inr(int ax, int ay){
	return ax >= 0 && ax < n && ay >= 0 && ay < m;
}
int main(){
	fast_io;
	cin>>n>>m>>l>>r;
	for(int i=0;i<n;i++) for(int j=0;j<m;j++) cin>>c[i][j];
	deque<pal> q;
	int ans = 0;
	for(int i=0;i<n;i++){
		for(int j=0;j<m;j++){
			if(c[i][j] == '2'){
				q.pb({i,j,l,r});
				chk[i][j] = 1;
				ans++;
			}
		}
	}

	while(!q.empty()){
		pal fr = q.front();
		q.pop_front();

		for(int i=0;i<4;i++){
			int cx = fr.x+dx[i], cy = fr.y+dy[i];
			if(inr(cx, cy)){
				if(i==0||i==1){
					if(!chk[cx][cy] && c[cx][cy] == '0'){
						q.push_front({cx,cy,fr.rl,fr.rr});
						chk[cx][cy]=1;
						ans++;
					}
				}
				else if(i==2){
					if(!chk[cx][cy] && c[cx][cy] == '0' && fr.rr > 0){
						q.pb({cx,cy,fr.rl,fr.rr-1});
						chk[cx][cy]=1;
						ans++;
					}
				}
				else{
					if(!chk[cx][cy] && c[cx][cy] == '0' && fr.rl > 0){
						q.pb({cx,cy,fr.rl-1,fr.rr});
						chk[cx][cy]=1;
						ans++;
					}
				}
			}
		}
	}
	cout<<ans;
	cout<<'\n';
}
```
