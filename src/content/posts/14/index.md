---
title: "16724 피리 부는 사나이 (C++)"
date: 2022-09-28T22:54:03+09:00
category: "백준 문제 해설"
---

Floyd's Tortoise and Hare Algorithm을 사용하여 문제를 해결하였다.

![](./img/img.png)

문제 접근 과정

1분

문제의 이차원 배열이 Functional Graph의 형태를 띤다는 사실을 알게 되었다.

사이클 판별 알고리즘을 활용하여 발생하는 사이클의 개수를 세어주면 된다는 것을 알았다.

6분

이차원 배열에서 직접 하려던 사이클 판별을 하기 위해 rev 배열을 구현하는데 어려움을 겪었다.

7분

이차원 배열의 노드에 새 id를 각각 부여해서 일반적인 형태의 그래프로 치환하였다.

14분

코드 첫 실행

while문에서 문제가 생긴다는 것을 return 0;을 써보며 알게 되었다.

15분

수정 후 첫 제출

기쁨의 AC

소요 시간 : 15분

아쉬운 점 : 노드에 새 id를 부여하는 것을 처음부터 했으면 더 빨랐을 것이다.

전체적인 감상 : 컨디션이 안좋아서 잘 안 풀릴 줄 걱정했는데 생각보다 너무 잘 나와서 기분이 좋다.

```cpp
// library 'def.cpp'{{{
//
/*lib*/
#include<bits/stdc++.h>
using namespace std;
typedef long long ll;
typedef pair<int,int> pii;
typedef pair<ll,ll> pll;
#define ff first
#define ss second
#define pb push_back
#define sz(x) ((int)x.size())
#define all(x) x.begin(),x.end()
#define fast_io ios_base::sync_with_stdio(0),cin.tie(0)
const int MOD = 1e9+7;
const int INF = 0x3f3f3f3f;
const ll LINF = 0x3f3f3f3f3f3f3f3f;
/*lib*//*}}}*/
const int BN = 1010;
char ar[BN][BN];
int n, m;
int dx[] = {0, 0, -1, 1}, dy[] = {-1, 1, 0, 0};
bool vis[BN*BN];
int adj[BN*BN];
vector<int> rev[BN*BN];

int main(){
	fast_io;
	cin>>n>>m;
	for(int i=0;i<n;i++) for(int j=0;j<m;j++) cin>>ar[i][j];

	for(int i=0;i<n;i++) for(int j=0;j<m;j++){
		char c = ar[i][j];
		int cur = i*m + j;
		if(c == 'U'){
			adj[cur] = cur - m;
			rev[cur-m].pb(cur);
		}
		else if(c == 'D'){
			adj[cur] = cur + m;
			rev[cur+m].pb(cur);
		}
		else if(c == 'L'){
			adj[cur] = cur-1;
			rev[cur-1].pb(cur);
		}
		else{
			adj[cur] = cur+1;
			rev[cur+1].pb(cur);
		}
	}
	int x, y, ans = 0;
	queue<int> q;

	for(int i=0;i<n*m;i++){
		if(!vis[i]){
			ans++;
			x = adj[adj[i]], y = adj[i];
			while(x != y){
				// 반복되는 지점을 찾는 부분에서 문제 발생

				x = adj[adj[x]], y = adj[y];
			}

			vis[x] = 1;
			q.push(x);
			while(!q.empty()){
				int fr = q.front();
				q.pop();

				for(int nx : rev[fr]){
					if(!vis[nx]){
						vis[nx] = 1;
						q.push(nx);
					}
				}
			}
		}
	}
	cout<<ans<<'\n';
}
```
