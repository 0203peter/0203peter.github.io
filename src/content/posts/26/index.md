---
title: "2670 연속부분최대곱 (C++)"
date: 2022-10-10T22:50:57+09:00
category: "백준 문제 해설"
---

잘 알아두어야 하는 dp 문제

![](./img/img.png)

풀이

이전의 정보가 앞으로 쓸모 있을 때만 사용해주는 방법을 사용한다.

해당 경우를 누적시키며 진행하면 답을 구할 수 있다.

시간 복잡도 : $O(n)$

소요 시간 : 측정 불가

아쉬운 점 : 분명 쉬운 문제인데 풀이 떠올리는 게 쉽지 않더라..

전체적인 감상 : 이정도는 당연하다는 듯이 알고 있어야 한다 고! 생각한다.

```cpp
#include<bits/stdc++.h>
#define fast_io ios_base::sync_with_stdio(0),cin.tie(0),cout.tie(0)
using namespace std;
double ar[10010], ans = 0;

int main(){
	fast_io;
	int n;
	cin>>n;
	for(int i=0;i<n;i++) cin>>ar[i];

	ans = ar[0];
	for(int i=1;i<n;i++){
		if(ar[i] * ar[i-1] >= ar[i]){
			ar[i] = ar[i-1] * ar[i];
		}
		ans = max(ans, ar[i]);
	}
	cout<<fixed;
	cout.precision(3);
	cout<<ans;
	cout<<'\n';
}
```
