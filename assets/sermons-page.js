(function(){
  function vid(v){v=(v||'').trim();var m=v.match(/(?:v=|youtu\.be\/|embed\/|shorts\/|live\/)([\w-]{11})/);if(m)return m[1];return /^[\w-]{11}$/.test(v)?v:null}
  function el(t,c,txt){var e=document.createElement(t);if(c)e.className=c;if(txt!=null)e.textContent=txt;return e}
  function fmt(d){if(!d)return '';var p=d.split('-');var dt=new Date(+p[0],(+p[1]||1)-1,+p[2]||1);return isNaN(dt)?d:dt.toLocaleDateString(undefined,{month:'long',day:'numeric',year:'numeric'})}
  var all=(window.IGOTOHIM_SERMONS||[]).map(function(s){return Object.assign({},s,{id:vid(s.video)})}).filter(function(s){return s.id});
  all.sort(function(a,b){return (b.date||'').localeCompare(a.date||'')});
  var state={cat:'All',preacher:'',q:''};
  function thumb(s,cls){var w=el('div',cls||'s-thumb');var img=el('img');img.loading='lazy';img.alt='';img.src='https://i.ytimg.com/vi/'+s.id+'/hqdefault.jpg';img.onerror=function(){img.remove()};w.append(img,el('span','s-play','▶'));return w}
  function open(s){
    var m=document.querySelector('#s-modal');m.querySelector('.s-modal-video').innerHTML='<iframe title="'+s.title.replace(/"/g,'&quot;')+'" src="https://www.youtube-nocookie.com/embed/'+s.id+'?autoplay=1" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen></iframe>';
    m.querySelector('.s-modal-title').textContent=s.title;
    m.querySelector('.s-modal-meta').textContent=[s.preacher,fmt(s.date),s.scripture].filter(Boolean).join(' · ');
    m.querySelector('.s-modal-yt').href='https://www.youtube.com/watch?v='+s.id;
    m.hidden=false;document.body.style.overflow='hidden';m.querySelector('.s-close').focus();
  }
  function close(){var m=document.querySelector('#s-modal');m.hidden=true;m.querySelector('.s-modal-video').innerHTML='';document.body.style.overflow=''}
  function card(s){
    var b=el('button','s-card');b.type='button';b.setAttribute('aria-label','Play '+s.title+' by '+s.preacher);
    var body=el('div','s-body');body.append(el('span','pill',s.category||'Sermon'),el('h3',null,s.title),el('div','s-preacher',s.preacher));
    var meta=[fmt(s.date),s.scripture].filter(Boolean).join(' · ');if(meta)body.append(el('div','s-meta',meta));
    b.append(thumb(s),body);b.onclick=function(){open(s)};return b}
  function render(){
    var list=all.filter(function(s){return (state.cat==='All'||s.category===state.cat)&&(!state.preacher||s.preacher===state.preacher)&&(!state.q||[s.title,s.preacher,s.category,s.scripture].join(' ').toLowerCase().indexOf(state.q)>-1)});
    var grid=document.querySelector('#s-grid');grid.innerHTML='';
    document.querySelector('#s-count').textContent=list.length+(list.length===1?' sermon':' sermons');
    if(!list.length){grid.append(el('div','empty','No sermons match. Try another category or search.'));return}
    if(state.cat==='All'&&!state.preacher&&!state.q){
      var groups={};list.forEach(function(s){(groups[s.category||'Sermon']=groups[s.category||'Sermon']||[]).push(s)});
      Object.keys(groups).forEach(function(c){var sec=el('div','s-group');var h=el('div','s-group-head');h.append(el('h2',null,c),el('span','s-group-count',groups[c].length+''));var g=el('div','s-cards');groups[c].forEach(function(s){g.append(card(s))});sec.append(h,g);grid.append(sec)});
    }else{var g=el('div','s-cards');list.forEach(function(s){g.append(card(s))});grid.append(g)}
  }
  function init(){
    if(!document.querySelector('#s-grid'))return;
    if(!all.length){document.querySelector('#s-grid').append(el('div','empty','Sermons will appear here soon.'));return}
    var f=all[0],feat=document.querySelector('#s-featured');feat.innerHTML='';
    var fb=el('button','s-feature');fb.type='button';var fi=el('div','s-feature-info');
    fi.append(el('div','eyebrow','LATEST MESSAGE'),el('h2',null,f.title),el('div','s-preacher',f.preacher),el('div','s-meta',[f.category,fmt(f.date),f.scripture].filter(Boolean).join(' · ')),el('span','btn','▶ Watch Now'));
    fb.append(thumb(f,'s-thumb big'),fi);fb.onclick=function(){open(f)};feat.append(fb);
    var cats=['All'];all.forEach(function(s){var c=s.category||'Sermon';if(cats.indexOf(c)<0)cats.push(c)});
    var chips=document.querySelector('#s-cats');
    cats.forEach(function(c){var n=c==='All'?all.length:all.filter(function(s){return (s.category||'Sermon')===c}).length;var b=el('button','chip'+(c==='All'?' on':''));b.type='button';b.textContent=c+' ('+n+')';b.setAttribute('aria-pressed',c==='All');b.onclick=function(){state.cat=c;chips.querySelectorAll('.chip').forEach(function(x){x.classList.remove('on');x.setAttribute('aria-pressed','false')});b.classList.add('on');b.setAttribute('aria-pressed','true');render()};chips.append(b)});
    var sel=document.querySelector('#s-preacher');var ps=[];all.forEach(function(s){if(s.preacher&&ps.indexOf(s.preacher)<0)ps.push(s.preacher)});ps.sort().forEach(function(p){var o=el('option',null,p);o.value=p;sel.append(o)});
    sel.onchange=function(){state.preacher=sel.value;render()};
    document.querySelector('#s-search').oninput=function(e){state.q=e.target.value.trim().toLowerCase();render()};
    var m=document.querySelector('#s-modal');m.querySelector('.s-close').onclick=close;m.onclick=function(e){if(e.target===m)close()};document.addEventListener('keydown',function(e){if(e.key==='Escape'&&!m.hidden)close()});
    render();
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();
