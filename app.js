const $ = (id) => document.getElementById(id);
const screen = $('screen');
const dialog = $('dialog');
const money = (n) => n.toLocaleString('ru-RU').replace(/\s/g, ' ') + ' ₸';
const key = 'abai-travel-v1';
const initial = () => ({ lang:'ru', owned:{}, subscription:false, reviews:{}, finishedAt:{} });
let state = initial();
try { state = {...state, ...JSON.parse(localStorage.getItem(key))}; } catch {}
const persist = () => { try { localStorage.setItem(key, JSON.stringify(state)); } catch {} };
const tr = () => copy[state.lang];
const local = (values) => values[state.lang === 'kk' ? 1 : 0];
const image = (name) => 'assets/' + name + '.webp';
const symbol = {
  arrow:'M4 12h15m-6-6 6 6-6 6', back:'M20 12H5m6 6-6-6 6-6',
  map:'m3 6 6-3 6 3 6-3v15l-6 3-6-3-6 3zm6-3v15m6-12v15',
  route:'M7 17h10a3 3 0 1 0 0-6H8a3 3 0 0 1 0-6h7m-8 12a2 2 0 1 1-4 0 2 2 0 0 1 4 0m12-12a2 2 0 1 1-4 0 2 2 0 0 1 4 0',
  user:'M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2m12-14a4 4 0 1 1-8 0 4 4 0 0 1 8 0',
  pin:'M20 10c0 5-8 11-8 11S4 15 4 10a8 8 0 1 1 16 0zm-5 0a3 3 0 1 0-6 0 3 3 0 0 0 6 0z',
  check:'m5 12 4 4L19 6', clock:'M12 7v5l3 2m6-2a9 9 0 1 1-18 0 9 9 0 0 1 18 0z',
  search:'m21 21-5-5m2-5a7 7 0 1 1-14 0 7 7 0 0 1 14 0z',
  headphones:'M3 14v-2a9 9 0 0 1 18 0v2M3 14h4v6H5a2 2 0 0 1-2-2zm18 0h-4v6h2a2 2 0 0 0 2-2z',
  camera:'M3 7h5l2-3h4l2 3h5v13H3zm13 6a4 4 0 1 0-8 0 4 4 0 0 0 8 0z',
  award:'m8 14-2 7 6-2 6 2-2-7m2-5a6 6 0 1 1-12 0 6 6 0 0 1 12 0z',
  download:'M12 3v12m-5-5 5 5 5-5M4 16v5h16v-5',
  close:'m6 6 12 12M6 18 18 6', chat:'M20 13a8 8 0 0 1-8 7H4l2-3a8 8 0 1 1 14-4z',
  info:'M12 11v6m0-10h.01m9 5a9 9 0 1 1-18 0 9 9 0 0 1 18 0z',
  reset:'M3 12a9 9 0 1 1 2 6M3 12V5m0 7h7',
  chevron:'m9 5 7 7-7 7'
};
const icon = (name) => `<svg class="icon" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.65" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="${symbol[name]}"/></svg>`;
const mark = '<img class="mark" src="assets/mark.svg" alt="" width="40" height="40">';
const heading = (eyebrow, title, intro='') => `<div class="heading">${eyebrow ? `<span class="eyebrow">${eyebrow}</span>` : ''}<h1>${title}</h1>${intro ? `<p>${intro}</p>` : ''}</div>`;
const link = (hash, name, type='primary', glyph='arrow') => `<a class="button ${type}" href="#${hash}">${name}${glyph ? icon(glyph) : ''}</a>`;
const back = (hash) => `<a class="back" href="#${hash}">${icon('back')}${tr().back}</a>`;
const routeLink = (route) => 'route/' + route.id;
const progress = (route) => state.owned[route.id] || 0;
const done = (route) => progress(route) >= route.stops.length;
const unlocked = (route) => state.subscription || Object.hasOwn(state.owned, route.id);
const duration = (route) => route.days === 2 ? tr().days : tr().oneDay;
const finishDate = (route) => new Date(state.finishedAt[route.id] || Date.now()).toLocaleDateString(state.lang === 'kk' ? 'kk-KZ' : 'ru-RU',{dateStyle:'long'});
const cover = (file, alt, cls='') => `<img class="cover ${cls}" src="${image(file)}" alt="${alt}">`;
const languages = () => `<div class="languages" aria-label="${tr().language}"><button type="button" data-lang="kk" lang="kk" aria-pressed="${state.lang === 'kk'}">ҚАЗ</button><button type="button" data-lang="ru" lang="ru" aria-pressed="${state.lang === 'ru'}">РУС</button></div>`;
const credits = [
  ['Abai and Shakarim Mausoleums','Abai_and_Shakarim_Mausoleums.jpg','Yakov Fedorov','4.0'],
  ['Abai House in Zhidebay','Abai_House_in_Zhidebay.JPG','Yakov Fedorov','3.0'],
  ['Konyr Aulie East Kz','Konyr_Aulie_East_Kz.jpg','Yakov Fedorov','4.0'],
  ['Семей қаласы','Семей_қаласы.jpg','TheNomadEditor','CC0'],
  ['Иртыш','Иртыш.jpg','Wowwacha7$K','4.0']
];
let category = 0;
let query = '';
let mapSelection = 'abai';
let audioLang = state.lang;
let payment = {plan:'single', method:'kaspi'};
let locationKey = '';

function onboard() {
  const t = tr();
  return `<section class="welcome content"><div class="welcome-copy">
    <span class="eyebrow"><i></i>${t.region}</span>
    <h1>${t.welcome}<br><em>${t.pace}</em></h1><p>${t.intro}</p>
    <div class="actions">${link('map', t.start)}${link('routes',t.viewRoutes,'quiet',null)}</div>
    <div class="welcome-facts"><span>${icon('route')} ${routes.length} ${state.lang === 'kk' ? 'маршрут' : 'маршрута'}</span><span>${icon('headphones')} ҚАЗ · РУС · ENG</span></div>
    </div><figure class="welcome-photo">${cover('hero',t.heroPlace)}
    <figcaption>${icon('pin')}<span><strong>${t.heroPlace}</strong><small>${t.heroArea}</small></span></figcaption>
  </figure></section>`;
}

function routeCard(route, compact=false) {
  const title = local(route.title);
  return `<a class="route-card ${compact ? 'compact' : ''}" href="#${routeLink(route)}">
    ${cover(route.image,'')}<div class="card-copy"><span class="tag">${tr().filters[route.categories[0]]}</span><h3>${title}</h3>${compact ? '' : `<p>${local(route.desc)}</p>`}
    <div class="card-meta"><span>${icon('clock')}${duration(route)}</span><strong>${money(route.price)}</strong></div></div>
    <span class="card-arrow">${icon('arrow')}</span></a>`;
}

const pins = [
  {id:'semey', place:'city', x:72, y:29},
  {id:'abai', place:'house', x:55, y:60},
  {id:'konyr', place:'cave', x:29, y:70},
  {id:'irtysh', place:'river', x:83, y:49}
];

function mapPage() {
  const t = tr();
  const selected = routes.find(route => route.id === mapSelection);
  return `<section class="content page">${heading(t.region,t.mapTitle,t.mapIntro)}
    <div class="map-grid"><div class="map-panel">
      <canvas id="terrain" aria-hidden="true"></canvas>
      <span class="map-pill">${icon('pin')}${t.region.split(' · ')[0]}</span><span class="north" aria-hidden="true">↑<br>N</span>
      ${pins.map((pin, i) => `<button class="pin pin-${i}" style="--x:${pin.x}%;--y:${pin.y}%" data-pin="${pin.id}" aria-pressed="${pin.id === mapSelection}"><b>${String(i+1).padStart(2,'0')}</b><span>${local(places[pin.place].title)}</span></button>`).join('')}
      <small class="map-note">${t.mapNote}</small>
    </div><aside class="map-aside" aria-label="${t.nearby}">
      <div class="map-selection" aria-live="polite">${routeCard(selected)}</div>
      <h2>${t.nearby}</h2><div class="mini-list">${routes.filter(r => r !== selected).map(r => routeCard(r,true)).join('')}</div>
      ${link('routes',t.allRoutes,'quiet')}
    </aside></div></section>`;
}

function paintMap() {
  const ctx = $('terrain').getContext('2d');
  const panel = $('terrain').getBoundingClientRect();
  const density = Math.min(devicePixelRatio, 2);
  ctx.canvas.width = panel.width * density;
  ctx.canvas.height = panel.height * density;
  ctx.scale(ctx.canvas.width/1000,ctx.canvas.height/650);
  ctx.fillStyle = '#ebe8d4';
  ctx.fillRect(0,0,1000,650);
  function path(data,color,width,fill) {
    const shape = new Path2D(data);
    if (fill) { ctx.fillStyle=fill; ctx.fill(shape); }
    if (color) { ctx.strokeStyle=color; ctx.lineWidth=width; ctx.stroke(shape); }
  }
  path('M0 80L110 123 220 80 319 85 435 4 548 33 622 135 721 147 812 210 1000 198V650H0Z', '#c9c9ac', 2, '#e0e0c5');
  path('M0 650V411l144-43 76 51 114-28 128 66 77-49 134 24 108-54 219 58v214z', '#ccc7a3', 2, '#dcd8b8');
  for(let i=0;i<14;i++) {
    path(`M-40 ${260+i*23} Q110 ${130+i*24} 248 ${218+i*23} T471 ${273+i*25} T704 ${280+i*23} T1040 ${320+i*19}`,'#c5c7a7',1);
  }
  for(let i=0;i<6;i++) {
    path(`M${40+i*162} 0 Q${120+i*135} 175 ${30+i*150} 331 T${130+i*147} 680`,'#f4f0de',2);
  }
  path('M500 -25 Q570 50 632 109 T730 180 Q765 195 753 232 T830 319 Q873 357 842 390 T910 472 T1000 502','#a7c4bd',15);
  path('M500 -25 Q570 50 632 109 T730 180 Q765 195 753 232 T830 319 Q873 357 842 390 T910 472 T1000 502','#c5d8ca',7);
  ctx.lineCap='round';
  path('M290 455 Q372 447 434 410 T550 390 Q600 358 628 295 T720 189 Q754 220 775 255 T830 319','#faf8e8',13);
  ctx.setLineDash([8,9]);
  path('M290 455 Q372 447 434 410 T550 390 Q600 358 628 295 T720 189 Q754 220 775 255 T830 319','#846126',4);
}

function filteredCards() {
  const items = routes.filter(r => (!category || r.categories.includes(category)) && [local(r.title),local(r.desc)].some(value => value.toLowerCase().includes(query.toLowerCase().trim())));
  return items.length ? items.map(r => routeCard(r)).join('') : `<p class="empty">${tr().none}</p>`;
}
function catalog() {
  const t = tr();
  return `<section class="content page">${heading(t.region,t.routes)}
    <div class="catalog-tools"><div class="filters">${t.filters.map((label,i) => `<button data-filter="${i}" aria-pressed="${category===i}">${label}</button>`).join('')}</div>
    <label class="search">${icon('search')}<input type="search" id="search" aria-label="${t.search}" placeholder="${t.search}"></label></div>
    <div id="catalog" class="catalog" aria-live="polite">${filteredCards()}</div></section>`;
}

function detail(route) {
  const t = tr();
  const title = local(route.title);
  return `<section class="content page">${back('routes')}
    <div class="split"><div><div class="feature-photo">${cover(route.image,title)}<span class="photo-tag">${icon('clock')}${duration(route)}</span></div>
    ${heading(t.filters[route.categories[0]],title,local(route.desc))}
    <div class="panel"><h2>${t.stops}</h2><ol class="timeline">${route.stops.map((id,i) => `<li><span>${i+1}</span><strong>${local(places[id].title)}</strong></li>`).join('')}</ol></div></div>
    <aside class="panel side"><h2>${t.included}</h2><ul class="perks">${t.perks.map(p => `<li>${icon('check')}${p}</li>`).join('')}</ul>
    <div class="total"><span>${unlocked(route) ? t.access : t.price}</span><strong>${unlocked(route) ? icon('check') : money(route.price)}</strong></div>
    ${done(route) ? link('diploma/'+route.id,t.completed) : unlocked(route) ? link('stop/'+route.id,t.resume) : link('pay/'+route.id,t.buy)}
    </aside></div></section>`;
}

const planPrice = (route) => ({single:route.price, month:3900, year:19900})[payment.plan];
function checkout(route) {
  const t = tr();
  return `<section class="content page">${back(routeLink(route))}${heading('',t.pay)}
    <form id="checkout" class="split">
      <div class="panel"><fieldset><legend>${t.plans}</legend>
      ${[['single',t.single,t.singleNote,route.price],['month',t.month,t.subNote,3900],['year',t.year,t.subNote,19900]].map(([id,title,note,price]) => `<label class="option"><input type="radio" name="plan" value="${id}" ${payment.plan===id?'checked':''}><span><strong>${title}</strong><small>${note}</small></span><b>${money(price)}</b></label>`).join('')}</fieldset>
      <fieldset><legend>${t.method}</legend>${[['kaspi','Kaspi QR'],['card',t.card]].map(([id,name])=> `<label class="option"><input type="radio" name="method" value="${id}" ${payment.method===id?'checked':''}><strong>${name}</strong></label>`).join('')}</fieldset></div>
      <div class="panel side checkout-summary">${cover(route.image,'')}<h2>${local(route.title)}</h2><p>${duration(route)}</p>
      <div class="total"><span>${t.total}</span><strong id="payment-total">${money(planPrice(route))}</strong></div>
      <p class="note">${icon('info')}${t.simulated}</p><button class="button primary" type="submit">${t.payDemo}${icon('arrow')}</button></div>
    </form></section>`;
}

function stopPage(route, i) {
  const t = tr();
  const id = route.stops[i];
  const stop = places[id];
  const title = local(stop.title);
  const final = i === route.stops.length-1;
  return `<section class="content page">${back(routeLink(route))}
    <div class="split"><div><div class="feature-photo">${cover(stop.image,title)}<span class="photo-tag">${t.stop} ${i+1} ${t.of} ${route.stops.length}</span></div>
      ${heading(local(route.title),title)}
      <div class="panel guide">
        <div class="guide-head"><h2>${icon('headphones')}${t.guide}</h2><div class="languages audio-languages">${[['kk','ҚАЗ'],['ru','РУС'],['en','ENG']].map(([lang,label])=>`<button data-audio="${lang}" type="button" lang="${lang}" aria-pressed="${lang===audioLang}">${label}</button>`).join('')}</div></div>
        <audio controls preload="none" src="assets/${id}-${audioLang}.mp3"></audio><details id="transcript"><summary>${t.transcript}</summary><p lang="${audioLang}">${stop.story[['ru','kk','en'].indexOf(audioLang)]}</p></details>
      </div></div>
      <aside class="panel side"><h2>${t.progress}</h2><progress max="${route.stops.length}" value="${progress(route)}" aria-label="${t.progress}"></progress>
      <div class="activity"><h3>${icon('check')}${t.task}</h3><p>${local(stop.task)}</p></div>
      <div class="activity"><h3>${icon('camera')}${t.photo}</h3><p>${local(stop.photo)}</p></div>
      <button class="button primary" type="button" data-action="visit">${final?t.finish:t.next}${icon('arrow')}</button>
      ${i ? link('stop/'+route.id+'/'+(i-1),t.previousStop,'quiet','back') : ''}</aside>
    </div></section>`;
}

const badgeList = () => `<div class="badges">${tr().badges.map(name=>`<span>${icon('award')}${name}</span>`).join('')}</div>`;
function diploma(route) {
  const t = tr();
  return `<section class="content page">${back('profile')}${heading('',t.congrats,t.diplomaNote)}
    <div class="split"><div class="certificate">${mark}<span class="eyebrow">${t.diploma}</span><h2>${local(route.title)}</h2>${cover(route.image,'')}
    <span class="certificate-date">${finishDate(route)}</span></div>
    <aside class="panel side"><h2>${t.achievements}</h2>${badgeList()}
    <button class="button primary" data-action="download">${t.download}${icon('download')}</button>
    <button class="button secondary" data-action="review">${t.review}${icon('chat')}</button>
    ${link('routes',t.more,'quiet')}</aside></div></section>`;
}

function profile() {
  const t = tr();
  const active = routes.filter(unlocked);
  const finished = active.filter(done).length;
  const stats = [[active.length,t.routes],[active.reduce((sum,r)=>sum+progress(r),0),t.visited],[finished?t.badges.length:0,t.badge]];
  return `<section class="content page">${heading('',t.profile,t.profileIntro)}
  <div class="split"><div><div class="panel"><div class="identity"><span class="avatar">AT</span><div><h2>${t.guest}</h2><p>${t.access}</p></div></div>
  <div class="stats">${stats.map(([number,label])=>`<div><strong>${number}</strong><span>${label}</span></div>`).join('')}</div></div>
  <div class="panel"><h2>${t.my}</h2>${active.length ? active.map(r=>`<a class="profile-route" href="#${done(r)?'diploma/'+r.id:'stop/'+r.id}">${cover(r.image,'')}<span><strong>${local(r.title)}</strong><progress max="${r.stops.length}" value="${progress(r)}" aria-label="${t.progress}"></progress></span>${icon('chevron')}</a>`).join('') : `<p>${t.empty}</p>`}</div></div>
  <aside><div class="panel"><h2>${t.achievements}</h2>${finished ? badgeList() : `<p>${t.noBadges}</p>`}</div>
  <div class="panel settings"><h2>${t.settings}</h2><div><span>${t.language}</span>${languages()}</div>
  ${[['support','chat',t.support],['about','info',t.about],['reset','reset',t.reset]].map(([id,i,label])=>`<button data-action="${id}">${icon(i)}<span>${label}</span>${icon('chevron')}</button>`).join('')}</div></aside></div></section>`;
}

function render({focus=false}={}) {
  const hash = location.hash.slice(1) || 'home';
  const [candidate,id,step] = hash.split('/');
  const route = routes.find(r=>r.id===id);
  const needsRoute = ['route','pay','stop','diploma'].includes(candidate);
  let name = ['home','map','routes','profile','route','pay','stop','diploma'].includes(candidate) && (!needsRoute || route) ? candidate : 'home';
  if (name === 'pay' && unlocked(route)) name = 'route';
  if (name === 'stop' && !unlocked(route)) name = 'route';
  if (name === 'diploma' && !done(route)) name = 'route';
  const count = route ? progress(route) : 0;
  const maxIndex = route ? Math.min(count,route.stops.length-1) : 0;
  const index = /^\d+$/.test(step || '') ? Math.min(Number(step),maxIndex) : maxIndex;
  if (hash !== locationKey) {
    if (name === 'pay') payment = {plan:'single',method:'kaspi'};
    if (name === 'routes') category=0, query='';
    locationKey = hash;
  }
  const t = tr();
  const searchFocused = document.activeElement?.id === 'search';
  document.documentElement.lang = state.lang;
  document.title = 'ABAI TRAVEL · ' + t.footer;
  const group = ['route','pay','stop','diploma'].includes(name) ? 'routes' : name;
  $('header').innerHTML = `<div class="top content"><a href="#home" class="brand">${mark}<span>ABAI TRAVEL</span></a>
    <nav class="nav" aria-label="ABAI TRAVEL">${[['map',t.map],['routes',t.routes],['profile',t.profile]].map(([page,label])=>`<a href="#${page}" ${group===page?'aria-current="page"':''}>${icon(page==='routes'?'route':page==='profile'?'user':page)}<span>${label}</span></a>`).join('')}</nav>
    <div class="top-right"><span class="demo"><i></i>${t.prototype}</span>${languages()}</div></div>`;
  $('footer').innerHTML = `<div class="content footer"><span><b>ABAI TRAVEL</b> · ${t.footer}</span><button data-action="credits">${t.credits}</button></div>`;
  const pages = {home:onboard,map:mapPage,routes:catalog,profile,route:()=>detail(route),pay:()=>checkout(route),stop:()=>stopPage(route,index),diploma:()=>diploma(route)};
  screen.innerHTML = pages[name]();
  if (name==='routes') {
    $('search').value=query;
    if (searchFocused) $('search').focus();
  }
  if (name==='map') paintMap();
  screen.onclick = (event) => {
    if (event.target.closest('[data-action="visit"]')) {
      state.owned[route.id] = Math.max(count,index+1);
      if (done(route)) state.finishedAt[route.id] ??= Date.now();
      persist();
      go(done(route) ? 'diploma/'+route.id : 'stop/'+route.id+'/'+(index+1));
    }
    if (event.target.closest('[data-action="download"]')) downloadDiploma(route);
    if (event.target.closest('[data-action="review"]')) openReview(route);
  };
  if (name==='pay') {
    $('checkout').onchange = (event) => {
      payment[event.target.name] = event.target.value;
      $('payment-total').textContent=money(planPrice(route));
    };
    $('checkout').onsubmit = (event) => {
      event.preventDefault();
      if (payment.plan!=='single') state.subscription=true;
      state.owned[route.id] = count;
      persist();
      go('stop/'+route.id);
    };
  }
  if (focus) { window.scrollTo(0,0); screen.focus({preventScroll:true}); }
}

function go(page) {
  if (location.hash === '#'+page) render({focus:true});
  else location.hash = page;
}

function modal(title,body,action='',callback=null) {
  const t = tr();
  dialog.innerHTML = `<form method="dialog"><div class="dialog-head"><h2 id="dialog-title">${title}</h2><button class="icon-button" value="cancel" formnovalidate aria-label="${t.close}">${icon('close')}</button></div>${body}
    <div class="actions"><button class="button secondary" value="cancel" formnovalidate>${action?t.cancel:t.close}</button>${action ? `<button class="button primary" value="confirm">${action}</button>` : ''}</div></form>`;
  dialog.querySelector('form').onsubmit = (event) => {
    if (event.submitter?.value !== 'confirm' || !callback) return;
    event.preventDefault();
    if (callback() !== false) dialog.close();
  };
  dialog.showModal();
}

function openReview(route) {
  const t = tr();
  modal(t.review,`<label class="review-label">${t.reviewText}<textarea required maxlength="600" rows="4"></textarea></label>`,t.save,()=>{
    const input = dialog.querySelector('textarea');
    if (!input.value.trim()) { input.setCustomValidity(t.reviewText); input.reportValidity(); return false; }
    state.reviews[route.id]=input.value.trim();
    persist();
    dialog.close();
    modal(t.review,`<p>${t.saved}</p>`);
    return false;
  });
  const textarea = dialog.querySelector('textarea');
  textarea.value = state.reviews[route.id] || '';
  textarea.addEventListener('input',()=>textarea.setCustomValidity(''));
}

async function downloadDiploma(route) {
  const t = tr();
  await document.fonts.ready;
  const canvas = Object.assign(document.createElement('canvas'),{width:1440,height:960});
  const ctx = canvas.getContext('2d');
  ctx.fillStyle='#f6efdb'; ctx.fillRect(0,0,1440,960);
  ctx.strokeStyle='#a57d32'; ctx.lineWidth=3; ctx.strokeRect(45,45,1350,870); ctx.strokeRect(57,57,1326,846);
  ctx.textAlign='center'; ctx.fillStyle='#133b33';
  ctx.font='600 28px Inter'; ctx.fillText('ABAI TRAVEL',720,130);
  ctx.font='600 32px Inter'; ctx.fillText(t.diploma,720,208);
  ctx.font='76px "PT Serif"'; ctx.fillText(local(route.title),720,302,1200);
  const photo = new Image();
  photo.src=image(route.image);
  try {
    await photo.decode();
    const scale = Math.max(780/photo.width, 400/photo.height);
    const w=780/scale, h=400/scale;
    ctx.drawImage(photo,(photo.width-w)/2,(photo.height-h)/2,w,h,330,350,780,400);
  } catch {}
  ctx.font='26px Inter'; ctx.fillText(t.diplomaNote,720,817);
  ctx.font='20px Inter'; ctx.fillText(finishDate(route),720,853);
  const [,file,author,license] = credits[['hero','house','cave','city','river'].indexOf(route.image)];
  ctx.font='15px Inter';
  ctx.fillText(author + ' · ' + (license==='CC0'?'CC0':'CC BY-SA '+license) + ' · commons.wikimedia.org/wiki/File:' + file,720,885,1220);
  const a = document.createElement('a');
  a.href=canvas.toDataURL('image/png'); a.download='abai-travel-'+route.id+'.png'; a.click();
}

document.addEventListener('click',(event)=>{
  const button = event.target.closest('button');
  if (!button) return;
  const {lang,pin,filter,audio,action} = button.dataset;
  if (lang && lang!==state.lang) {
    state.lang=lang; audioLang=lang; persist(); render();
    const group = button.closest('.settings') ? '.settings' : '#header';
    document.querySelector(group+' [data-lang="'+lang+'"]')?.focus();
  }
  if (pin) {
    mapSelection=pin; render();
    document.querySelector('[data-pin="'+pin+'"]').focus();
  }
  if (filter !== undefined) {
    category=Number(filter);
    document.querySelectorAll('[data-filter]').forEach(b=>b.setAttribute('aria-pressed',b.dataset.filter===filter));
    $('catalog').innerHTML=filteredCards();
  }
  if (audio) {
    audioLang=audio;
    const player = screen.querySelector('audio');
    const id = player.getAttribute('src').split('/').at(-1).split('-')[0];
    player.src = 'assets/'+id+'-'+audio+'.mp3';
    document.querySelectorAll('[data-audio]').forEach(b=>b.setAttribute('aria-pressed',b.dataset.audio===audio));
    const transcript = $('transcript').querySelector('p');
    transcript.lang = audio;
    transcript.textContent = places[id].story[['ru','kk','en'].indexOf(audio)];
  }
  const t=tr();
  if (action==='about') modal(t.about,`<p>${t.aboutNote}</p>`);
  if (action==='support') modal(t.support,`<p>${t.supportNote}</p>`);
  if (action==='reset') modal(t.reset,`<p>${t.resetNote}</p>`,t.reset,()=>{
    state={...initial(), lang:state.lang}; persist(); render();
  });
  if (action==='credits') modal(t.credits,`<ul class="credits">${credits.map(([title,file,author,license])=>`<li><a href="https://commons.wikimedia.org/wiki/File:${encodeURIComponent(file)}">${title}</a> · ${author} · <a href="https://creativecommons.org/${license==='CC0'?'publicdomain/zero/1.0/':'licenses/by-sa/'+license+'/'}">${license==='CC0'?'CC0':'CC BY-SA '+license}</a></li>`).join('')}</ul>`);
});
screen.addEventListener('input',(event)=>{
  if (event.target.id !== 'search') return;
  query=event.target.value;
  $('catalog').innerHTML=filteredCards();
});
window.addEventListener('hashchange',()=>render({focus:true}));
window.addEventListener('resize',()=>{if ($('terrain')) paintMap();});
render();
