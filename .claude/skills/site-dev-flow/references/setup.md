# 新しいサイトの骨組みと公開の設定

## 1. テンプレートから作る

```bash
gh repo create <名前> --template yoshinaga-nonoka/web-starter --private --clone
cd <名前> && npm install && cp .env.example .env
```

astro.config・wrangler.jsonc・_headers・確認ツール・Skill は入っている。変えるのは、次の名前と `site.ts`（README の「最初に書き換えるもの」）。

- `wrangler.jsonc` の `name`
- `package.json` の `name`

## 2. お店の事実は1か所にまとめる

`src/lib/site.ts` の `SITE`・`ADDRESS`・`HOURS`・`LINKS`・`SECTIONS`・`THEME` を書き換える。
ページ・`seo.ts`（JSON-LD）・`llms.txt`・フッターは、すべてここを読む。
営業時間を変えるときは、表記（`days`・`time`）と構造化データ用の `spec` の両方を直す。

## 3. microCMS（お知らせ）

1. API「お知らせ」を作る。設定は次のとおり。
   - エンドポイント：`news`
   - 形式：リスト形式
2. フィールドを作る。

   | ID | 種類 |
   |---|---|
   | `title` | テキスト（必須） |
   | `content` | リッチエディタ |
   | `thumbnail` | 画像 |
   | `photos` | 複数画像 |
   | `category` | セレクト |

3. APIキーは GET 権限だけにする。
4. 取得の処理（`src/lib/microcms.ts`）を書く。
   - 全件をページ送りで取る。
   - キーがなければ0件にする。
   - キーが間違っていたらビルドを止める。0件で上書き公開してしまわないため。
   - `NEWS_FIXTURE` が設定されていたら、`tools/fixtures/news.json` を返す。
5. 本文は、許可したタグと属性だけを残して出す（`references/security.md`）。
6. 画像は microCMS の画像APIで縮める（`?w=…&fm=webp&q=78`）。記事の中の画像は、コンテンツ幅より小さく（例：480px）する。

## 4. GitHub と Cloudflare

1. GitHub に非公開のリポジトリを作り、`main` に push する。
2. Cloudflare の **Workers & Pages → 作成 → リポジトリをインポート** で、リポジトリを接続する。
   - ビルドコマンド：`npm run build`
   - デプロイコマンド：`npx wrangler deploy`
3. **Settings → Build → Variables and secrets** にビルド変数を登録する。
   - `MICROCMS_SERVICE_DOMAIN`
   - `MICROCMS_API_KEY`（シークレットにする）
   - `SITE_URL`
4. 記事の公開を自動で反映させる。
   1. Worker の **Settings → Builds → Deploy Hooks** で、`main` のフックを作る。
   2. microCMS の **API設定 → Webhook → カスタム通知** に、そのURLを登録する。通知のタイミングは、公開・公開終了・削除。

## 5. 独自ドメイン

1. **取得する：** お名前.com・Xserver などで取得する。
   - 「店名-地名.com」は空いていることが多い。
   - 2年目以降の更新料も比べる。
2. **ネームサーバーを切り替える：**
   1. Cloudflare の **ドメインを追加**（Free）で、2つのネームサーバー名を確かめる。
   2. 登録した会社の管理画面で、ネームサーバーをその2つに変える。
   3. 反映まで数分〜24時間かかる。
3. **Worker につなぐ：** **Settings → Domains & Routes → Custom domain** で、ルートドメインを追加する。www も追加し、**Rules → Redirect Rules** で www から ルートへ 301 で転送する。
4. **URLを変える：** `astro.config.mjs` の既定のURLと、`SITE_URL` を新しいドメインに変える。
5. **反映を確かめる：** `dig @1.1.1.1 <domain>` と `curl -I https://<domain>/` で確かめる。
   - 手元だけ開けないときは、`dig <domain>`（ルーターのDNS）と比べる。
   - 取得直後は、ルーターや回線のセキュリティ機能が、新しいドメインを止めていることがある。
