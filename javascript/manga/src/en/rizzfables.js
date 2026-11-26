const mangayomiSources = [{
  "id": 817629302,
  "name": "Rizz Fables",
  "lang": "en",
  "baseUrl": "https://rizzfables.com",
  "apiUrl": "",
  "iconUrl": "https://rizzfables.com/favicon.ico",
  "typeSource": "single",
  "itemType": 0,
  "version": "0.1.0",
  "pkgPath": "manga/src/en/rizzfables.js"
}];

class DefaultExtension extends MProvider {
  constructor() { super(); this.client = new Client(); }
  getHeaders() { return { Referer: 'https://rizzfables.com/' }; }
  absolute(value) {
    const url = String(value || '').trim();
    if (!url) return '';
    if (url.startsWith('//')) return 'https:' + url;
    if (/^https?:\/\//i.test(url)) return url;
    return 'https://rizzfables.com' + (url.startsWith('/') ? '' : '/') + url;
  }
  async document(url) {
    const response = await this.client.get(this.absolute(url), this.getHeaders());
    const body = response.body || '';
    if (/performing security verification|just a moment\.\.\.|cf-challenge/i.test(body)) {
      throw new Error('Rizz Fables requires verification. Open the source WebView and retry.');
    }
    return new Document(body);
  }
  async catalog(query, page) {
    if (Number(page) > 1) return { list: [], hasNextPage: false };
    const doc = await this.document('/series');
    const cards = doc.select('#set_bs .bsx a');
    if (!cards.length) throw new Error('No series found. The site may require verification or its layout may have changed.');
    const term = String(query || '').trim().toLowerCase();
    const list = [];
    for (const card of cards) {
      const image = card.selectFirst('img');
      const title = card.attr('title') || (image ? image.attr('alt') : '');
      const link = this.absolute(card.attr('href'));
      if (!title || !link || (term && !title.toLowerCase().includes(term))) continue;
      list.push({ name: title.trim(), link, imageUrl: image ? this.absolute(image.attr('src')) : '' });
    }
    return { list, hasNextPage: false };
  }
  async getPopular(page) { return this.catalog('', page); }
  async getLatestUpdates(page) { return this.catalog('', page); }
  async search(query, page) { return this.catalog(query, page); }
  getFilterList() { return []; }
  async getDetail(url) {
    const doc = await this.document(url);
    const first = selector => doc.selectFirst(selector);
    const text = selector => { const node = first(selector); return node ? node.text.trim() : ''; };
    const img = first('.thumb img');
    const genre = doc.select('.mgen a').map(node => node.text.trim()).filter(Boolean);
    const chapters = [];
    for (const link of doc.select('#chapterlist li a')) {
      const name = link.selectFirst('.chapternum');
      const date = link.selectFirst('.chapterdate');
      const timestamp = date ? Date.parse(date.text.trim()) : NaN;
      const chapterUrl = this.absolute(link.attr('href'));
      if (name && chapterUrl) chapters.push({ name: name.text.trim().replace(/\s+/g, ' '), url: chapterUrl, dateUpload: isNaN(timestamp) ? null : String(timestamp) });
    }
    if (!chapters.length) throw new Error('No chapters found. The site may have changed or require verification.');
    return { name: text('h1.entry-title'), imageUrl: img ? this.absolute(img.attr('src')) : '', description: text('#description-container'), genre, status: 5, chapters };
  }
  async getPageList(url) {
    const doc = await this.document(url);
    const pages = [];
    for (const img of doc.select('#readerarea > img')) {
      const src = this.absolute(img.attr('data-src') || img.attr('src'));
      if (src) pages.push({ url: src, headers: this.getHeaders() });
    }
    if (!pages.length) throw new Error('No chapter images found. The site may have changed or require verification.');
    return pages;
  }
}
