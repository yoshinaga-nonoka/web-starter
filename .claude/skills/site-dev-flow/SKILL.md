---
name: site-dev-flow
description: このリポジトリ（web-starter テンプレートから作ったお店・事業者のサイト）で作業するときの手順。新しいサイトの立ち上げ（聞き取り→site.tsを埋める→デザイン案→公開）、デザインの変更、文言や営業時間の変更、動き、お知らせ（microCMS）、SEO・AEO、セキュリティ、独自ドメイン、pushで公開まで、どの依頼でも最初に読む。
---

# サイト制作の手順

ルールとファイルの場所は `CLAUDE.md` にあります。このSkillには「どう進めるか」を書きます。

公開の設定は `references/` を見ます。

| 何を | どこを見る |
|---|---|
| GitHub、Cloudflare、microCMS、独自ドメイン | `references/setup.md` |
| セキュリティヘッダー、無害化、ダッシュボードの設定 | `references/security.md` |
| title、OGP、JSON-LD、sitemap、llms.txt、Search Console | `references/seo-aeo.md` |

## 進め方の原則

- **話し方：** ユーザーには日本語で短く答える。専門用語には、ひとこと説明を添える。
- **見た目を大きく変えるとき：** 数案を作って、選んでもらう。言葉だけで決めず、PCとスマホの画像（動きは動画）で見せる。
- **事実：** お客さまの資料（チラシ、Instagram、Googleマップ、ヒアリング）から取る。作らない。分からないことは聞く。
- **確かめる：** スクショは必ず自分で見る。確かめられなかったことは、そう書く。
- **公開：** ユーザーが「push」と言ってから行う。1回の依頼は1つのコミットにまとめる。
- **大きな変更：** ファイルの大きな移動・削除・整理は、先に案を出して承認を得る。
- **記録：** 決まったことは `CLAUDE.md` の「このサイトについて」に日付つきで足す。いくつかのサイトで使える改善は、テンプレート（yoshinaga-nonoka/web-starter）にも戻すよう提案する。

## 0. 新しいサイトを始めるとき（`CLAUDE.md` の「このサイトについて」が空のとき）

1. **聞き取り：** 足りないものだけを、まとめて1回で聞く。
   - 業種
   - 店名
   - 場所（住所、最寄り駅からの道のり）
   - 営業日と時間
   - いちばんの行動（Map、予約、注文、電話）
   - 載せたいもの（メニュー、サービス、料金を出すかどうか）
   - 手元の素材（ロゴ、写真、動画、チラシ）
   - SNS
   - 参考にしたいサイト
   - 独自ドメインの有無
2. **`src/lib/site.ts` を埋める：**
   - 色はロゴや写真から取る。ボタンの色は、白文字が読める濃さにする（コントラスト4.5以上）。
   - フォントは業種に合わせて、日本語の見出し・本文・英字の3つを選ぶ。
   - schema.org の `type` は業種に合わせる。
3. **ほかのファイルを整える：**
   - `CLAUDE.md` の「このサイトについて」
   - `wrangler.jsonc` と `package.json` の `name`
4. **素材を Web 用にする：** 写真は `tools/media/photo.sh`、動画は `tools/media/make-loop.sh` を使う。元データはリポジトリに入れず、場所だけを `CLAUDE.md` に書く。
5. **デザイン案を作る：** 2の流れで、まずメインビジュアルを3〜4案作る。
6. **組み込む：** 決まった案を本番に組み込み、各セクションを中身に合わせて作る。
7. **公開する：** `npm run check:ready` を ✓ にしてから、`references/setup.md` の手順で公開する。

## 1. 依頼の大きさで進め方を分ける

| 依頼 | 進め方 |
|---|---|
| 文言・営業時間・リンクの変更 | `site.ts`（または `index.astro`）を直し、表記がそろっているかを確かめて4へ |
| 小さな見た目の直し | 3へ。直す前と後のスクショを見せる |
| 大きく変える（メインビジュアル、セクションの作り直し、ローディングなど新しい動き） | 2で数案を作ってから |

## 2. デザイン案を作る

1. `design/<テーマ>/a.html, b.html …` を作る。
   - 文言やヘッダーは本番のビルド（`dist/index.html`）から取るか、本番と同じにする。
   - 共通のCSSは1つのファイルにまとめる。
   - 本番のCSSや写真は `/public/css/site.css`、`/public/media/…` で読む。
2. ボードにして撮る。

   ```bash
   npm run build && npm run serve:design &
   npm run shot -- "http://127.0.0.1:5482/design/_board/board.html?p=/design/hero/a.html&t=A案 アーチ窓" --sizes 1600x900 --as design/hero/out/board-a.jpg --wait 4000
   ```

3. 動きの案は動画にする。アニメーションを1コマずつ進めて撮るので、毎回同じ結果になる。

   ```bash
   npm run record -- http://127.0.0.1:5482/design/loading/a.html --size 1280x800 --secs 6 --out design/loading/out/a.mp4
   ```

   コマの一覧（`a-frames.jpg`）で、自分でも確かめる。
4. ボードや動画を SendUserFile で送り、選んでもらう。調整の依頼は、案のファイルで直して撮り直す。
5. 選ばれなかった案も消さずに残す。

**これまでに好まれた作り方（迷ったときの出発点）：**

- **形とモチーフ：** 曲線と、お店のモチーフを使う。写真は角丸・アーチ・丸窓の枠に入れる。
- **見出し：** 小さな英字の斜体＋日本語。
- **動き：** 落ち着いた「じわじわ」した動きにする。勢いのある動きは嫌われた。
- **スマホ：** セクションは中身の高さで詰める。いちばんの行動は下部バーにまとめる。
- **アイコン：** 線アイコン（Lucide）のパスを、`Icon.astro` に手で足す。

## 3. 組み込む

- **事実：** `site.ts` だけを直す。ページ、JSON-LD、llms.txt、フッターは自動でそろう。
- **セクション：**
  - 足す・消す・名前を変えるときは、`SECTIONS` を直す。ヘッダー、見出し、フッターがそろって変わる。
  - `index.astro` の `id` は、`SECTIONS` の `id` と同じにする。
- **CSS：** `public/css/site.css` に書く。PC → タブレット（≤959px）→ スマホ（≤639px）の順にする。色とフォントは `THEME` のトークン（`--accent` など）を使う。
- **動き：**
  - スクロールで出す要素には `data-reveal`（写真は `data-reveal="photo"`）を付ける。順番は `style="--i: n"` で指定する。
  - `.is-still` のときと、`prefers-reduced-motion` のときは止める。
- **ループ動画：** `Film.astro` を使う。
- **外部の読み込み：** 外部の読み込み（埋め込み、予約フォーム、計測）を足したら、`public/_headers` のCSPに、その読み込み元を足す。

## 4. 確かめる

```bash
npm run build:fixture && npm run serve &
npm run shot -- http://127.0.0.1:5481/ --full --name top                 # 6つの幅で、ページ全体
npm run measure -- http://127.0.0.1:5481/ --sizes 390x844,375x812 --expr "document.documentElement.scrollWidth - innerWidth"   # 0 なら横にはみ出していない
npm run audit -- http://127.0.0.1:5481 / /news/ /news/sample-closed/ /404-check
npm run check:films        # ループ動画があるとき
```

- **スクショを見る：** 次の点を確かめる。たくさんの画像は ffmpeg の `tile` で1枚にまとめると見やすい。
  - 文字がはみ出していない。
  - 不自然な改行がない。
  - スマホに大きな空白がない。
  - 画像が空になっていない。
  - 下部バーと重なっていない。
- **iPhone Safari の注意点：** `CLAUDE.md` に書いた3点を、コードでも確かめる。
- **CSPを変えたとき：** `npm run preview:headers` を起動し、`npm run audit -- http://127.0.0.1:8788 /` を実行する。
- **公開前：** `npm run build && npm run check:ready` を実行する。

## 5. 見せる

- 主な幅（1440 と 390）のスクショや動画を SendUserFile で送る。
- 何を変えたかを、短く伝える。
- 確かめられなかったことも書く（例：実機のSafariでは見ていない）。

## 6. 公開する（ユーザーが「push」と言ってから）

```bash
git add -A && git commit -m "<何をどう変えたか、日本語で1行>"
git push origin main
gh api repos/<owner>/<repo>/commits/$(git rev-parse HEAD)/check-runs --jq '.check_runs[] | [.name,.status,.conclusion] | @tsv'
```

- **ビルドの結果：**
  - Cloudflare のビルド結果が出るまで、数分〜20分以上かかることがある。ポーリングで待ち続けない。
  - 失敗したら、ログを見て直す。
- **本番の確認：** ビルドが成功したら、`npm run audit -- https://<domain> / /news/` を実行する。
- **コミットの末尾：** コミットメッセージの最後に、Claude の共同作成者の行を入れる。

## 7. 困ったとき

- **独自ドメインが手元だけ開けない：** 取得直後のドメインは、ルーターやプロバイダーのDNS・セキュリティ機能が止めていることがある。`dig @1.1.1.1 <domain>` で引けて、`curl --resolve` で200が返るなら、サイトは正常。
- **iPhoneで動画が再生されない：** `Film.astro` と `site.js` の films の部分を使う（`muted` と `playsInline` をプロパティでも設定し、断られたら次のタッチで再試行する）。
- **ローカルにお知らせがない：** microCMSのキーがないため。`npm run build:fixture` で見本データ入りにする。
