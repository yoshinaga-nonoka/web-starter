# design/：デザイン案

見た目は、2段階で決めます。どちらも案をここに作り、比べてもらって選んでもらいます。

1. **メインビジュアル案（`mv/`）**
   - 最初の1画面を4案つくる。構図・色・書体・モチーフを変える。
   - 選ばれた案をブラッシュアップする（本番の原稿、モーション、細部）。
2. **サイト全体案（`site/`）**
   - 決まったメインビジュアルはそのまま使い、2画面目以降の組み方を4案つくる。
   - 選ばれた案を本番（`src/`）に組み込む。

```
design/
├ rounds.json      段階の一覧（新しい順）と、決まった案（picked）
├ content.mjs      どの案も同じ原稿（構成・原稿案から書く）
├ _kit.mjs         案を書くための部品（icon, btn, title, img, nw, esc）。本番の部品と同じHTMLを出す
├ mv/a.mjs …       メインビジュアル案（1案1ファイル）→ a.html と shots/ を生成
├ site/a.mjs …     サイト全体案 → a.html と shots/ を生成
├ index.html       比較ページ（生成）。カードを開くと実寸で見られる
└ og.html          SNS共有の画像（public/media/og.jpg）の元
```

## コマンド

```bash
npm run design              # サイトをビルド → 全案のページ・スクショ（PC 1440 / スマホ 390）・比較ページを作る
npm run design -- --only mv/b --no-shots   # 1案だけ、撮らずに
npm run serve:design        # http://127.0.0.1:5482/ で比較ページ（design/ の上に public/ を重ねて配信）
npm run design:publish      # 共有用URLに公開（Cloudflare の別 Worker「<name>-design」。初回は npx wrangler login）
```

## 案のファイルの書き方

```js
// design/mv/a.mjs
export default {
  name: 'アーチ窓',                       // 比較ページの案の名前
  layout: '左に文字＋右に写真',             // 構図をひとことで
  summary: '…どんな印象の案か、1〜2文…',
  colors: { bg: '#faf6f0', accent: '#a4532a' },   // THEME（src/lib/site.ts）から変えるものだけ
  fonts: { display: 'Zen Old Mincho:500', text: 'Zen Kaku Gothic New:400;500', en: 'Cormorant Garamond:ital,wght@1,500' },
  css: `…この案のCSS（本番の /css/site.css の上に重なる）…`,
  hero: ({ site, content, kit }) => `<section class="mv-a">…</section>`,          // mv の案
  // sections: ({ site, content, kit, mv }) => `<section id="news">…</section>…`, // site の案（メインビジュアルのあと）
};
```

- **ページの組み立て：**
  - ヘッダー・フッター・スマホの下部バーは、本番のビルドからそのまま入る。
  - `/css/site.css` と `/js/site.js` も読み込まれる。そのため、ボタン、`data-reveal` のモーション、「動きを止める」は本番と同じに動く。
- **site の案：** 自分の `colors`・`fonts`・`css` は、決まったメインビジュアルの上に重なる。
- **セクションの id：** `src/lib/site.ts` の `SECTIONS` の id（news, menu, about, access …）と同じにする。ヘッダーのメニューが、そのセクションへ飛べる。
- **クラス名の頭：** 案ごとに付けて、ぶつからないようにする（`mv-a__…`、`sa__…` など）。
- **選ばれた案を本番へ：** `css` を `public/css/site.css` へ、マークアップを `src/pages/index.astro`（と部品）へ移す。
- **案を残す：** 選ばれなかった案も消さずに残す（あとで「やっぱりBの曲線を」と言われたときのため）。
- **サンプル：** テンプレートに入っているサンプル（a〜d）は、作り方の見本。新しいサイトでは上書きし、使わない案は消す。
