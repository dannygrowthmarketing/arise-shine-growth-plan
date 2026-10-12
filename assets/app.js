(function(){
"use strict";
const $=(s,r=document)=>r.querySelector(s), $$=(s,r=document)=>[...r.querySelectorAll(s)];
const inr=n=>'₹'+Math.round(n).toLocaleString('en-IN');
const lakh=n=>n>=100000?'₹'+(n/100000).toFixed(1)+' lakh':inr(n);
const store={get(k){try{return JSON.parse(localStorage.getItem(k))}catch(e){return null}},set(k,v){try{localStorage.setItem(k,JSON.stringify(v))}catch(e){}}};

/* ---------- tooltip ---------- */
const tip=$('#tip');
function showTip(e,html){tip.innerHTML=html;tip.style.opacity=1;moveTip(e)}
function moveTip(e){const x=Math.min(e.clientX+14,innerWidth-tip.offsetWidth-10),y=Math.min(e.clientY+14,innerHeight-tip.offsetHeight-10);tip.style.left=x+'px';tip.style.top=y+'px'}
function hideTip(){tip.style.opacity=0}
function bindTip(el,html){el.addEventListener('mouseenter',e=>showTip(e,html));el.addEventListener('mousemove',moveTip);el.addEventListener('mouseleave',hideTip)}

/* ---------- bar, progress, nav ---------- */
const bar=$('#bar'),prog=$('#prog'),navA=$$('#nav a');
const secIds=navA.map(a=>a.getAttribute('href').slice(1));
function onScroll(){
  const y=scrollY,h=document.documentElement.scrollHeight-innerHeight;
  bar.classList.toggle('on',y>innerHeight*.6);
  prog.style.width=(y/h*100)+'%';
  let cur=secIds[0];
  for(const id of secIds){const el=document.getElementById(id);if(el&&el.getBoundingClientRect().top<120)cur=id}
  navA.forEach(a=>{const on=a.getAttribute('href')==='#'+cur;a.classList.toggle('act',on);if(on&&bar.classList.contains('on')){const n=$('#nav');const l=a.offsetLeft-n.clientWidth/2+a.clientWidth/2;if(Math.abs(n.scrollLeft-l)>40)n.scrollTo({left:l,behavior:'smooth'})}});
}
addEventListener('scroll',onScroll,{passive:true});onScroll();

/* ---------- TOC ---------- */
const toc=$('#toc');
$$('section[data-t]').forEach(s=>{const k=$('.kicker',s);const n=k?k.textContent.trim().slice(0,2):'';const a=document.createElement('a');a.href='#'+s.id;a.style.cssText='display:flex;justify-content:space-between;gap:10px;padding:6px 0;border-bottom:1px solid var(--line);text-decoration:none';a.innerHTML=`<span>${s.dataset.t}${s.querySelector('.new')?' <span class="tg n" style="font-size:8px;padding:2px 4px">Added</span>':''}</span><span style="font:500 12px var(--mono);color:var(--gold)">${n}</span>`;toc.appendChild(a)});

/* ---------- reveal + counters ---------- */
const io=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){e.target.classList.add('in');io.unobserve(e.target)}}),{threshold:.12});
$$('.reveal').forEach(el=>io.observe(el));
const cio=new IntersectionObserver(es=>es.forEach(e=>{if(!e.isIntersecting)return;const el=e.target,to=+el.dataset.to,d=+(el.dataset.d||0);let t0=null;function f(t){t0=t0||t;const p=Math.min((t-t0)/1100,1),v=to*(1-Math.pow(1-p,3));el.textContent=v.toFixed(d);if(p<1)requestAnimationFrame(f)}requestAnimationFrame(f);cio.unobserve(el)}),{threshold:.5});
$$('.cu').forEach(el=>cio.observe(el));
// animate-on-view helper for bars
function onView(el,fn){const o=new IntersectionObserver(es=>{if(es[0].isIntersecting){fn();o.disconnect()}},{threshold:.2});o.observe(el)}

/* ---------- concepts data + chips + modal ---------- */
const C=window.CONCEPTS||[];const byN={};C.forEach(c=>byN[c.n]=c);
const secOf=n=>n<=17?'A':n<=27?'B':n<=42?'C':'D';
const secCol={A:'#7A4E48',B:'#138A60',C:'#B8875B',D:'#5E4B8B'};
const tagMap={v:['v','Verified'],o:['o','Observation'],i:['i','Inference'],e:['e','Illustrative'],u:['u','Data needed']};
const used=new Set();
$$('.cps[data-c]').forEach(el=>{el.dataset.c.split(',').map(Number).forEach(n=>{used.add(n);const c=byN[n];if(!c)return;const b=document.createElement('button');b.className='cp';b.style.setProperty('--cc',secCol[secOf(n)]);b.innerHTML=`<i>${n}</i>${c.t.replace(/ —.*$/,'').replace(/ effect$/i,'')}`;b.onclick=()=>openC(n);el.appendChild(b)})});
function cardHTML(c,open){const s=secOf(c.n),tg=tagMap[c.tag]||['i','Inference'];return `<div class="hd"><span>${String(c.n).padStart(2,'0')}</span><h5>${c.t}</h5></div><div class="df">${c.d}</div><div class="at">AT ARISE &amp; SHINE <span class="tg ${tg[0]}">${tg[1]}</span></div><div class="ex">${c.e}</div><div class="more">${c.r?`<div class="gr"><b>Do it right:</b> ${c.r}</div>`:''}<div class="sy">${c.q}</div></div>`}
const modal=document.createElement('div');modal.className='cmodal';modal.innerHTML='<div class="cc open"></div>';document.body.appendChild(modal);
function openC(n){const c=byN[n];if(!c)return;const box=$('.cc',modal);box.style.setProperty('--c',secCol[secOf(n)]);box.innerHTML='<button class="x" aria-label="Close">×</button>'+cardHTML(c,true)+'<a class="tgl" href="#s24" style="text-decoration:none">See all 60 concepts →</a>';modal.classList.add('on');$('.x',box).onclick=closeC;$('.tgl',box).onclick=closeC}
function closeC(){modal.classList.remove('on')}
modal.addEventListener('click',e=>{if(e.target===modal)closeC()});addEventListener('keydown',e=>{if(e.key==='Escape')closeC()});

/* concept library */
const grid=$('#cgrid');let cSec='all',cQ='';
C.forEach(c=>{const d=document.createElement('div');d.className='cc';d.dataset.s=secOf(c.n);d.style.setProperty('--c',secCol[secOf(c.n)]);d.innerHTML=cardHTML(c)+'<div class="tgl">+ do it right · one line</div>';d.dataset.txt=(c.t+' '+c.d+' '+c.e+' '+c.r+' '+c.q).toLowerCase();d.onclick=()=>{d.classList.toggle('open');$('.tgl',d).textContent=d.classList.contains('open')?'− close':'+ do it right · one line'};grid.appendChild(d)});
function cFilter(){let k=0;$$('.cc',grid).forEach(d=>{const ok=(cSec==='all'||d.dataset.s===cSec)&&(!cQ||d.dataset.txt.includes(cQ));d.style.display=ok?'':'none';if(ok)k++});$('#cnone').style.display=k?'none':'block'}
$$('#cs button').forEach(b=>b.onclick=()=>{$$('#cs button').forEach(x=>x.classList.remove('on'));b.classList.add('on');cSec=b.dataset.s;cFilter()});
$('#cq').addEventListener('input',e=>{cQ=e.target.value.trim().toLowerCase();cFilter()});
let allOpen=false;$('#cexp').onclick=()=>{allOpen=!allOpen;$$('.cc',grid).forEach(d=>{d.classList.toggle('open',allOpen);$('.tgl',d).textContent=allOpen?'− close':'+ do it right · one line'});$('#cexp').textContent=allOpen?'Collapse all':'Expand all'};

/* psychology map */
const stages=[['Found','"Can I find a good salon near me?"',[23,49,48,50,14,21,40,41,42,60,35,57,37,36,31,28,29,38]],['Chosen','"Is it worth it? Who will do it?"',[2,10,43,6,58,4,17,16,7,15,12,13,24,27,59,32]],['Booked','"Can I get Saturday 7 pm?"',[18,20,19,22,51,1,3,8,34,55]],['Rebooked','"I\'ll come back… when?"',[25,47,45,44,5,11,53,33,26,30]],['Recommended','"You have to try this place."',[46,56,9,54,52,39]]];
const pm=$('#pmap');
stages.forEach(([t,q,ns],i)=>{const d=document.createElement('div');d.className='pcol';d.innerHTML=`<span class="pn">${i+1}</span><h5>${t}</h5><div class="pq">${q}</div><span class="cps"></span>`;const box=$('.cps',d);ns.forEach(n=>{const c=byN[n];const b=document.createElement('button');b.className='cp'+(used.has(n)?' used':'');b.style.setProperty('--cc',secCol[secOf(n)]);b.innerHTML=`<i>${n}</i>${c.t.replace(/ —.*$/,'').replace(/ effect$/i,'')}`;b.onclick=()=>openC(n);box.appendChild(b)});pm.appendChild(d)});

/* ---------- before/after tabs ---------- */
$$('#baTabs button').forEach(b=>b.onclick=()=>{$$('#baTabs button').forEach(x=>x.classList.toggle('on',x===b));$$('.bap').forEach(p=>p.classList.toggle('on',p.dataset.p===b.dataset.p))});

/* ---------- severity board ---------- */
const sev=[['Fix this week','#8E1F1A',[['Robots meta "noindex, nofollow" on the homepage','VERIFIED'],['Title tag is only "ariseandshinesalon.com"; no meta description','VERIFIED'],['Contact URL variant ends in "/v" (contact-us/v)','VERIFIED'],['Facebook & YouTube icons link to "#"','VERIFIED']]],
['High','#C8423A',[['No H1; section titles are plain text','VERIFIED'],['Services listed by name only — no page per treatment','VERIFIED'],['Counters render "0 +" clients, professionals, years','VERIFIED'],['No LocalBusiness / HairSalon schema seen','CONFIRM'],['FAQ points to a "Book Now section" that doesn\'t exist','VERIFIED']]],
['Medium','#C98E0A',[['Images without alt text','VERIFIED'],['Typos: "Men- Services", "Women- Services", "Book Appoiment"','VERIFIED'],['Ten 5★ testimonials with no source or date','VERIFIED'],['Analytics / Meta pixel not visible in fetched pages','CONFIRM'],['Phone layout wider than the screen; chat pop-up covers the hero','OBSERVED']]],
['In place','#138A60',[['A full, detailed price list (+GST stated)','VERIFIED'],['Offers page with fixed-price deals & packages','VERIFIED'],['Men\'s / women\'s service split','VERIFIED'],['WhatsApp booking link with a number','VERIFIED'],['Policy pages (privacy, refunds, terms)','VERIFIED']]]];
$('#sev').innerHTML=sev.map(([t,c,it])=>`<div class="col"><h5 style="background:${c}">${t}<b>${it.length}</b></h5>${it.map(([x,v])=>`<div class="item"><span>${x}</span><small class="${v==='VERIFIED'?'':'cf'}">${v}</small></div>`).join('')}</div>`).join('');

/* ---------- price ladder ---------- */
const lad=[["Men's haircut",600,1000,'#7A4E48','entry'],["Women's haircut",1050,1500,'#7A4E48','entry'],['Classic mani / pedi',850,1000,'#7A4E48','entry'],['Hair spa (women)',2500,4500,'#C98E0A','trade-up'],['Global colour',3000,9000,'#C98E0A','trade-up'],['Facials',3000,7500,'#C98E0A','trade-up'],['Keratin / nanoplastia',6000,12000,'#B8875B','hero'],['Hair botox',6000,12000,'#B8875B','hero']];
const L=$('#ladder');L.innerHTML=lad.map(r=>`<div class="rng"><span>${r[0]}</span><div class="tr"><i style="left:${r[1]/13000*100}%;width:0;background:${r[3]}" data-w="${Math.max((r[2]-r[1])/13000*100,1.2)}"></i></div><span class="v">₹${r[1].toLocaleString('en-IN')}–${r[2].toLocaleString('en-IN')}</span></div>`).join('');
$$('.rng',L).forEach((el,i)=>bindTip(el,`<b>${lad[i][0]}</b><br>${inr(lad[i][1])} – ${inr(lad[i][2])} +GST<br>Tier: ${lad[i][4]}`));
onView(L,()=>$$('.tr i',L).forEach(i=>i.style.width=i.dataset.w+'%'));

/* ---------- competitors ---------- */
const comp=[
[0,'Arise and Shine','HRBR 2nd Block',0,4.9,35,'me','9 am–10 pm','h10','Premium space, valet, tea/coffee, discounts'],
[1,'Toni&Guy Essensuals','CMR Main Rd',340,4.5,2206,'c','10–9','h9','Balayage, colour correction; some complaints on price'],
[2,'Adorn & Admire','CMR Main Rd',360,4.9,3580,'i','10:30–9','h9','Named stylists (Aadi, Sagar, Puran), colour, hair botox'],
[3,'Vista Salon','HRBR 2nd Block',390,4.8,433,'i','10–10','h10','Hair styling, nail art'],
[4,'Studio 11 Family Salon','HRBR 2nd Block',390,4.6,493,'c','11–9','h9','Nail art & extensions (Sonia)'],
[5,'Bebold Salon & Academy','HRBR 3rd Block',470,5.0,34,'i'],
[6,'Femina Flaunt Studio','HRBR 3rd Block',510,4.9,523,'i','11–9','h9','Hair botox (Satish); one review: 1-hour wait'],
[7,'Royal Streax','HRBR 2nd Block',660,5.0,28,'i'],
[8,'Spin Salon · Hennur Cross','Hennur',670,4.8,830,'c','till 8:30','h8','WhatsApp booking & e-bills; skin, mani-pedi'],
[9,'Grace & Glamour','HBR 4th Block',700,4.8,408,'i','9–10','h10','Budget-friendly colour, regulars'],
[10,'Beauty f Salon','HBR 1st Stage',730,4.9,31,'i'],
[11,'Lakmé Salon · Hennur','Hennur',780,4.7,1235,'c','till 8','h8','Bridal / engagement make-up'],
[12,'Toni&Guy · Kalyan Nagar','HRBR 1st Block',850,4.7,1688,'c','till 10 wknd','h10','Creative director cuts, hair botox'],
[13,'Mr. Barber','Kammanahalli',1030,4.4,68,'c'],
[14,'Arha Salon & Spa','Kammanahalli',1030,4.6,871,'i','8:30–9','h9','Layer cuts, spa, pedicure'],
[15,'Purple Lounge','HBR Layout',1130,4.1,158,'i'],
[16,'Boon Salon','Kammanahalli',1210,4.9,1071,'c','till 8','h8','Colour specialist (Himanshu), hair botox'],
[17,'Spin Salon · Kammanahalli','Kammanahalli',1420,4.9,406,'c']];
const colOf=t=>t==='me'?'#B8875B':t==='c'?'#7A4E48':'#138A60';
// reviews chart (log)
const rv=$('#rvchart');let rvKey='rev';
function drawRv(){const rows=[...comp].sort((a,b)=>rvKey==='rev'?b[5]-a[5]:rvKey==='rat'?(b[4]-a[4]||b[5]-a[5]):(a[3]-b[3]));const mx=Math.log10(4000);
  rv.innerHTML=rows.map(r=>{const w=Math.log10(r[5])/mx*80;return `<div class="rv${r[6]==='me'?' me':''}" data-i="${r[0]}"><span class="nm">${r[1]} · ${r[2]}</span><div class="b"><i style="width:0;background:${colOf(r[6])}" data-w="${w}"></i><em style="left:${w}%">${r[5].toLocaleString('en-IN')}</em></div><span class="r">${r[4].toFixed(1)}★</span></div>`}).join('');
  $$('.rv',rv).forEach(el=>{const r=comp.find(c=>c[0]==el.dataset.i);bindTip(el,`<b>${r[1]}</b><br>${r[5].toLocaleString('en-IN')} reviews · ${r[4]}★<br>${r[3]?r[3]+' m away':'You'} · ${r[6]==='c'?'chain / franchise':r[6]==='i'?'independent':'Arise & Shine'}`)});
  requestAnimationFrame(()=>requestAnimationFrame(()=>$$('.b i',rv).forEach(i=>i.style.width=i.dataset.w+'%')));}
let rvDrawn=false;onView(rv,()=>{rvDrawn=true;drawRv()});
$$('#rvsort button').forEach(b=>b.onclick=()=>{$$('#rvsort button').forEach(x=>x.classList.remove('on'));b.classList.add('on');rvKey=b.dataset.k;drawRv()});
// review pace
function pace(){const w=+$('#rp').value;$('#rpO').textContent=w;const t=[[100,'100 reviews'],[500,'500 — Grace & Glamour, Vista territory'],[1071,'1,071 — Boon Salon'],[2206,'2,206 — Toni&Guy Essensuals']];
  $('#rpOut').innerHTML=t.map(([n,l])=>{const m=(n-35)/(w*4.33);const pct=Math.min(m/36*100,100);return `<div style="margin:8px 0"><div style="display:flex;justify-content:space-between;font-size:13px"><span>${l}</span><b style="font-family:var(--mono)">${m<1?'<1':m.toFixed(m<10?1:0)} mo</b></div><div style="height:6px;background:#F2EEE8;border-radius:99px"><div style="height:100%;width:${pct}%;background:var(--gold);border-radius:99px;transition:width .3s"></div></div></div>`}).join('')}
$('#rp').addEventListener('input',pace);pace();
// comp table sortable
const ct=$('#ctab tbody');let ck='d',cdir=1;
function drawCt(){const idx={i:0,n:1,d:3,r:4,v:5}[ck];const rows=comp.filter(r=>r[0]).sort((a,b)=>(typeof a[idx]==='string'?a[idx].localeCompare(b[idx]):a[idx]-b[idx])*cdir);
  ct.innerHTML=rows.map(r=>`<tr><td><span style="display:inline-grid;place-items:center;width:20px;height:20px;border-radius:50%;background:${colOf(r[6])};color:#fff;font:700 10px var(--sans)">${r[0]}</span></td><td><b>${r[1]}</b><br><small style="color:var(--mute)">${r[2]}</small></td><td>${r[3]} m</td><td><b>${r[4].toFixed(1)}</b></td><td>${r[5].toLocaleString('en-IN')}</td></tr>`).join('')}
$$('#ctab th').forEach(th=>th.onclick=()=>{const k=th.dataset.k;cdir=ck===k?-cdir:(k==='v'||k==='r'?-1:1);ck=k;drawCt()});drawCt();
// hours table
$('#hours').innerHTML=comp.filter(r=>r[7]).sort((a,b)=>a[6]==='me'?-1:b[6]==='me'?1:b[5]-a[5]).map(r=>`<tr class="${r[6]==='me'?'me':''}"><td>${r[6]==='me'?'Arise & Shine':'<b>'+r[1]+'</b>'}</td><td>${r[3]?r[3]+' m':'—'}</td><td>${r[4]} · ${r[5].toLocaleString('en-IN')}</td><td class="${r[8]}">${r[7]}</td><td>${r[6]==='me'?'Independent':r[6]==='c'?'Chain / franchise':'Independent'}</td><td style="color:var(--ink2)">${r[9]}</td></tr>`).join('');

/* ---------- budget explorer ---------- */
function budget(){const B=+$('#bb').value,cpl=+$('#bc').value,br=+$('#br').value/100,bv=+$('#bv').value;
  $('#bbO').textContent=inr(B);$('#bcO').textContent=inr(cpl);$('#brO').textContent=Math.round(br*100)+'%';$('#bvO').textContent=inr(bv);
  const leads=B/cpl,bk=leads*br,cpb=B/Math.max(bk,0.01),rev=bk*bv;
  $('#bOut').innerHTML=`<div><small>Enquiries / month</small><b>${Math.round(leads)}</b></div><div><small>Booked visits</small><b>${Math.round(bk)}</b></div><div><small>Cost per booking</small><b>${inr(cpb)}</b></div><div class="hi"><small>First-visit revenue</small><b>${lakh(rev)}</b></div><div style="grid-column:1/-1"><small>Return on first visit alone</small><b style="color:${rev>=B?'var(--green)':'var(--red)'}">${(rev/B).toFixed(1)}× ${rev>=B?'— pays back on visit one':'— needs rebooking to pay back'}</b></div>`}
['bb','bc','br','bv'].forEach(id=>$('#'+id).addEventListener('input',budget));budget();

/* ---------- journey ---------- */
const J=[['Discovery','"Good salon near me?"','Google listing only — site noindexed','Website can\'t be found','n','3,580 reviews next door','Search & Maps views','Site hidden from Google','Indexed pages per treatment + strong Maps profile'],
['First look','"Is it nice? Is it pricey?"','Generic hero, "0 +" counters','Premium room not shown','n','Named stylists in reviews','Profile → site clicks','"0 +" and a generic line','The room, the brands, ★4.9, "open till 10"'],
['Consideration','"Who\'ll do it? Will it suit me?"','Prices yes; no stylists, no before/after','Leaves to compare on Instagram','n','Reels of results','Page → enquiry %','Price list only','Before/after + stylist + price on each treatment'],
['Enquiry','"Let me just message"','WhatsApp + 3 numbers','Which number? which hours?','n','Booking pages (Spin)','Chats & calls by source','3 numbers, 3 hours','One WhatsApp, same hours everywhere'],
['Booking','"Can I get Saturday 7 pm?"','Back-and-forth chat','Reply time unknown','m','Instant slot','Enquiry → booked %','Chat back-and-forth','Pick service, stylist, slot — confirmed instantly'],
['Reminder','"Don\'t let me forget"','Not visible','No-shows likely untracked','m','WhatsApp bills / reminders','No-show %','Not visible','WhatsApp reminder + valet note the day before'],
['Visit','"Treat me well"','Valet, tea, premium space','Strength','g','—','Wait time','Already strong','Keep · add a 2-min consultation'],
['Upgrade','"What else should I do?"','Offers exist','Consultation not visible','m','Stylist recommends botox','Ticket size','Offers buried','Free hair check → the right treatment'],
['Review','"That was great"','35 reviews','Most happy clients never asked','n','Thousands of reviews','Reviews / month','Rarely asked','Thank-you message with review link — never pushed'],
['Rebook','"I\'ll come back… sometime"','No reminder or membership seen','Clients drift to the next salon','n','Regulars "for 3–5 years"','60-day return rate','Left to chance','Booked at the counter + reminder at the right interval']];
const jcol=['#231A17','#7A4E48','#7A4E48','#B8875B','#B8875B','#C98E0A','#138A60','#138A60','#138A60','#138A60'];
function drawJ(v){$('#journey').innerHTML=J.map((j,i)=>v==='today'?`<div class="j" style="border-top-color:${jcol[i]}"><small>${String(i+1).padStart(2,'0')}</small><h5>${j[0]}</h5><div class="th">${j[1]}</div><div style="font-size:13px;margin-bottom:6px">${j[2]}</div><div class="lk ${j[4]==='g'?'g':j[4]==='m'?'m':''}">${j[3]}</div><div class="ms">Rival edge: ${j[5]}<br>Measure: ${j[6]}</div></div>`:`<div class="j" style="border-top-color:${jcol[i]}"><small>${String(i+1).padStart(2,'0')}</small><h5>${j[0]}</h5><div class="was">${j[7]}</div><div class="now">${j[8]}</div><div class="ms">KPI: ${j[6]}</div></div>`).join('')+(v==='better'?'':'')}
drawJ('today');$$('#jseg button').forEach(b=>b.onclick=()=>{$$('#jseg button').forEach(x=>x.classList.remove('on'));b.classList.add('on');drawJ(b.dataset.v)});

/* ---------- retention gantt ---------- */
const G=[["Men's haircut",3,5,'#7A4E48'],["Women's haircut",6,10,'#7A4E48'],['Gel / nail refills',2,3,'#B04E78'],['Root touch-up / colour',5,8,'#C98E0A'],['Hair spa',4,6,'#138A60'],['Botox / nanoplastia / keratin',12,20,'#B8875B']];
const gt=$('#gantt');gt.innerHTML=G.map(g=>`<div class="gt"><b>${g[0]}</b><div class="tr"><i style="left:${g[1]/24*100}%;width:0;background:${g[3]}" data-w="${(g[2]-g[1])/24*100}"></i><em style="left:${(g[2]/24>.7?g[1]:g[2])/24*100}%;${g[2]/24>.7?'color:#fff':''}">${g[1]}–${g[2]} weeks</em></div></div>`).join('');
$$('.gt',gt).forEach((el,i)=>bindTip(el,`<b>${G[i][0]}</b><br>Reminder goes out at week ${G[i][1]}<br>Typical return: ${G[i][1]}–${G[i][2]} weeks`));
onView(gt,()=>$$('.tr i',gt).forEach(i=>i.style.width=i.dataset.w+'%'));

/* ---------- revenue model ---------- */
const P={today:[60,35,6,1800],after:[75,50,8,2000]};
const calcRev=(n,r,v,b)=>(n*r*v+n*(1-r))*b;
const base=calcRev(60,.35,6,1800);
function model(){const n=+$('#m1').value,r=+$('#m2').value/100,v=+$('#m3').value,b=+$('#m4').value;
  $('#m1O').textContent=n;$('#m2O').textContent=Math.round(r*100)+'%';$('#m3O').textContent=v;$('#m4O').textContent=inr(b);
  const y=calcRev(n,r,v,b),ret=n*r*v*b,one=n*(1-r)*b;
  $('#mOut').innerHTML=`<div class="hi" style="grid-column:1/-1"><small>Yearly value of one month's new clients</small><b style="font-size:44px">${lakh(y)}</b><span style="font-size:13px;color:#CDBFB2">${(y/base).toFixed(1)}× the assumed today (${lakh(base)})</span></div><div><small>From returners</small><b>${lakh(ret)}</b></div><div><small>From one-time visits</small><b>${lakh(one)}</b></div>`;
  const mx=Math.max(y,base,1);$('#mBars').innerHTML=[['Assumed today',base,'#A9B2C0'],['Your levers',y,'#138A60']].map(([l,v,c])=>`<div style="display:grid;grid-template-columns:110px 1fr 90px;gap:10px;align-items:center;margin:6px 0;font-size:13px"><span>${l}</span><div style="height:18px;background:#F2EEE8"><div style="height:100%;width:${v/mx*100}%;background:${c};border-radius:0 4px 4px 0;transition:width .35s"></div></div><b style="font-family:var(--mono)">${lakh(v)}</b></div>`).join('');
  const lv=$('#lossV');if(lv)lv.textContent=lakh(Math.max(calcRev(75,.5,8,2000)-base,0));}
['m1','m2','m3','m4'].forEach(id=>$('#'+id).addEventListener('input',()=>{$$('#rvPreset button').forEach(x=>x.classList.remove('on'));model()}));
$$('#rvPreset button').forEach(b=>b.onclick=()=>{$$('#rvPreset button').forEach(x=>x.classList.remove('on'));b.classList.add('on');const p=P[b.dataset.p];['m1','m2','m3','m4'].forEach((id,i)=>$('#'+id).value=p[i]);model()});
model();

/* ---------- multi-location checklist ---------- */
const ML=['One Google Business Profile per branch, verified before opening','Primary category "Hair salon" on every profile','One phone number per branch — same everywhere online','A branch page on the website: map, hours, prices, stylists','Branch-level tracking: calls, WhatsApp clicks, bookings','One booking system across all branches','Review QR + thank-you message from the first client','Separate campaigns per branch with their own budget','Monthly branch scorecard: Scale · Hold · Fix · Cut','Membership valid at every branch'];
const mlS=store.get('as-ml')||{};
$('#mlchk').innerHTML=ML.map((t,i)=>`<label><input type="checkbox" data-i="${i}" ${mlS[i]?'checked':''}><span>${t}</span></label>`).join('');
$$('#mlchk input').forEach(c=>c.onchange=()=>{mlS[c.dataset.i]=c.checked;store.set('as-ml',mlS)});

/* ---------- season calendar ---------- */
const CAL=[['OCT','Festive prep','Party hair, nails, colour refresh. Push the hero botox offer.',.8],['NOV','Diwali + wedding season opens','Pre-bridal packages, group bookings, gift cards.',1],['DEC','Weddings · Christmas · NYE','Bridal & party make-up, late-evening slots after 7 pm.',1],['JAN','Repair season','Post-party hair repair: botox, nanoplastia, spa. Membership launch.',.7],['FEB','Weddings · Valentine\'s','Couples grooming, men\'s packages, last bridal window.',.85],['MAR','Women\'s Day · summer prep','Women\'s Day offer (8 Mar), frizz-control before humidity.',.65]];
$('#cal').innerHTML=CAL.map(c=>`<div class="m"><small>${c[0]}</small><b>${c[1]}</b><span>${c[2]}</span><div class="lv" style="width:${c[3]*100}%"></div></div>`).join('');

/* ---------- plan ---------- */
const PL=[[1,'Remove noindex, real title & description, Search Console + sitemap','Site is hidden from Google','Pages start appearing in search','Pages indexed','Low','P1',1],[2,'One number, one address, one set of hours on site, Google, Instagram','3 numbers, 2 addresses, 3 hours','Fewer lost calls; local ranking','Listings consistent','Low','P1',1],[3,'Fix the homepage: real hero, ★4.9, remove "0 +", fix dead links, typos, chat pop-up & phone layout','First impression','More clicks to book','Home → WhatsApp %','Low','P1',1],[4,'Review engine: counter QR + WhatsApp thank-you, never pressured','35 vs 3,580','Steady review growth','Reviews / month','Low','P1',1],[5,'Tracking: GA4 events, WhatsApp click tracking, "how did you hear" at the counter','Nothing is measured','A baseline in 30 days','Bookings by source','Low','P1',1],
[6,'Treatment pages: botox, nanoplastia, keratin, colour, nails, bridal — price, before/after, stylist','Rivals\' reviews sell these','Search + conversion','Page → booking %','Med','P1',2],[7,'Google profile: Hair salon category, 20 real photos, weekly posts, services with prices, booking link','Maps is the main door','More calls & directions','Profile actions','Low','P1',2],[8,'Booking flow + menu redesign: one system — service, stylist, slot, confirmation','Chat back-and-forth','Fewer drop-offs','Enquiry → booked %','Med','P1',2],[9,'Instagram rhythm: before/after, stylist spotlights, weekend slots','Shop window','Trust + demand','DMs & WhatsApps from IG','Med','P2',2],[10,'Ads test: hero treatments + "after 7 pm" within 3 km','Late hours are unique','New clients at known cost','Cost per booking','Med','P2',2],
[11,'Rebooking reminders by service cycle on WhatsApp','Clients drift','More repeat visits','60-day return rate','Med','P1',3],[12,'Membership / prepaid card designed with you','16 nearby rivals','Locked-in regulars','Members · visits / yr','Med','P2',3],[13,'Refer-a-friend and win-back for 60+ day lapsed clients','Word of mouth','Cheapest new clients','Referred clients','Low','P2',3],[14,'Monthly growth report: bookings, sources, revenue, reviews — per branch','Decide with data','Spend follows results','Report used','Low','P1',3]];
const phs={1:['Days 1–30 · Switch the lights on','#C8423A'],2:['Days 31–60 · Win the street','#B8875B'],3:['Days 61–90 · Fill the diary','#138A60']};
const plS=store.get('as-plan')||{};let pf='all';
function drawPlan(){let h='<div class="rw hd"><span>#</span><span>Action</span><span>Why</span><span>Expected impact</span><span>KPI</span><span>Effort</span><span>Priority</span></div>',last=0;
  PL.filter(p=>pf==='all'||(pf==='P1'&&p[6]==='P1')||(pf==='Low'&&p[5]==='Low')).forEach(p=>{if(p[7]!==last){last=p[7];h+=`<div class="ph"><span style="background:${phs[p[7]][1]}">${phs[p[7]][0]}</span></div>`}
  h+=`<div class="rw ${plS[p[0]]?'done':''}"><label><input type="checkbox" data-i="${p[0]}" ${plS[p[0]]?'checked':''}><b style="color:var(--mute)">${p[0]}</b></label><span class="act"><b>${p[1].split(':')[0]}</b>${p[1].includes(':')?':'+p[1].split(':').slice(1).join(':'):''}</span><span>${p[2]}</span><span>${p[3]}</span><span>${p[4]}</span><b>${p[5]}</b><span class="pr" style="color:${p[6]==='P1'?'var(--red)':'var(--amber)'}">${p[6]}</span></div>`});
  $('#plan').innerHTML=h;const done=Object.values(plS).filter(Boolean).length;$('#pprog').textContent=done?`${done} / 14 done`:'';
  $$('#plan input').forEach(c=>c.onchange=()=>{plS[c.dataset.i]=c.checked;store.set('as-plan',plS);drawPlan()})}
$$('#pf button').forEach(b=>b.onclick=()=>{$$('#pf button').forEach(x=>x.classList.remove('on'));b.classList.add('on');pf=b.dataset.f;drawPlan()});drawPlan();

/* ---------- priority matrix ---------- */
const PM={1:[15,12],2:[15,27],4:[28,16],3:[22,34],5:[33,40],7:[39,25],14:[30,45],13:[45,47],6:[60,13],11:[78,15],8:[65,20],12:[86,28],10:[72,31],9:[55,40]};
const pmEl=$('#pm');Object.entries(PM).forEach(([n,[x,y]])=>{const p=PL[n-1];const d=document.createElement('b');d.className='dt';d.textContent=n;d.style.left=x+'%';d.style.top=y+'%';d.style.background=x<50?'var(--green)':'var(--gold)';bindTip(d,`<b>${n} · ${p[1].split(':')[0]}</b><br>Effort ${p[5]} · ${p[6]}<br>KPI: ${p[4]}`);pmEl.appendChild(d)});
const SC=[['Website',2,'Good looks, real price list; noindex, "0 +", dead links, phone layout'],['SEO',1,'Homepage blocked from search; no treatment pages'],['Local / Google',3,'4.9★, long hours; only 35 reviews; "Beauty parlour" category'],['Reviews & reputation',3,'Excellent quality, very low volume'],['Instagram & content',0,'Linked; activity not readable from here'],['Paid media',0,'Not verifiable publicly'],['Booking',2,'WhatsApp link; no slots, three numbers'],['Offers & pricing',3,'Published — duplicates, one offer above list price'],['Retention',0,'No reminders or membership visible'],['Measurement',1,'No tracking visible in fetched pages'],['In-salon experience',5,'Reviews: space, valet, staff, cleanliness']];
$('#score').innerHTML='<div class="rw" style="font:500 10px var(--mono);letter-spacing:.1em;color:var(--mute);border-bottom:2px solid var(--ink)"><span>AREA</span><span>SCORE</span><span>EVIDENCE</span></div>'+SC.map(s=>`<div class="rw"><b>${s[0]}</b><div style="display:flex;gap:8px;align-items:center"><div class="bars ${s[1]?'':'x'}">${[1,2,3,4,5].map(k=>`<i class="${k<=s[1]?'f':''}"></i>`).join('')}</div><b style="font:600 12px var(--mono)">${s[1]?s[1]+'/5':'?'}</b></div><span>${s[2]}</span></div>`).join('')+'<div class="fine">Scored 1–5 from public evidence, 11–12 Oct 2026 · "?" = can\'t be scored without your data</div>';

/* ---------- case bars ---------- */
function caseBars(el,rows){el.innerHTML=rows.map(r=>{const mx=Math.max(r[1],r[2]);return `<div class="r"><span><b>${r[0]}</b></span><div class="bb"><i style="width:0;background:#C9BFB5" data-w="${r[1]/mx*100}"></i><em>${r[3]}</em><i style="width:0;background:${r[5]||'var(--green)'}" data-w="${r[2]/mx*100}"></i><em>${r[4]}</em></div></div>`}).join('');onView(el,()=>$$('i',el).forEach(i=>i.style.width=i.dataset.w+'%'))}
caseBars($('#caseBars'),[['Monthly clicks',24660,92478,'Jul 2025 · ~24.7k','Jul 2026 · 92.5k'],['Cost per click',10.7,4.70,'Jul 2025 · ₹10.7','Jul 2026 · ₹4.70'],['Enquiries',8303,19821,'Jul 2025 · ~8.3k','Jul 2026 · 19.8k']]);
caseBars($('#case2Bars'),[['Cost per conversion',1200,303,'Trailing 12-mo avg · ~₹1,200','Aug 2026 · ₹303'],['ROAS',2.74,24.3,'All other campaigns · 2.74×','Performance Max · 24.3×']]);

})();
