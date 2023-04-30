# Violet Marionette
Violet Marionetteは，VRSNS上のアバターをWebカメラによるトラッキングで動かせるアプリケーションです．

現在はNeosVRにのみ対応しています．


Violet Marionetteは，以下の技術を使用しています．
- webカメラによるトラッキング
  - [Mediapipe](https://mediapipe.dev/)
- VRMへのsolver
  - [kalidokit](https://github.com/yeemachine/kalidokit)
- VRMの表示
  - [three-vrm](https://github.com/pixiv/three-vrm)
- トラッキングデータの送信
  - [Websocket](https://developer.mozilla.org/ja/docs/Web/API/WebSocket)

<img src="resources/violetMarionette_usage.gif" width="600px">

## 非常に忍びない状態
Violet Marionetteはwebカメラを用いてVRSNS上でアバターを動かすことのできるアプリケーションであるのですが，送信するトラッキングデータの回転軸が正しくないので正しく動作しません．
重要な機能が動かないので，使える状態ではありません．非常に忍びないです．ごめんなさい．

本WebアプリおよびNeosVRのレシーバーはそれぞれ単体ではほぼ完成しているので，数日の内に使えるようになります．

## 実行
### Webアプリケーションの実行
現在（2023-04-30）はまだデモページが公開できていないので，ローカルで実行する他ありません．

ローカルで実行する場合は，このリポジトリをクローンしてください．
```bash
git clone git@github.com:ec-k/violet-marionette.git
```
必要なパッケージをインストールしてください．
```bash
npm install
yarn install
```

アプリケーションの立ち上げには，次の2つを行ってください
1. サーバーを立ち上げる
2. クライアントアプリを立ち上げる
```bash
node bridge-server.js
npm run
```

実行後，以下のURLにアクセスしてください
[http://localhost:3000](http://localhost:3000)


以上でwebアプリケーション側の実行が完了します．
しかし，Violet MarionetteはNeosVR側でレシーバーの設定を行う必要があります．

### Neos Receiverの設定
現在はテスト用の非常に汚い状態であり，おそらく私しか使えない状態です．動きはします．
UI周りを整えたら，ここに`neosdb`のリンクを貼り，設定方法を書きます．