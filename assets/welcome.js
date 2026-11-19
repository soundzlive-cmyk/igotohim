(function(){
  var KEY='igotohim-welcome-seen';
  function seen(){try{return sessionStorage.getItem(KEY)==='1'}catch(e){return false}}
  function mark(){try{sessionStorage.setItem(KEY,'1')}catch(e){}}
  function init(){
    var m=document.getElementById('welcome-modal');if(!m)return;
    var force=/[?&#]welcome\b/.test(location.search+location.hash);
    if(seen()&&!force)return;
    var DAYS=['sun','mon','tue','wed','thu','fri','sat'];
    var dm=(location.search+location.hash).match(/day=(sun|mon|tue|wed|thu|fri|sat)/);var today=dm?dm[1]:DAYS[new Date().getDay()];
    var all=[].slice.call(m.querySelectorAll('.wm-slide'));
    var pick=all.filter(function(s){return (' '+s.dataset.days+' ').indexOf(' '+today+' ')>-1});
    if(!pick.length)pick=all.filter(function(s){return /\ball\b|mon|sat/.test(s.dataset.days)});
    all.forEach(function(s){if(pick.indexOf(s)<0)s.remove()});
    var ratio=0;pick.forEach(function(s,k){s.src=s.dataset.src;if(k===0)s.classList.add('on');ratio=Math.max(ratio,(+s.getAttribute('height'))/(+s.getAttribute('width')))});
    var box=m.querySelector('.wm-slides');if(ratio)box.style.aspectRatio=(1/ratio).toFixed(4);
    var dwrap=m.querySelector('.wm-dots');if(pick.length>1){dwrap.innerHTML=pick.map(function(_,k){return '<button type="button" class="wm-dot'+(k?'':' on')+'" aria-label="Show message '+(k+1)+'"></button>'}).join('')}else{dwrap.remove()}
    var slides=m.querySelectorAll('.wm-slide'),dots=m.querySelectorAll('.wm-dot'),i=0,timer=null,last=null;
    var reduce=window.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches;
    function go(n){if(slides.length<2)return;slides[i].classList.remove('on');dots[i].classList.remove('on');i=(n+slides.length)%slides.length;slides[i].classList.add('on');dots[i].classList.add('on')}
    function start(){if(reduce||slides.length<2)return;stop();timer=setInterval(function(){go(i+1)},5000)}
    function stop(){if(timer)clearInterval(timer);timer=null}
    function open(){last=document.activeElement;m.hidden=false;requestAnimationFrame(function(){m.classList.add('show')});document.body.style.overflow='hidden';m.querySelector('.wm-close').focus();start();mark()}
    function close(){stop();m.classList.remove('show');document.body.style.overflow='';setTimeout(function(){m.hidden=true},250);if(last&&last.focus)last.focus()}
    m.querySelectorAll('[data-close]').forEach(function(b){b.addEventListener('click',close)});
    m.querySelectorAll('.wm-actions a').forEach(function(a){a.addEventListener('click',function(){mark()})});
    dots.forEach(function(d,k){d.onclick=function(){go(k);start()}});
    var x0=null,box=m.querySelector('.wm-slides');
    box.addEventListener('touchstart',function(e){x0=e.touches[0].clientX},{passive:true});
    box.addEventListener('touchend',function(e){if(x0===null)return;var dx=e.changedTouches[0].clientX-x0;if(Math.abs(dx)>40){go(i+(dx<0?1:-1));start()}x0=null});
    document.addEventListener('keydown',function(e){
      if(m.hidden)return;
      if(e.key==='Escape')close();
      if(e.key==='ArrowRight'){go(i+1);start()} if(e.key==='ArrowLeft'){go(i-1);start()}
      if(e.key==='Tab'){var f=m.querySelectorAll('button,a');var a=f[0],z=f[f.length-1];if(e.shiftKey&&document.activeElement===a){e.preventDefault();z.focus()}else if(!e.shiftKey&&document.activeElement===z){e.preventDefault();a.focus()}}
    });
    setTimeout(open,900);
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();
