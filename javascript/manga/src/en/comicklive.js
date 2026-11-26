// Adapted from keiyoushi/extensions-source Comick (Unoriginal), Apache-2.0.
// This implementation uses the site's public browse and chapter endpoints.
const mangayomiSources = [{"id":817629303,"name":"Comick.live (Unofficial)","lang":"en","baseUrl":"https://comick.live","apiUrl":"","iconUrl":"https://comick.live/favicon.ico","typeSource":"single","itemType":0,"version":"0.1.0","pkgPath":"manga/src/en/comicklive.js"}];
class DefaultExtension extends MProvider {
  constructor() { super(); this.client = new Client(); this.cursors = {}; }
  getHeaders() { return { Referer: 'https://comick.live/' }; }
  async request(path) {
    const url = /^https?:\/\//i.test(path) ? path : 'https://comick.live' + path;
    const response = await this.client.get(url, this.getHeaders());
    const body = response.body || '';
    if (/performing security verification|just a moment\.\.\.|cf-challenge/i.test(body)) throw new Error('Website verification required; open the source WebView and retry.');
    return body;
  }
  async json(path) { try { return JSON.parse(await this.request(path)); } catch (e) { throw new Error('Comick.live returned an unexpected response: ' + e); } }
  list(items) { return (items || []).filter(x => x && x.slug && x.title).map(x => ({ name:x.title, link:'https://comick.live/comic/' + x.slug, imageUrl:x.default_thumbnail || '' })); }
  async getPopular(page) {
    page = Number(page); if (page > 6) return {list:[],hasNextPage:false};
    const day = [7,30,90,7,30,90][page-1] || 7;
    const type = page <= 3 ? 'follow' : 'most_follow_new';
    const data = await this.json('/api/comics/top?day=' + day + '&type=' + type);
    return {list:this.list(data.data),hasNextPage:page<6};
  }
  async paged(kind, query, page) {
    page = Number(page); const key = kind + ':' + (query || '');
    if (page === 1) this.cursors[key] = {};
    const cursor = page > 1 && this.cursors[key] ? this.cursors[key][page] : null;
    if (page > 1 && !cursor) return {list:[],hasNextPage:false};
    let path = kind === 'latest' ? '/api/chapters/latest?order=new&page=' + page : '/api/search?showAll=false&exclude_mylist=false&type=comic' + (query ? '&q=' + encodeURIComponent(query.trim()) : '');
    if (cursor) path += '&cursor=' + encodeURIComponent(cursor);
    const data = await this.json(path);
    if (!Array.isArray(data.data)) throw new Error('Unexpected comic list format.');
    if (data.next_cursor) this.cursors[key][page+1] = data.next_cursor;
    return {list:this.list(data.data),hasNextPage:!!data.next_cursor};
  }
  async getLatestUpdates(page) { return this.paged('latest','',page); }
  async search(query,page) { if (query && query.trim().length < 3) throw new Error('Search needs at least 3 characters.'); return this.paged('search',query,page); }
  getFilterList() { return []; }
  dataScript(html,id) {
    const match = html.match(new RegExp('<script\\b[^>]*\\bid=["\\\']' + id + '["\\\'][^>]*>([\\s\\S]*?)<\\/script>', 'i'));
    if (!match) throw new Error('Could not find ' + id + ' on the page.');
    return JSON.parse(match[1].trim());
  }
  async getDetail(url) {
    const slug = String(url).split('?')[0].replace(/\/$/,'').split('/').pop();
    const data = this.dataScript(await this.request('/comic/' + slug), 'comic-data');
    const chapters = [];
    let last = 1;
    for (let page=1;page<=last && page<=100;page++) {
      const result = await this.json('/api/comics/' + encodeURIComponent(slug) + '/chapter-list?lang=en&page=' + page);
      if (!Array.isArray(result.data)) throw new Error('Unexpected chapter list format.');
      last = Number(result.pagination && result.pagination.last_page) || 1;
      for (const ch of result.data) {
        if (ch.lang !== 'en' || !ch.hid) continue;
        const number = ch.chap == null ? '' : String(ch.chap);
        const date = Date.parse(ch.created_at || '');
        chapters.push({name:(ch.vol ? 'Vol. '+ch.vol+' ' : '')+'Ch. '+number+(ch.title ? ': '+ch.title : ''),url:'https://comick.live/comic/'+slug+'/'+ch.hid+'-chapter-'+number+'-'+ch.lang,dateUpload:isNaN(date)?null:String(date),scanlator:(ch.group_name || []).join(', ')});
      }
    }
    const status = {1:0,2:data.translation_completed?1:4,3:3,4:2}[data.status];
    const description = new Document('<div>'+(data.desc || '')+'</div>').selectFirst('div');
    return {name:data.title || '',imageUrl:data.default_thumbnail || '',description:description ? description.text : '',author:(data.authors || []).map(x=>x.name).join(', '),artist:(data.artists || []).map(x=>x.name).join(', '),genre:(data.md_comic_md_genres || []).map(x=>x.md_genres && x.md_genres.name).filter(Boolean),status:status === undefined ? 5 : status,chapters};
  }
  async getPageList(url) {
    const data = this.dataScript(await this.request(url), 'sv-data');
    const images = data.chapter && data.chapter.images || [];
    const pages = images.map(x=>x.url).filter(Boolean);
    if (!pages.length) throw new Error('No readable images found.');
    return pages.map(url=>({url,headers:this.getHeaders()}));
  }
}
