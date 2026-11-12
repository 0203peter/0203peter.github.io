---
title: "9177 단어 섞기(dp, c++)"
date: 2022-08-05T06:51:37+09:00
category: "백준 문제 해설"
---

주석처리한 부분 사용했으니 i도 j도 다음으로 넘겨줄 수 있게 되는 것 이다.......

```cpp
#include<bits/stdc++.h>
using namespace std;
typedef long long ll;
typedef pair<int,int> pii;
#define pb push_back
#define ff first
#define ss second
#define fast_io ios::sync_with_stdio(false),cin.tie(0),cout.tie(0)
int dp[210][210];
string s1, s2, s3;

int main(){
  fast_io;
  int n;
  cin>>n;
  for(int t=1;t<=n;t++){
    memset(dp, 0, sizeof dp);
    cout<<"Data set "<<t<<": ";
    cin>>s1>>s2>>s3;
    int n = s1.size(), m = s2.size();

    for(int i=1;i<=n;i++)
      if(s1[i-1] == s3[i-1])
        dp[i][0] = 1;
    for(int i=1;i<=m;i++)
      if(s2[i-1] == s3[i-1])
        dp[0][i] = 1;

    for(int i=1;i<=n;i++){
      for(int j=1;j<=m;j++){

        char a = s1[i-1], b = s2[j-1], c = s3[i+j-1];

        if(a != c && b != c)
          dp[i][j] = 0;
        else if(a == c && b != c)
          dp[i][j] = dp[i-1][j];
        else if(a != c && b == c)
          dp[i][j] = dp[i][j-1]; // 사용했으니 다음으로 넘겨줄 수 있게 된다
        else
          dp[i][j] = dp[i][j-1] || dp[i-1][j];
      }
    }
    if(dp[n][m])
      cout<<"yes\n";
    else
      cout<<"no\n";
  }

  cout<<'\n';
}
```
