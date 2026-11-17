(function(){
  function init(){
    var root=document.querySelector('.slideshow');if(!root)return;
    var slides=root.querySelectorAll('.slide'),dots=root.querySelectorAll('.dot'),i=0,timer=null;
    var reduce=window.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches;
    function go(n){slides[i].classList.remove('on');dots[i].classList.remove('on');dots[i].removeAttribute('aria-current');
      i=(n+slides.length)%slides.length;slides[i].classList.add('on');dots[i].classList.add('on');dots[i].setAttribute('aria-current','true')}
    function start(){if(reduce)return;stop();timer=setInterval(function(){go(i+1)},5000)}
    function stop(){if(timer)clearInterval(timer);timer=null}
    root.querySelector('.prev').onclick=function(){go(i-1);start()};
    root.querySelector('.next').onclick=function(){go(i+1);start()};
    dots.forEach(function(d,k){d.onclick=function(){go(k);start()}});
    root.addEventListener('mouseenter',stop);root.addEventListener('mouseleave',start);
    root.addEventListener('focusin',stop);root.addEventListener('focusout',start);
    var x0=null;root.addEventListener('touchstart',function(e){x0=e.touches[0].clientX},{passive:true});
    root.addEventListener('touchend',function(e){if(x0===null)return;var dx=e.changedTouches[0].clientX-x0;if(Math.abs(dx)>40){go(i+(dx<0?1:-1));start()}x0=null});
    document.addEventListener('visibilitychange',function(){document.hidden?stop():start()});
    start();
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();
