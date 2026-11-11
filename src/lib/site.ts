// ─────────────────────────────────────────────────────────────────────────────────────────────────────────────────────
// このサイトの事実と見た目の設定。新しいサイトを作るときは、まずこのファイルを書き換える。
// ページ・フッター・構造化データ（seo.ts）・llms.txt・サイトマップは、すべてここを読むので、表記が食い違わない。
// 「【要差し替え】」が残っていると `npm run check:ready` が知らせる。
// ─────────────────────────────────────────────────────────────────────────────────────────────────────────────────────

export const SITE = {
  /** 店名・事業者名 */
  name: '【要差し替え】サンプル食堂',
  /** 読み方や表記ゆれ（検索・AI向け） */
  alternateNames: ['サンプルしょくどう'],
  /** 公開URL（独自ドメイン）。SITE_URL のビルド変数があればそちらが優先 */
  url: 'https://example.com',
  /** schema.org の型: CafeOrCoffeeShop, Restaurant, Bakery, BarOrPub, Store, HairSalon, BeautySalon, MedicalClinic,
   *  ProfessionalService, EducationalOrganization, LocalBusiness など */
  type: 'Restaurant',
  /** ひとことの紹介（フッター、ヒーローの上） */
  tagline: '【要差し替え】まちの小さな食堂',
  /** 検索結果・SNS・AIに出る説明文。場所・業種・営業・特徴を自然な1〜2文で */
  description: '【要差し替え】〇〇駅から徒歩5分の小さな食堂。季節の野菜を使った日替わり定食を出しています。',
  /** 料理・サービスの種類（schema.org servesCuisine など） */
  offers: ['定食', 'コーヒー'],
  /** 設備（schema.org amenityFeature） */
  amenities: ['Wi-Fi'],
  lang: 'ja',
} as const;

export const ADDRESS = {
  postalCode: '000-0000',
  region: '北海道',
  locality: '札幌市中央区',
  street: '【要差し替え】北1条西1丁目1-1',
  building: '〇〇ビル 1階',
  /** 最寄り駅からの道のり */
  access: '【要差し替え】地下鉄〇〇線 〇〇駅から徒歩5分',
} as const;
export const ADDRESS_TEXT = `${ADDRESS.region}${ADDRESS.locality}${ADDRESS.street}`;

/** 営業時間。text はページの表記、spec は構造化データ（曜日は Monday…Sunday, PublicHolidays） */
export const HOURS = {
  days: '【要差し替え】火〜土（日月休み）',
  time: '11:00〜15:00',
  note: 'ラストオーダー 14:30',
  spec: [{ days: ['Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'], opens: '11:00', closes: '15:00' }],
} as const;

/** 外部のリンク。使わないものは空文字にすると、ボタンやリンクが出なくなる */
export const LINKS = {
  /** Googleマップの経路 */
  maps: 'https://www.google.com/maps/dir/?api=1&destination=' + encodeURIComponent(ADDRESS_TEXT),
  /** Googleマップの埋め込み（「地図を埋め込む」の iframe の src） */
  mapEmbed: '',
  instagram: '',
  /** 予約・注文（いちばんの行動に使うなら PRIMARY_ACTION に） */
  reserve: '',
  order: '',
  tel: '',
} as const;

/** いちばんの行動。ヘッダーの右とスマホの下部バーに出る */
export const PRIMARY_ACTION = { label: 'Map', href: LINKS.maps, icon: 'map-pin' } as const;
/** 2番目の行動（スマホの下部バーの右）。不要なら null */
export const SECONDARY_ACTION: { label: string; href: string; icon: 'instagram' | 'calendar' | 'shopping-bag' | 'phone' } | null =
  LINKS.instagram ? { label: 'Instagram', href: LINKS.instagram, icon: 'instagram' } : null;

/** トップページのセクション（ページの順）。ヘッダーのメニュー・各見出し・フッターのページ一覧が、この名前を使う。
 *  en は見出しの小さな英字、ja は日本語、nav はメニューで短くしたいときだけ */
export const SECTIONS = [
  { id: 'news', en: 'News', ja: 'お知らせ', icon: 'bell' },
  { id: 'menu', en: 'Menu', ja: 'メニュー', icon: 'utensils' },
  { id: 'about', en: 'About', ja: 'わたしたちについて', nav: 'お店について', icon: 'store' },
  { id: 'access', en: 'Access', ja: '営業時間・アクセス', nav: 'アクセス', icon: 'map-pin' },
] as const;
export type SectionId = (typeof SECTIONS)[number]['id'];
export const section = (id: SectionId) => SECTIONS.find((s) => s.id === id)!;
export const navName = (s: (typeof SECTIONS)[number]) => ('nav' in s ? s.nav : s.ja);

/** 見た目。色はロゴやお店の写真から取る（ボタンの色は白文字が読める濃さに: コントラスト 4.5 以上） */
export const THEME = {
  bg: '#faf6f0',        // 地の色
  surface: '#f0e8dc',   // 一段沈んだ面（カード、フッター）
  ink: '#2f2a24',       // 文字
  muted: '#6f655a',     // 補足の文字
  accent: '#a4532a',    // ボタン・強調（白文字が乗る）
  accentInk: '#ffffff',
  inverseBg: '#2f2a24', // 濃い面（アクセスの背景など）
  inverseInk: '#faf6f0',
  /** Google Fonts の family 指定。display は見出し、text は本文、en は見出しの小さな英字 */
  fonts: {
    display: { family: 'Zen Old Mincho', weights: '500', fallback: '"Hiragino Mincho ProN", "Yu Mincho", serif' },
    text: { family: 'Zen Kaku Gothic New', weights: '400;500', fallback: '"Hiragino Sans", "Yu Gothic", sans-serif' },
    en: { family: 'Cormorant Garamond', weights: 'ital,wght@1,500', fallback: '"Times New Roman", serif' },
  },
  /** 角丸: 0（四角）〜 24px */
  radius: '16px',
} as const;
