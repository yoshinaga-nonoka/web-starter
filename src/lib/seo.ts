// Search and answer engines: the business and its pages as schema.org JSON-LD, built from the same facts the pages
// show (site.ts), so the two never disagree. Every URL comes from the site's public address (astro.config).
import { ADDRESS, ADDRESS_TEXT, HOURS, LINKS, SITE } from './site';
import { coverOf, type News } from './microcms';

const abs = (path: string, site: URL) => new URL(path, site).href;

/** The business: its address, hours, links and what it offers. */
export function businessNode(site: URL) {
  const sameAs = [LINKS.instagram].filter(Boolean);
  return {
    '@type': SITE.type,
    '@id': abs('/#business', site),
    name: SITE.name,
    alternateName: SITE.alternateNames,
    description: SITE.description,
    url: abs('/', site),
    image: [abs('/media/og.jpg', site)],
    logo: abs('/media/logo.png', site),
    address: {
      '@type': 'PostalAddress',
      postalCode: ADDRESS.postalCode,
      addressRegion: ADDRESS.region,
      addressLocality: ADDRESS.locality,
      streetAddress: [ADDRESS.street, ADDRESS.building].filter(Boolean).join(' '),
      addressCountry: 'JP',
    },
    hasMap: LINKS.maps,
    ...(LINKS.tel && { telephone: LINKS.tel }),
    openingHoursSpecification: HOURS.spec.map((h) => ({
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: h.days.map((d) => `https://schema.org/${d}`),
      opens: h.opens,
      closes: h.closes,
    })),
    ...(SITE.offers.length && { servesCuisine: SITE.offers }),
    ...(SITE.amenities.length && {
      amenityFeature: SITE.amenities.map((name) => ({ '@type': 'LocationFeatureSpecification', name, value: true })),
    }),
    ...(sameAs.length && { sameAs }),
    ...(LINKS.reserve && { potentialAction: { '@type': 'ReserveAction', target: LINKS.reserve, name: '予約する' } }),
    ...(!LINKS.reserve && LINKS.order && { potentialAction: { '@type': 'OrderAction', target: LINKS.order, name: '注文する' } }),
    areaServed: ADDRESS_TEXT,
  };
}

export function websiteNode(site: URL) {
  return { '@type': 'WebSite', '@id': abs('/#website', site), url: abs('/', site), name: SITE.name, inLanguage: SITE.lang,
    publisher: { '@id': abs('/#business', site) } };
}

/** The top page: the site and the business. */
export function homeJsonLd(site: URL) {
  return { '@context': 'https://schema.org', '@graph': [websiteNode(site), businessNode(site)] };
}

/** A news post: the article, and where it sits (top › お知らせ › the post). */
export function articleJsonLd(item: News, url: URL, site: URL) {
  const cover = coverOf(item);
  const published = item.publishedAt ?? item.createdAt;
  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'NewsArticle',
        headline: item.title.trim(),
        datePublished: published,
        dateModified: item.revisedAt ?? item.updatedAt ?? published,
        image: [cover ? new URL(cover.url, site).href : abs('/media/og.jpg', site)],
        mainEntityOfPage: url.href,
        inLanguage: SITE.lang,
        author: { '@id': abs('/#business', site) },
        publisher: { '@id': abs('/#business', site) },
      },
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: SITE.name, item: abs('/', site) },
          { '@type': 'ListItem', position: 2, name: 'お知らせ', item: abs('/news/', site) },
          { '@type': 'ListItem', position: 3, name: item.title.trim(), item: url.href },
        ],
      },
      businessNode(site),
    ],
  };
}
