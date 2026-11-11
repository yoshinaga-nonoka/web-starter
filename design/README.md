# design/ — デザイン案

見た目を大きく変えるときは、ここに案を作り、選んでもらってから本番（src/）に組み込む。

```
design/
├ _board/board.html   案を PC とスマホで並べる1枚（?p=案のパス&t=タイトル）
├ og.html             SNS共有の画像（public/media/og.jpg）の元
└ <テーマ>/           例: hero/, loading/, about/
   ├ a.html b.html …  案ごとのページ（共通のCSSは1つに）
   ├ build.py など     本番のビルド（dist/index.html）からヘッダーや文言を取り込む生成スクリプト（任意）
   └ out/             撮ったボード（board-a.jpg）や動画（a.mp4、a-frames.jpg）
```

- 案のページは、リポジトリの根から配信する前提で書く（`npm run serve:design` → http://127.0.0.1:5482/）。
  本番のCSSは `/public/css/site.css`、写真は `/public/media/…` で読める。
- 撮る:
  - 静止画: `npm run shot -- "http://127.0.0.1:5482/design/_board/board.html?p=/design/hero/a.html&t=A案" --sizes 1600x900 --as design/hero/out/board-a.jpg --wait 4000`
  - 動き: `npm run record -- http://127.0.0.1:5482/design/hero/a.html --size 1280x800 --secs 6 --out design/hero/out/a.mp4`
- 選ばれなかった案も消さずに残す（あとで「やっぱりB案の曲線を」と言われたときのため）。
