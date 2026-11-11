# セキュリティ

## サイト側（リポジトリに入れる）

### `public/_headers`

Cloudflare Workers の静的アセットが読む。ファイルとしては配信されない。

```
/*
  Strict-Transport-Security: max-age=15552000
  X-Content-Type-Options: nosniff
  X-Frame-Options: DENY
  Referrer-Policy: strict-origin-when-cross-origin
  Permissions-Policy: camera=(), microphone=(), geolocation=(), payment=(), usb=(), browsing-topics=()
  Cross-Origin-Opener-Policy: same-origin
  Content-Security-Policy: default-src 'self'; script-src 'self' https://static.cloudflareinsights.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: https://images.microcms-assets.io; media-src 'self'; frame-src https://www.google.com; connect-src 'self' https://cloudflareinsights.com; object-src 'none'; base-uri 'self'; form-action 'self'; frame-ancestors 'none'; upgrade-insecure-requests
```

- **外部の読み込みを足したら、CSPに読み込み元を足す。** 例：Instagramの埋め込み、予約フォーム、別の計測。
- **CSPの中身：**
  - `script-src` に `https://static.cloudflareinsights.com` があるのは、Cloudflare Web Analytics を使うため。
  - `frame-src` に `https://www.google.com` があるのは、Googleマップを埋め込むため。
- **インラインの `<script>` は使わない。** `script-src 'self'` で止まる。head で先に動かしたい処理は `/js/xxx.js` に分けて読む。
- **確かめ方：** `npx wrangler dev --port 8788` を起動し、`audit.mjs http://127.0.0.1:8788 /` を実行する。公開後は本番のURLでも実行する。

### CMSの本文の無害化

`set:html` で出す前に、許可したタグと属性だけを残す。

- **許可するタグ：** p, br, h2〜h4, strong, em, b, i, u, s, a, ul, ol, li, blockquote, figure, figcaption, img, hr, table 類, span, div, code, pre
- **消すもの：** script, style, iframe, object, embed, template, noscript, textarea, select, svg, math（中身ごと）。`on*` 属性も消す。
- **URL：** 許可するのは `http(s):`, `mailto:`, `tel:`, 相対パス, `#` だけ。
- **リンク：** `target="_blank"` には `rel="noopener noreferrer"` を付ける。
- **説明文：** meta description などの抜粋も、無害化した後の本文から作る。script の中身が文字として混ざらないようにするため。

## ダッシュボード側（ユーザーが操作する。手順を案内する）

| どこ | やること |
|---|---|
| Cloudflare SSL/TLS | Always Use HTTPS をオンにし、Minimum TLS を 1.2 にする |
| Cloudflare DNS | DNSSEC を有効にし、表示される DS レコードを、ドメインを登録した会社に登録する |
| Cloudflare DNS（メールを使わないドメイン） | TXT `v=spf1 -all` と、`_dmarc` の TXT `v=DMARC1; p=reject;` を入れる |
| Cloudflare DNS（任意） | CAA を、Cloudflare が使う認証局に限定する |
| Worker | 独自ドメインにつないだら、workers.dev と Preview URLs をオフにする |
| Worker のビルド変数 | APIキーをシークレットにする |
| microCMS | APIキーを GET だけにする |
| Cloudflare / GitHub / ドメインの会社 / microCMS | 2段階認証をオンにする |
| ドメインの会社 | 移管ロックと自動更新を確かめる |
| GitHub | リポジトリを非公開にする。`.env` が履歴に入っていないかを確かめる（`git log --all -p -- .env` が空） |

## 点検するときのコマンド

```bash
npm audit                                  # 依存パッケージの脆弱性
git log --all --oneline -- .env .dev.vars  # 秘密のファイルが履歴にないか
curl -sI https://<domain>/ | grep -iE "strict|content-security|x-frame|referrer|permissions"
curl -sI http://<domain>/ | head -3        # http から https に転送されるか
dig +short DS <domain> @1.1.1.1            # DNSSEC の DS レコードがあるか
```
