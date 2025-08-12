// 작은 헬퍼들
const $ = (sel, el=document) => el.querySelector(sel);
const $$ = (sel, el=document) => [...el.querySelectorAll(sel)];

// 공통: 우측 사이드바/활성화 상태 로드
async function loadSidebar() {
  const holder = document.createElement('div');
  document.body.appendChild(holder);
  const res = await fetch('/partials/sidebar.html');
  holder.outerHTML = await res.text();
  setActiveNav();
}

function setActiveNav() {
  const path = location.pathname.replace(/\/$/, '/');
  $$('[data-nav]').forEach(a => {
    const href = new URL(a.href);
    const same = href.pathname.replace(/\/$/, '/') === path;
    a.classList.toggle('active', same);
  });
}

// 홈 데이터 로드 & 타임라인/요약 렌더
async function loadHomeData() {
  const res = await fetch('/data/site.json');
  const D = await res.json();

  // Interests
  const interests = $('#interests');
  if (interests) interests.innerHTML = D.interests.map(x=>`<span class="tag">${x}</span>`).join(' ');

  // Now
  const now = $('#nowlist');
  if (now) now.innerHTML = D.now.map(x=>`<li>${x}</li>`).join('');

  // Timeline
  const eduCol = $('#eduCol');
  const careerCol = $('#careerCol');
  if (eduCol) D.education.forEach(it=>{
    const div = document.createElement('div');
    div.className='titem card';
    div.innerHTML = `<div class="when">${it.when}</div><strong>${it.title}</strong><div class="muted">${it.desc||''}</div>`;
    eduCol.appendChild(div);
  });
  if (careerCol) D.career.forEach(it=>{
    const div = document.createElement('div');
    div.className='titem card';
    div.innerHTML = `<div class="when">${it.when}</div><strong>${it.title}</strong><div class="muted">${it.desc||''}</div>`;
    careerCol.appendChild(div);
  });

  // 프리뷰들
  const [pubs, projs, news] = await Promise.all([
    fetch('/data/publications.json').then(r=>r.json()),
    fetch('/data/projects.json').then(r=>r.json()),
    fetch('/news/posts.json').then(r=>r.json())
  ]);
  if ($('#pubPreview')) renderPublications(pubs, '#pubPreview', 3);
  if ($('#projPreview')) renderProjects(projs, '#projPreview', 3);
  if ($('#newsPreview')) renderNews(news, '#newsPreview', 3);
}

// 페이지 로드시 공통 실행
window.addEventListener('DOMContentLoaded', async () => {
  await loadSidebar();
  // 각 페이지에서 필요한 렌더 호출은 개별 HTML에서 수행
});