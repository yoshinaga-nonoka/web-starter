# web-starter

お店・小さな事業者のウェブサイトを作るための、大元のテンプレートです。
構成は Astro（静的）＋ microCMS（お知らせ）＋ Cloudflare Workers（公開）＋ GitHub です。

このテンプレートには、陽だまりcafé（2026-11）で使った作り方がまとめて入っています。

- 開発の流れとルール：`CLAUDE.md`、`.claude/skills/site-dev-flow/`
- 確認のツール：`tools/`
- デザイン案の作り方：`design/`
- セキュリティとSEO・AEOの初期設定

どの端末でも、Claude Code のクラウドでも、このリポジトリから作ったサイトなら同じ流れで作業できます。

## 新しいサイトを始める

```bash
gh repo create <新しいリポジトリ名> --template yoshinaga-nonoka/web-starter --private --clone
cd <新しいリポジトリ名>
npm install
cp .env.example .env    # microCMS を使うときだけ値を入れる
npm run dev             # http://localhost:4321
```

GitHub の画面から作るときは、このリポジトリの **Use this template → Create a new repository** を使います。

### 最初に書き換えるもの

1. **`src/lib/site.ts`：** 店名、住所、営業時間、リンク、いちばんの行動、セクション、色とフォントを書き換える。
2. **`CLAUDE.md`：** 「このサイトについて」を埋める。
3. **`wrangler.jsonc`：** `name` を、Cloudflare での Worker 名に変える。`package.json` の `name` も同じにする。
4. **`public/media/`：** 次のファイルを差し替える。
   - ロゴ（`logo.svg` と、512pxの `logo.png`）
   - 写真
   - OGP画像（`og.jpg`）。`design/og.html` を直してから撮る。
5. **`src/pages/index.astro`：** 見出しや紹介文、メニューを書き換える。デザイン案が決まったら、組み方も変える。

`npm run build && npm run check:ready` で、差し替え忘れ（【要差し替え】・見本画像・example.com）が一覧で出ます。

Claude Code に「このテンプレートで〇〇のサイトを作りたい」と頼めば、`site-dev-flow` の Skill に沿って、聞き取りから公開まで進めます。

## OGP画像とロゴ

```bash
npm run serve:design &
npm run shot -- http://127.0.0.1:5482/design/og.html --sizes 1200x630 --as public/media/og.jpg
npm run shot -- http://127.0.0.1:5482/public/media/logo.svg --sizes 512x512 --as .out/logo.png && sips -s format png .out/logo.png --out public/media/logo.png
```

## 公開

手順は `.claude/skills/site-dev-flow/references/setup.md` にあります。

1. GitHub に push する。
2. Cloudflare の **Workers & Pages → リポジトリをインポート** で、リポジトリを接続する。
   - ビルドコマンド：`npm run build`
   - デプロイコマンド：`npx wrangler deploy`
3. ビルド変数を登録する。
   - `MICROCMS_SERVICE_DOMAIN`
   - `MICROCMS_API_KEY`（シークレットにする）
   - `SITE_URL`
4. 独自ドメインを、カスタムドメインとしてつなぐ。
5. microCMS の Webhook を、Cloudflare の Deploy Hook につなぐ（記事を公開したら自動で反映される）。

## テンプレート自体を良くする

いくつかのサイトで使い回せる改善（ツール、手順、部品）は、このリポジトリに戻します。そうすると、次のサイトから使えます。

すでに作ったサイトに取り込むときは、そのサイトのリポジトリで次を実行し、必要なファイルだけを取り込みます。

```bash
git remote add starter https://github.com/yoshinaga-nonoka/web-starter.git
git fetch starter
git checkout starter/main -- tools/ .claude/skills/site-dev-flow/
```
