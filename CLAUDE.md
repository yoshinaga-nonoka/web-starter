# このサイトの開発ルール

このリポジトリは、テンプレート `yoshinaga-nonoka/web-starter` から作ったお店・事業者のサイトです。
構成は Astro（静的）＋ microCMS（お知らせ）＋ Cloudflare Workers（公開）＋ GitHub です。
`main` に push すると、Cloudflare Workers Builds が自動でビルドして公開します。

応答・コミットメッセージ・原稿は日本語で書きます。

## このサイトについて（作り始めたら最初に埋める）

- **お客さま：** 【要差し替え】店名・業種・場所
- **いちばんの行動：** 【要差し替え】例：Map、予約する、注文する、電話する
- **公開URL：** 【要差し替え】https://
- **元データの場所：** 【要差し替え】撮影素材やロゴの原本がある場所（GitHubには入れない）
- **決まったこと：** 採用した案や、ユーザーの好みなど。日付と1〜2行で足していく。
  -

## 開発の流れ（毎回この順で進める）

手順の詳細とコマンドは `.claude/skills/site-dev-flow/SKILL.md` にあります。依頼を受けたら、まずこのSkillを読みます。

1. **読む：** 関係するファイルを先に読む。少なくとも次の4つは読む。
   - `src/lib/site.ts`
   - `src/pages/index.astro`
   - `public/css/site.css`
   - `public/js/site.js`
2. **案を出す：** 見た目を大きく変えるときは、`design/<テーマ>/` に数案を作る。PCとスマホを並べたボード（静止画）や、動画（動き）にして見せ、選んでもらう。
3. **組み込む：** 下の「どこに何があるか」に従う。
4. **確かめる：** 次の点を確かめる。
   - ビルドが通る。
   - 6つの幅で、スクショと寸法が崩れていない。
   - iPhoneのSafariで崩れやすい点
   - 「動きを減らす」設定のときの表示
   - エラーやCSPのブロック（`npm run audit`）
5. **見せる：** スクショや動画を送って見てもらう。確かめられなかったことも伝える。
6. **公開する：** ユーザーが「push」と言ってから、`main` に push する。Cloudflareのビルドが成功したかを見て、本番のページで `npm run audit` を実行する。

大きな移動・削除・整理は、先に案を出して承認を得てから行います。

## どこに何があるか

| 場所 | 中身 |
|---|---|
| `src/lib/site.ts` | **事実と見た目の設定はここだけ。** 店名、住所、営業時間、リンク、いちばんの行動、セクションの一覧（`SECTIONS`）、色とフォント（`THEME`） |
| `src/lib/seo.ts` | 構造化データ（JSON-LD）。`site.ts` から組み立てる |
| `src/lib/microcms.ts` | お知らせの取得、本文の無害化、見本データ（`NEWS_FIXTURE`） |
| `src/pages/index.astro` | トップページ（ヒーロー、お知らせ、メニュー、紹介、アクセス）。デザイン案に合わせて組み替える |
| `src/pages/news/`, `404.astro`, `sitemap.xml.ts`, `robots.txt.ts`, `llms.txt.ts` | お知らせ、404、検索やAI向けのファイル |
| `src/components/` | ヘッダー、見出し、お知らせ欄、フッター、下部バー、線アイコン、ループ動画（`Film`） |
| `public/css/site.css`, `public/js/site.js` | デザインと動き。CSSは PC → タブレット → スマホ の順で、スマホを最後に置く |
| `public/_headers` | セキュリティヘッダーとCSP |
| `public/media/` | 写真・動画・ロゴ・OGP画像（Web用に縮めたもの） |
| `design/` | デザイン案、PCとスマホを並べるボード、OGP画像の元 |
| `tools/` | 確認のツール、お知らせの見本データ、写真と動画の変換 |

## 確認のツール

使うのは Node 22 以上と Chrome だけです。出力は `.out/` に出ます（gitには入りません）。

```bash
npm run build:fixture   # お知らせを見本データで作る（microCMSのキーがなくても確認できる）
npm run serve           # dist を http://127.0.0.1:5481/
npm run serve:design    # リポジトリを http://127.0.0.1:5482/（design/ の案）
npm run shot -- <url> [--sizes 1440x900,390x844] [--full] [--scroll "#id"] [--reduced] [--as file.jpg]
npm run measure -- <url> --expr "<js>" [--sizes 390x844]
npm run record -- <url> --secs 6 --out .out/motion.mp4
npm run audit -- <base-url> / /news/
npm run check:films     # ループ動画を使ったとき
npm run check:ready     # 公開前：テンプレートの残り（【要差し替え】・見本画像・example.com）と、SEOに必要なものがそろっているか
npm run preview:headers # wrangler で _headers も効かせて確認（:8788）
zsh tools/media/photo.sh <写真> <名前> 640 1280   # 写真を WebP に
zsh tools/media/make-loop.sh <動画> <名前> [開始] [長さ] [幅]   # ループ動画とポスター
```

確認する幅：1440×900、1024×768、820×1180、768×1024、390×844、375×812

## 守ること

### 原稿

- 短く、お店の人が書くような自然な日本語にする。
- AIっぽい言い回し（詩的な締め、三点並べ、凝った見出し）は使わない。
- 情報を盛りすぎない。
- 事実は、お客さまの資料から取る。分からないことは作らずに聞く。

### スマホ

- セクションの高さは画面に固定せず、中身の高さ＋上下の余白で詰める。
- いちばんの行動のボタンは、下部バーにまとめる。

### 動き

- 落ち着いた「じわじわ」した動きにする。
- 「動きを減らす」設定のときと、フッターの「動きを止める」を押したときは止める。止まっても、内容が隠れたままにはしない。
- ループ動画は、訪問者が止めたとき以外は再生する。

### iPhoneのSafari

ユーザーはiPhoneのSafariで見ることが多いので、次の点に気をつける。

- **grid内の `aspect-ratio`：** 行の高さで縮むことがある。`width: 100%; align-self: start` を指定する。
- **`word-break: auto-phrase`：** Safariは対応していない。改行させたくない語は `.nw` で包む。
- **SVGの線：** `pathLength` の破線と `non-scaling-stroke` を一緒に使うと崩れる。

### セキュリティ

- APIキーは `.env` に入れ、GitHubには上げない。Cloudflareではビルド変数（シークレット）にする。
- 外部の読み込みを足したら、`public/_headers` のCSPも直す。
- お知らせの本文は、必ず `sanitizeHtml` を通して出す。

### 事実

- 営業時間・住所などは `site.ts` だけを直す。
- 営業日が不定のお店では、「本日営業中」の自動表示を使わない。

### 公開の前

- `npm run check:ready` がすべて ✓ になってから公開する。
