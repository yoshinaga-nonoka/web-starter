# SEO・AEO（検索とAIの回答に出やすくする）

前提として、独自ドメインで公開する。workers.dev のままだと評価が積み上がらない。

## head（Base レイアウト）

- **title：** 「店名｜地名・業種（最寄り駅 徒歩◯分）」。ページごとに変える。
- **meta description：** 場所・業種・営業・特徴を、自然な1〜2文で書く。
- **canonical：** `new URL(Astro.url.pathname, Astro.site)` で作る。404 などは `noindex` にし、canonical は出さない。
- **OGP：**
  - `og:type`（記事は `article`）、`og:url`、`og:site_name`、`og:locale=ja_JP`
  - `og:image`（1200×630、絶対URL）と、width・height・alt
  - `twitter:card=summary_large_image`
- **html の lang：** `lang="ja"` を付ける。

## 構造化データ（JSON-LD、`src/lib/seo.ts`）

`site.ts` の事実から組み立てる。ページの表記と食い違わないようにするため。

### トップページ

`@graph` に `WebSite` と、お店のノードを入れる。お店のノードは、業種に合った型にする（`CafeOrCoffeeShop`、`Bakery`、`Restaurant`、`LocalBusiness` など）。

お店のノードに入れる項目：

| 項目 | 中身 |
|---|---|
| `@id` | `/#shop`。記事の author と publisher から参照する |
| `name`、`alternateName` | 店名と、読み方・表記ゆれ |
| `description`、`url`、`image`、`logo` | 説明文、URL、画像、ロゴ |
| `address` | `PostalAddress`（郵便番号、都道府県、市区町村、番地） |
| `containedInPlace` | 間借りや館内の店なら、その建物 |
| `hasMap` | 地図のURL |
| `openingHoursSpecification` | 曜日。祝日は `https://schema.org/PublicHolidays` |
| `servesCuisine` | 料理の種類 |
| `amenityFeature` | Wi-Fi・電源など |
| `sameAs` | Instagram など |
| `potentialAction` | 注文や予約の `OrderAction` / `ReserveAction` |

### 記事

`NewsArticle` と `BreadcrumbList`（トップ › お知らせ › 記事）を入れ、お店のノードも添える。`NewsArticle` には次を入れる。

- headline
- datePublished、dateModified（microCMS の revisedAt または updatedAt）
- image

## 機械が読むファイル（Astro のエンドポイントで、ビルド時に作る）

- **`/sitemap.xml`：** トップ、一覧、全記事。`lastmod` も付ける。
- **`/robots.txt`：** `User-agent: *` `Allow: /` と、`Sitemap:` の行。
- **`/llms.txt`：** AIアシスタント向け。お店の情報、ページの一覧、最近のお知らせ5件を、平易な箇条書きにする。

## 公開後にユーザーがやること

1. **Google Search Console：**
   1. ドメインプロパティで登録する。TXTレコードは Cloudflare の DNS に入れる。
   2. `sitemap.xml` を送信する。
2. **Googleビジネスプロフィール：** ウェブサイト欄を独自ドメインにする。営業時間を、サイトと同じにする。
3. **Instagram などのプロフィール：** URLを独自ドメインにする。
4. **Cloudflare の AI Crawl Control（Bot対策）：** AIのクローラーを止めていないかを確かめる。止めていると、AIの回答に出なくなる。

## 確かめる

```bash
curl -s https://<domain>/ | grep -oE '<title>[^<]*|rel="canonical" href="[^"]*"|og:image" content="[^"]*"'
curl -s https://<domain>/robots.txt https://<domain>/sitemap.xml https://<domain>/llms.txt | head -40
```

JSON-LD は、Google のリッチリザルト テスト（https://search.google.com/test/rich-results）で確かめる。
