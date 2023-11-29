# V-Marionette

V-Marionette は，Neos および Resonite のアバターを Web カメラによるトラッキングで動かせるアプリケーションです．

V-Marionette は，以下の技術を使用しています．

- web カメラによるトラッキング
  - [Mediapipe](https://mediapipe.dev/)
- VRM への solver
  - [kalidokit](https://github.com/yeemachine/kalidokit)
- VRM の表示
  - [three-vrm](https://github.com/pixiv/three-vrm)
- トラッキングデータの送信
  - [Websocket](https://developer.mozilla.org/ja/docs/Web/API/WebSocket)

<img src="resources/violetMarionette_usage.gif" width="600px">

## 実行

### Web アプリケーションの実行

現在（2023-04-30）はまだデモページが公開できていないので，ローカルで実行する他ありません．

ローカルで実行する場合は，このリポジトリをクローンしてください．

```bash
git clone git@github.com:ec-k/violet-marionette.git
```

必要なパッケージをインストールしてください．

```bash
npm install
```

アプリケーションの立ち上げには，次の 2 つを行ってください

1. サーバーを立ち上げる
2. クライアントアプリを立ち上げる

```bash
node bridge-server.js
npm run
```

実行後，以下の URL にアクセスしてください
[http://localhost:3000](http://localhost:3000)

以上で web アプリケーション側の実行が完了します．
しかし，V-Marionette は NeosVR 側でレシーバーの設定を行う必要があります．

### Neos Receiver の設定

現在はテスト用の非常に汚い状態であり，おそらく私しか使えない状態です．動きはします．
UI 周りを整えたら，ここに`neosdb`のリンクを貼り，設定方法を書きます．
