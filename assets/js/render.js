function rowHTML({thumb,title,meta,desc,links,tags,pdf,repo,authors,venue,slug,date}, type){
  const thumbHTML = thumb ? `<img class="thumb" src="${thumb}" alt="${title} 썸네일"/>` : `<div class="thumb card" aria-hidden="true"></div>`;
  let body = `<h3>${title}</h3>`;
  if (type==='pub') {
    if (authors) body += `<div class='meta'>${authors}</div>`;
    if (venue) body += `<div class='meta'>${venue}</div>`;
    if (links) {
      body += `<div class='meta'>`+
        (links.pdf?`<a class='btn' href='${links.pdf}' download>PDF</a>`:'')+
        (links.arxiv?` <a class='btn' href='${links.arxiv}' target='_blank' rel='noopener'>arXiv</a>`:'')+
        (links.code?` <a class='btn' href='${links.code}' target='_blank' rel='noopener'>Code</a>`:'')+
        (links.bibtex?` <button class='btn' onclick='navigator.clipboard.writeText(${JSON.stringify(links.bibtex)});alert("BibTeX 복사 완료")'>Cite</button>`:'')+
        `</div>`;
    }
  }
  if (type==='proj') {
    if (meta) body += `<div class='meta'>${meta}</div>`;
    if (desc) body += `<p class='muted'>${desc}</p>`;
    if (tags?.length) body += `<div>${tags.map(t=>`<span class='tag'>${t}</span>`).join(' ')}</div>`;
    body += `<div class='meta'>`+
      (pdf?`<a class='btn' href='${pdf}' download>PDF 다운로드</a>`:'')+
      (repo?` <a class='btn' href='${repo}' target='_blank' rel='noopener'>Repo</a>`:'')+
      `</div>`;
  }
  if (type==='news') {
    body += `<div class='meta'>${date}</div>`;
    body += `<p class='muted'>${desc||''}</p>`;
    body += `<div class='meta'><a class='btn' href='/news/post.html?slug=${slug}'>읽기</a></div>`;
  }
  return `<div class='row'>${thumbHTML}<div>${body}</div></div>`;
}

function renderPublications(items, targetSel, limit=null){
  const el = document.querySelector(targetSel);
  if (!el) return;
  const list = limit? items.slice(0,limit) : items;
  el.innerHTML = list.map(p=>rowHTML(p,'pub')).join('');
}
function renderProjects(items, targetSel, limit=null){
  const el = document.querySelector(targetSel);
  if (!el) return;
  const list = limit? items.slice(0,limit) : items;
  el.innerHTML = list.map(p=>rowHTML(p,'proj')).join('');
}
function renderNews(items, targetSel, limit=null){
  const el = document.querySelector(targetSel);
  if (!el) return;
  const arr = items.sort((a,b)=>b.date.localeCompare(a.date));
  const list = limit? arr.slice(0,limit) : arr;
  el.innerHTML = list.map(n=>rowHTML({
    thumb:n.thumb,title:n.title,desc:n.summary,slug:n.slug,date:n.date
  },'news')).join('');
}

async function renderPage(name){
  if (name==='home') {
    await loadHomeData();
  } else if (name==='publications') {
    const items = await fetch('/data/publications.json').then(r=>r.json());
    renderPublications(items, '#pubList');
  } else if (name==='projects') {
    const items = await fetch('/data/projects.json').then(r=>r.json());
    renderProjects(items, '#projList');
  } else if (name==='news-list') {
    const items = await fetch('/news/posts.json').then(r=>r.json());
    renderNews(items, '#newsList');
  } else if (name==='news-post') {
    const params = new URLSearchParams(location.search);
    const slug = params.get('slug');
    if (!slug) return;
    const meta = await fetch('/news/posts.json').then(r=>r.json());
    const item = meta.find(m=>m.slug===slug);
    const src = `/news/posts/${slug}.md`;
    const md = await fetch(src).then(r=>r.text());
    // marked.js (CDN) 사용
    const html = window.marked.parse(md);
    const post = document.querySelector('#newsPost');
    post.innerHTML = `<div class='card' style='padding:16px'><div class='muted'>${item?.date||''}</div><h1>${item?.title||slug}</h1><div class='content'>${html}</div><p><a class='btn' href='/news/'>← 모든 글</a></p></div>`;
  }
}