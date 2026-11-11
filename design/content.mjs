// The copy every site-wide proposal uses (design/site/*.mjs), so the proposals differ only in design.
// Write it from the agreed structure and copy (構成・原稿案) before the site-wide round; facts come from src/lib/site.ts.
// When a proposal is chosen, this copy moves into src/pages/index.astro.
import { readFileSync } from 'node:fs';

const news = JSON.parse(readFileSync(new URL('../tools/fixtures/news.json', import.meta.url), 'utf8'));
const date = new Intl.DateTimeFormat('ja-JP', { timeZone: 'Asia/Tokyo', year: 'numeric', month: 'numeric', day: 'numeric' });

export default {
  /** the main visual's words (every main-visual proposal uses the same) */
  hero: {
    catch: ['いつもの、', 'ちょうどいい。'], // 【要差し替え】キャッチ（行ごとに1要素）
    photo: '/media/placeholder-hero.svg',
    photoAlt: '【要差し替え】お店の写真',
  },
  /** the latest posts (the sample posts until microCMS is connected) */
  news: news.slice(0, 3).map((n) => ({ id: n.id, title: n.title.trim(), date: date.format(new Date(n.publishedAt ?? n.createdAt)) })),
  menu: {
    lead: '【要差し替え】季節の野菜を使った、毎日変わる定食が中心です。',
    items: [
      { name: '日替わり定食', note: '季節の野菜をたっぷり使った、毎日変わる定食', photo: '/media/placeholder-menu-1.svg' },
      { name: 'おにぎりセット', note: 'お味噌汁と小鉢つき', photo: '/media/placeholder-menu-2.svg' },
      { name: 'コーヒー', note: '近所の焙煎所の豆を、一杯ずつ', photo: '/media/placeholder-menu-3.svg' },
    ],
  },
  about: {
    heading: '【要差し替え】まちの台所のような場所に',
    body: [
      '【要差し替え】お店のはじまりや、大事にしていることを2〜3文で。',
      'お店の人が話すような言葉で書きます。',
    ],
    photo: '/media/placeholder-about.svg',
  },
};
