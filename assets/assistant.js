/* IGotoHim Welcome Assistant
   A guided chat that answers common questions and collects a connection card
   for new visitors and members. Submissions go to cfg.formEmail via FormSubmit. */
(function () {
  var cfg = window.IGOTOHIM_CONFIG || {};
  var TO = (cfg.formEmail || '').trim();
  var ZOOM = cfg.bibleStudyUrl || 'events.html#bible-study';
  var GIVE = cfg.givingUrl || 'giving.html';
  var MAP = 'https://maps.google.com/?q=200+North+Cary+Street+Brockton+MA+02302';

  /* ---------- Knowledge base for questions ---------- */
  var FAQ = [
    { k: ['time', 'when', 'service', 'sunday', 'start', 'hour', 'schedule'],
      a: 'Sunday worship is at <b>11:00 AM</b> at 200 North Cary Street, Brockton, MA. You can also watch live on Facebook. On <a href="events.html#family-first">Family First Sundays</a> there is no in-church service.' },
    { k: ['bible study', 'wednesday', 'zoom', 'study'],
      a: 'Bible Study is every <b>Wednesday at 7:30 PM on Zoom</b>. <a href="' + ZOOM + '" target="_blank" rel="noopener">Join the Zoom here</a>.' },
    { k: ['where', 'address', 'location', 'directions', 'located', 'find you'],
      a: 'We meet at <b>200 North Cary Street, Brockton, MA 02302</b>. <a href="' + MAP + '" target="_blank" rel="noopener">Get directions</a>.' },
    { k: ['park', 'parking'],
      a: 'Street parking is available on North Cary Street. Look for a greeter at the front door.' },
    { k: ['kid', 'child', 'children', 'son', 'daughter', 'hosanna'],
      a: 'Kids have their own Sunday service with <b>Hosanna Kids</b>, led by Janelle Washington. They learn Bible stories, memorize Scripture and discover how much God loves them.' },
    { k: ['wear', 'dress', 'clothes', 'attire'],
      a: 'Come as you are! There is no dress code. Wear whatever you’re comfortable in.' },
    { k: ['baptism', 'baptize', 'baptized'],
      a: 'We’d love to celebrate your baptism! Candidates attend a foundational class on the significance and importance of baptism first. <a href="connect.html#baptism">Learn more</a>, or choose “Get baptized” below and I’ll let our pastors know.' },
    { k: ['saved', 'salvation', 'accept jesus', 'born again', 'become a christian'],
      a: 'Salvation is a free gift from God, and you can receive it today. Read the <a href="connect.html#get-saved">ABCs of salvation and a short prayer here</a>. If you prayed that prayer, tell me and we’ll celebrate with you!' },
    { k: ['give', 'giving', 'tithe', 'donate', 'offering', 'donation'],
      a: 'Thank you for your generosity! You can give securely online through <a href="' + GIVE + '" target="_blank" rel="noopener">EasyTithe</a>.' },
    { k: ['pastor', 'leader', 'leadership', 'who runs', 'drew', 'patrice'],
      a: 'IGotoHim is led by <b>Pastors Andrew (Drew) and Patrice Ambroise</b>. <a href="leadership.html">Meet all of our leaders</a>.' },
    { k: ['sermon', 'watch', 'online', 'live', 'youtube', 'facebook', 'stream'],
      a: 'Watch Sunday service live on Facebook at 11 AM, or catch up anytime in our <a href="sermons.html">Sermon Library</a>.' },
    { k: ['family first'],
      a: 'On <b>Family First Sundays</b> there is no in-church service. Our families are the first ministry God gave us, so we set that day aside for members to rest and worship at home. <a href="events.html#family-first">Learn more</a>.' },
    { k: ['member', 'membership', 'join the church', 'join'],
      a: 'We’d love for you to become part of the IGotoHim family! Choose “Become a member” below and I’ll take a few details so our pastors can reach out about next steps.' },
    { k: ['how long', 'length', 'long is'],
      a: 'Our worship is Spirit-led, with prayer, praise and a Bible-based message. Arrive about 10 minutes early and a greeter will help you find a seat.' },
    { k: ['serve', 'volunteer', 'help out'],
      a: 'We love when people use their gifts! We serve together on Monthly Service Sundays and at local giveback events. Choose “Become a member” or “Plan a visit” and mark “Serving” as an interest.' },
    { k: ['history', 'hosanna international', 'about the church', 'who are you', 'beliefs', 'believe'],
      a: 'IGotoHim (formerly Hosanna International Ministries) is a Bible-based, prayer-focused church in Brockton. Our mission is to serve our community, spread God’s love and teach God’s Word. <a href="about.html">Read our story</a>.' }
  ];
  function findAnswer(q) {
    q = ' ' + q.toLowerCase() + ' ';
    var best = null, score = 0;
    FAQ.forEach(function (f) {
      var s = 0;
      f.k.forEach(function (k) { if (q.indexOf(k) > -1) s += k.length; });
      if (s > score) { score = s; best = f; }
    });
    return best ? best.a : null;
  }

  /* ---------- UI ---------- */
  var root, log, input, form, chips, state = {}, step = null, sending = false;

  function el(tag, cls, html) { var e = document.createElement(tag); if (cls) e.className = cls; if (html != null) e.innerHTML = html; return e; }
  function esc(s) { return String(s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  function scroll() { log.scrollTop = log.scrollHeight; }

  function bot(html, delay) {
    return new Promise(function (res) {
      var t = el('div', 'ga-msg ga-bot ga-typing', '<span></span><span></span><span></span>');
      log.appendChild(t); scroll();
      setTimeout(function () { t.className = 'ga-msg ga-bot'; t.innerHTML = html; scroll(); res(); }, delay == null ? 550 : delay);
    });
  }
  function me(text) { log.appendChild(el('div', 'ga-msg ga-me', esc(text))); scroll(); }

  function options(list, opts) {
    opts = opts || {};
    chips.innerHTML = '';
    var picked = [];
    list.forEach(function (o) {
      var b = el('button', 'ga-chip', esc(o.label || o)); b.type = 'button';
      b.onclick = function () {
        if (opts.multi) {
          var v = o.value || o.label || o, i = picked.indexOf(v);
          if (i > -1) { picked.splice(i, 1); b.classList.remove('on'); } else { picked.push(v); b.classList.add('on'); }
          b.setAttribute('aria-pressed', i < 0);
          return;
        }
        chips.innerHTML = ''; me(o.label || o); (o.go || opts.go)(o.value || o.label || o);
      };
      if (opts.multi) b.setAttribute('aria-pressed', 'false');
      chips.appendChild(b);
    });
    if (opts.multi) {
      var d = el('button', 'ga-chip ga-done', 'Done ✓'); d.type = 'button';
      d.onclick = function () { chips.innerHTML = ''; me(picked.length ? picked.join(', ') : 'None right now'); opts.go(picked); };
      chips.appendChild(d);
    }
    if (opts.skip) {
      var s = el('button', 'ga-chip ga-skip', 'Skip'); s.type = 'button';
      s.onclick = function () { chips.innerHTML = ''; me('Skip'); opts.skip(); };
      chips.appendChild(s);
    }
    scroll();
  }

  function ask(placeholder, handler, type) {
    step = handler;
    input.placeholder = placeholder || 'Type your answer…';
    input.type = type || 'text';
    input.focus({ preventScroll: true });
  }

  /* ---------- Flows ---------- */
  function menu(first) {
    step = freeQuestion; input.placeholder = 'Ask me anything…'; input.type = 'text';
    var go = function () {
      options([
        { label: '👋 Plan a visit', go: function () { startIntake('Planning a visit'); } },
        { label: '🏠 Become a member', go: function () { startIntake('Becoming a member'); } },
        { label: '💧 Get baptized', go: function () { startIntake('Baptism', ['Baptism']); } },
        { label: '✝️ I want to get saved', go: saved },
        { label: '🙏 Prayer request', go: prayer },
        { label: '❓ Ask a question', go: function () { bot('Sure! Type your question below.').then(function () { ask('Ask me anything…', freeQuestion); }); } }
      ]);
    };
    if (first) bot('Hi there, and welcome to <b>IGotoHim</b>! 👋 I’m here to help you get connected. What can I help you with today?', 300).then(go);
    else bot('Is there anything else I can help you with?').then(go);
  }

  function freeQuestion(q) {
    me(q);
    var a = findAnswer(q);
    if (a) {
      bot(a).then(function () { menu(); });
    } else {
      bot('That’s a great question. I don’t have that answer, but our team would love to help. Can I take your name and email so someone can get back to you?').then(function () {
        options([{ label: 'Yes, please', go: function () { state = { type: 'Question', question: q }; askName(function () { askEmail(confirm); }); } },
                 { label: 'No thanks', go: function () { menu(); } }]);
      });
    }
  }

  function saved() {
    bot('That’s the best decision you could ever make! 🎉 Salvation is a free gift. It’s as simple as A-B-C: <b>Admit</b> you need a Savior, <b>Believe</b> Jesus died and rose for you, and <b>Confess</b> Him as Lord. <a href="connect.html#get-saved">Read the full prayer here</a>.').then(function () {
      return bot('Would you like our pastors to reach out, pray with you and help with your next steps?');
    }).then(function () {
      options([{ label: 'Yes, please reach out', go: function () { startIntake('Got saved / new believer', ['Getting saved']); } },
               { label: 'Not right now', go: function () { menu(); } }]);
    });
  }

  function prayer() {
    state = { type: 'Prayer request' };
    bot('We would be honored to pray with you. 🙏 What is your first name?').then(function () {
      ask('Your first name', function (v) { me(v); state.name = v;
        bot('Thank you, ' + esc(v) + '. Please share your prayer request.').then(function () {
          ask('Your prayer request', function (r) { me(r); state.prayer = r;
            bot('If you’d like someone to follow up, what’s your email? (You can skip this.)').then(function () {
              options([], { skip: confirm });
              ask('you@example.com', function (e) { if (!validEmail(e)) { me(e); bot('Hmm, that email doesn’t look quite right. Please check it, or tap Skip.'); return; } me(e); chips.innerHTML = ''; state.email = e; confirm(); }, 'email');
            });
          });
        });
      });
    });
  }

  function validEmail(v) { return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v); }

  function askName(next) {
    bot('What’s your full name?').then(function () {
      ask('First and last name', function (v) {
        if (v.length < 2) { me(v); bot('Please enter your name.'); return; }
        me(v); state.name = v; next();
      });
    });
  }
  function askEmail(next) {
    bot('Nice to meet you, ' + esc(state.name.split(' ')[0]) + '! What’s the best email to reach you?').then(function () {
      ask('you@example.com', function (v) {
        me(v);
        if (!validEmail(v)) { bot('Hmm, that email doesn’t look quite right. Could you check it?'); return; }
        state.email = v; next();
      }, 'email');
    });
  }

  function startIntake(type, preset) {
    state = { type: type, interests: preset || [] };
    var intro = type === 'Baptism'
      ? 'Praise God! 💧 Baptism is a beautiful step of faith. Candidates attend a short foundational class first, and our pastors will reach out with details. Let’s start with a few questions.'
      : 'Wonderful! I’ll ask a few quick questions so our team can welcome you personally. It only takes a minute.';
    bot(intro).then(function () {
      askName(function () {
        askEmail(function () {
          bot('Would you like to share a phone number? It’s completely optional.').then(function () {
            options([], { skip: describe });
            ask('Phone number (optional)', function (v) { me(v); chips.innerHTML = ''; state.phone = v; describe(); }, 'tel');
          });
        });
      });
    });
  }

  function describe() {
    step = null; input.placeholder = 'Choose an option above';
    bot('Which best describes you?').then(function () {
      options(['I’m new to IGotoHim', 'I’ve visited and want to join', 'I’m reconnecting', 'I’m already a member'],
        { go: function (v) { state.describe = v; interests(); } });
    });
  }

  function interests() {
    bot('What would you like to learn more about? Pick as many as you like, then tap Done.').then(function () {
      var list = ['Sunday Worship', 'Bible Study (Zoom)', 'Hosanna Kids', 'Baptism', 'Membership', 'Serving / Volunteering', 'Prayer', 'Getting saved'];
      options(list, { multi: true, go: function (picked) {
        (state.interests || []).forEach(function (p) { if (picked.indexOf(p) < 0) picked.push(p); });
        state.interests = picked; kids();
      } });
      [].forEach.call(chips.querySelectorAll('.ga-chip'), function (b) {
        if ((state.interests || []).indexOf(b.textContent) > -1) { b.classList.add('on'); b.setAttribute('aria-pressed', 'true'); }
      });
    });
  }

  function kids() {
    bot('Do you have children who might join Hosanna Kids?').then(function () {
      options(['Yes', 'No'], { go: function (v) {
        if (v === 'Yes') {
          bot('Great! How many, and what ages? (Optional)').then(function () {
            options([], { skip: heard });
            ask('e.g. 2 kids, ages 6 and 9', function (a) { me(a); chips.innerHTML = ''; state.kids = 'Yes: ' + a; heard(); });
          });
        } else { state.kids = 'No'; heard(); }
      } });
    });
  }

  function heard() {
    step = null;
    bot('How did you hear about IGotoHim?').then(function () {
      options(['Friend or family', 'Social media', 'Google / web search', 'Drove by', 'Other'], { go: function (v) { state.heard = v; notes(); } });
    });
  }

  function notes() {
    bot('Anything else you’d like us to know, or a prayer request? (Optional)').then(function () {
      options([], { skip: confirm });
      ask('Type a note…', function (v) { me(v); chips.innerHTML = ''; state.notes = v; confirm(); });
    });
  }

  function summary() {
    var rows = [['Reason', state.type], ['Name', state.name], ['Email', state.email], ['Phone', state.phone],
      ['About', state.describe], ['Interests', (state.interests || []).join(', ')], ['Children', state.kids],
      ['Heard about us', state.heard], ['Question', state.question], ['Prayer request', state.prayer], ['Notes', state.notes]];
    return rows.filter(function (r) { return r[1]; });
  }

  function confirm() {
    step = null; input.placeholder = 'Choose an option above';
    var html = '<b>Here’s what I have:</b><ul class="ga-sum">' + summary().map(function (r) { return '<li><span>' + r[0] + '</span>' + esc(r[1]) + '</li>'; }).join('') + '</ul>Shall I send this to our team?';
    bot(html).then(function () {
      options([{ label: 'Send it ✓', go: submit }, { label: 'Start over', go: function () { state = {}; menu(); } }]);
    });
  }

  function submit() {
    if (sending) return; sending = true;
    var data = {}; summary().forEach(function (r) { data[r[0]] = r[1]; });
    data._subject = 'IGotoHim Connection Card: ' + (state.type || 'Website') + (state.name ? ' (' + state.name + ')' : '');
    data._template = 'table'; data._captcha = 'false'; data['Page'] = location.href;
    if (state.email) data._replyto = state.email;
    var t = el('div', 'ga-msg ga-bot ga-typing', '<span></span><span></span><span></span>'); log.appendChild(t); scroll();
    fetch('https://formsubmit.co/ajax/' + encodeURIComponent(TO), {
      method: 'POST', headers: { 'Content-Type': 'application/json', Accept: 'application/json' }, body: JSON.stringify(data)
    }).then(function (r) { return r.json().catch(function () { return {}; }).then(function (j) { return { ok: r.ok, j: j }; }); })
      .then(function (res) {
        t.remove();
        if (/activat/i.test(res.j.message || '')) throw Error('activation');
        if (!res.ok || String(res.j.success) === 'false') throw Error(res.j.message || 'failed');
        return done();
      })
      .catch(function () {
        t.remove();
        return bot('I’m sorry, I couldn’t send that just now. Please email us at <a href="mailto:contactus@igotohim.com">contactus@igotohim.com</a> and we’ll get right back to you.').then(function () { menu(); });
      })
      .then(function () { sending = false; });
  }

  function done() {
    var first = state.name ? esc(state.name.split(' ')[0]) : 'friend';
    var msg = state.type === 'Prayer request'
      ? 'Thank you, ' + first + '. Your prayer request has been sent, and our team will be praying with you. 🙏'
      : 'You’re all set, ' + first + '! 🎉 Our team will reach out soon. We can’t wait to meet you.';
    return bot(msg).then(function () {
      if (state.type === 'Prayer request') return;
      return bot('Here are some next steps:<div class="ga-links"><a href="contact.html#visit">📍 Plan your visit</a><a href="' + ZOOM + '" target="_blank" rel="noopener">📖 Join Bible Study (Wed 7:30 PM)</a><a href="connect.html">💧 Baptism & Get Saved</a><a href="sermons.html">▶️ Watch a sermon</a></div>');
    }).then(function () { state = {}; menu(); });
  }

  /* ---------- Build ---------- */
  function build() {
    root = el('div', 'ga');
    root.innerHTML =
      '<button type="button" class="ga-launch" aria-haspopup="dialog" aria-controls="ga-panel" aria-expanded="false">' +
        '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 5h16v11H8l-4 4z"/><path d="M8 9h8M8 12h5"/></svg><span>Get Connected</span></button>' +
      '<div class="ga-panel" id="ga-panel" role="dialog" aria-modal="false" aria-label="IGotoHim Welcome Assistant" hidden>' +
        '<div class="ga-head"><img src="assets/logo-white.png" alt=""><div><b>Welcome Assistant</b><small>Usually replies instantly</small></div>' +
        '<button type="button" class="ga-close" aria-label="Close assistant">×</button></div>' +
        '<div class="ga-log" role="log" aria-live="polite"></div><div class="ga-chips"></div>' +
        '<form class="ga-form"><input type="text" class="ga-input" aria-label="Your message" autocomplete="off"><button type="submit" class="ga-send" aria-label="Send"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 12l16-8-6 16-2-7z"/></svg></button></form>' +
      '</div>';
    document.body.appendChild(root);
    log = root.querySelector('.ga-log'); chips = root.querySelector('.ga-chips'); input = root.querySelector('.ga-input'); form = root.querySelector('.ga-form');
    var panel = root.querySelector('.ga-panel'), launch = root.querySelector('.ga-launch'), started = false;
    function open() {
      panel.hidden = false; root.classList.add('open'); launch.setAttribute('aria-expanded', 'true');
      if (!started) { started = true; menu(true); }
      setTimeout(function () { input.focus({ preventScroll: true }); }, 50);
    }
    function close() { panel.hidden = true; root.classList.remove('open'); launch.setAttribute('aria-expanded', 'false'); launch.focus(); }
    launch.onclick = function () { panel.hidden ? open() : close(); };
    root.querySelector('.ga-close').onclick = close;
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && !panel.hidden) close(); });
    form.onsubmit = function (e) {
      e.preventDefault(); var v = input.value.trim(); if (!v) return; input.value = '';
      if (step) { var s = step; s(v); } else { freeQuestion(v); }
    };
    document.querySelectorAll('[data-open-assistant]').forEach(function (a) { a.addEventListener('click', function (e) { e.preventDefault(); open(); }); });
    if (/[?&#]connect\b/.test(location.search + location.hash)) open();
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', build); else build();
})();
