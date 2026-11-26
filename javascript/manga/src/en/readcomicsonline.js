const mangayomiSources = [{
  id: 817629301,
  name: 'Read Comics Online',
  lang: 'en',
  baseUrl: 'https://readcomicsonline.ru',
  apiUrl: '',
  iconUrl: 'https://readcomicsonline.ru/favicon.ico',
  typeSource: 'single',
  itemType: 0,
  version: '0.1.0',
  pkgPath: 'manga/src/en/readcomicsonline.js'
}];

class DefaultExtension extends MProvider {
  constructor() { super(); this.client = new Client(); }
  getHeaders() { return { Referer: 'https://readcomicsonline.ru/' }; }
  absolute(url) {
    if (!url) return '';
    if (url.startsWith('//')) return 'https:' + url;
    if (/^https?:\/\//i.test(url)) return url;
    return this.source.baseUrl + (url.startsWith('/') ? '' : '/') + url;
  }
  async document(url) {
    const res = await this.client.get(this.absolute(url), this.getHeaders());
    const body = res.body || '';
    if (/performing security verification|just a moment\.\.\.|cf-challenge/i.test(body)) {
      throw new Error('Website security verification required. Open the source in WebView and try again.');
    }
    return new Document(body);
  }
  async catalog(url) {
    const doc = await this.document(url);
    const list = [];
    const seen = {};
    // Catalog uses cards; search uses linked cards.
    for (const card of doc.select('main div.group, main a.group')) {
      let linkElement = card.selectFirst('a[href*="/comic/"]');
      let link = linkElement ? linkElement.attr('href') : card.attr('href');
      link = this.absolute(link);
      if (!/\/comic\/[^/]+\/?(?:\?.*)?$/.test(link) || seen[link]) continue;
      const img = card.selectFirst('img');
      const name = linkElement ? linkElement.text.trim() : (img ? img.attr('alt') : card.text.trim());
      if (!name) continue;
      seen[link] = true;
      list.push({ name, link, imageUrl: img ? this.absolute(img.attr('src')) : '' });
    }
    return { list, hasNextPage: !!doc.selectFirst('a[rel=next]') };
  }
  async getPopular(page) { return this.catalog('/comic-list?sort=views&page=' + page); }
  async getLatestUpdates(page) { return this.catalog('/comic-list?sort=latest&page=' + page); }
  async search(query, page) {
    return this.catalog('/advanced-search?name=' + encodeURIComponent(query || '') + '&page=' + page);
  }
  getFilterList() { return []; }
  async getDetail(url) {
    const doc = await this.document(url);
    const title = doc.selectFirst('main h1');
    const image = doc.selectFirst('main img');
    const synopsis = doc.selectFirst('main div.bg-ink-900 p');
    const genres = doc.select('main dl a').map(e => e.text.trim());
    const statuses = doc.select('main span');
    let status = 5;
    for (const el of statuses) {
      const s = el.text.trim().toLowerCase();
      if (s === 'ongoing') { status = 0; break; }
      if (s === 'complete' || s === 'completed') { status = 1; break; }
    }
    const chapters = [];
    for (const ch of doc.select('main section a[href*="/comic/"]')) {
      const link = this.absolute(ch.attr('href'));
      const spans = ch.select('span');
      const name = spans.length ? spans[0].text.trim() : ch.text.trim();
      if (!link || !name) continue;
      const date = spans.length > 1 ? Date.parse(spans[1].text.trim()) : NaN;
      chapters.push({ name, url: link, dateUpload: isNaN(date) ? null : String(date) });
    }
    return { name: title ? title.text.trim() : '', imageUrl: image ? this.absolute(image.attr('src')) : '', description: synopsis ? synopsis.text.trim() : '', genre: genres, status, chapters };
  }
  async getPageList(url) {
    const doc = await this.document(url);
    const imgs = doc.select('#reader-all img');
    const pages = imgs.map(img => this.absolute(img.attr('src'))).filter(Boolean);
    if (!pages.length) {
      const single = doc.selectFirst('#reader-img');
      if (single && single.attr('src')) pages.push(this.absolute(single.attr('src')));
    }
    if (!pages.length) throw new Error('No comic pages found. The website may have changed or require verification.');
    return pages.map(page => ({ url: page, headers: this.getHeaders() }));
  }
}
