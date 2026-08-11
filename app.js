/* ==========================================================================
   DON'T TAKE THE BAIT — behaviour
   Four independent widgets. No dependencies, no build step, no network calls.
     1. Hero terminal   — the dramatised "attack", then the BOOM reveal
     2. Example tabs    — email / text / call
     3. Flag markers    — click a red flag, read why it is a red flag
     4. Quiz            — eight messages, real or scam

   Nothing here stores, sends or reads anything about the visitor. That is a
   promise the page makes in its own footer, so keep it true.
   ========================================================================== */

(function () {
  'use strict';

  var reduceMotion = window.matchMedia &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ======================================================================
     1. HERO TERMINAL
     Pure theatre. It must never look like it read anything real about the
     visitor — no IP, no browser string, no location. The reveal that follows
     says "nothing happened" and that has to be honestly true.
     ====================================================================== */

  var TERMINAL_SCRIPT = [
    { text: '$ ',                                            cls: 'prompt', pause: 300 },
    { text: './baitline --target visitor --mode DEMO\n',     cls: 'cmd',    pause: 550 },
    { text: '[*] delivering message to inbox ......... ',    cls: '',       pause: 380 },
    { text: 'sent\n',                                        cls: 'ok',     pause: 260 },
    { text: '[*] message opened ...................... ',    cls: '',       pause: 420 },
    { text: 'yes\n',                                         cls: 'ok',     pause: 260 },
    { text: '[*] link clicked ........................ ',    cls: '',       pause: 460 },
    { text: 'yes\n',                                         cls: 'ok',     pause: 300 },
    { text: '[*] lookalike login page served ......... ',    cls: '',       pause: 380 },
    { text: 'ok\n',                                          cls: 'ok',     pause: 260 },
    { text: '[!] waiting for password ................ ',    cls: 'warn',   pause: 900 },
    { text: 'received\n',                                    cls: 'warn',   pause: 400 },
    { text: '[!] waiting for 6-digit code ............ ',    cls: 'warn',   pause: 900 },
    { text: 'received\n',                                    cls: 'warn',   pause: 500 },
    { text: '\n[x] ACCOUNT COMPROMISED\n',                   cls: 'bad',    pause: 300 },
    { text: '[x] elapsed time: 41 seconds\n',                cls: 'bad',    pause: 700 }
  ];

  function runTerminal() {
    var body = document.getElementById('terminal-body');
    var reveal = document.getElementById('hero-reveal');
    if (!body || !reveal) { return; }

    // The div is formatted across lines in the HTML and the terminal renders
    // with white-space: pre-wrap, so that indentation would show up as a blank
    // first line. Clear it before writing anything.
    body.textContent = '';

    function finish(animate) {
      reveal.classList.remove('hidden');
      if (animate) { reveal.classList.add('reveal-anim'); }
    }

    // Someone arriving on a deep link (#signs, #clicked) wants that section,
    // not the intro. Play nothing: revealing the hero 7s late would shove the
    // page down and dump them in the middle of nowhere.
    var hash = window.location.hash;
    var deepLink = hash.length > 1;

    if (reduceMotion || deepLink) {
      TERMINAL_SCRIPT.forEach(function (line) { append(body, line); });
      finish(false);
      if (deepLink) { scrollToHash(hash); }
      return;
    }

    var cursor = document.createElement('span');
    cursor.className = 'cursor';
    body.appendChild(cursor);

    var i = 0;
    (function next() {
      if (i >= TERMINAL_SCRIPT.length) {
        cursor.remove();
        finish(true);
        return;
      }
      var line = TERMINAL_SCRIPT[i++];
      body.insertBefore(buildSpan(line), cursor);
      setTimeout(next, line.pause);
    })();
  }

  // Re-run the browser's anchor jump once the hero is at its real height.
  function scrollToHash(hash) {
    requestAnimationFrame(function () {
      var target;
      try { target = document.querySelector(hash); } catch (e) { return; }
      if (target) { target.scrollIntoView(); }
    });
  }

  function buildSpan(line) {
    var span = document.createElement('span');
    if (line.cls) { span.className = line.cls; }
    span.textContent = line.text;
    return span;
  }

  function append(body, line) { body.appendChild(buildSpan(line)); }

  /* ======================================================================
     2. EXAMPLE TABS
     ====================================================================== */

  function initTabs() {
    var tabs = Array.prototype.slice.call(document.querySelectorAll('[role="tab"]'));
    if (!tabs.length) { return; }

    function select(tab) {
      tabs.forEach(function (t) {
        var panel = document.getElementById(t.getAttribute('aria-controls'));
        var on = (t === tab);
        t.setAttribute('aria-selected', on ? 'true' : 'false');
        t.tabIndex = on ? 0 : -1;
        if (panel) { panel.classList.toggle('hidden', !on); }
      });
      resetReadout();
      updateProgress();
    }

    tabs.forEach(function (tab, index) {
      tab.tabIndex = tab.getAttribute('aria-selected') === 'true' ? 0 : -1;
      tab.addEventListener('click', function () { select(tab); });
      tab.addEventListener('keydown', function (e) {
        var step = e.key === 'ArrowRight' ? 1 : e.key === 'ArrowLeft' ? -1 : 0;
        if (!step) { return; }
        e.preventDefault();
        var target = tabs[(index + step + tabs.length) % tabs.length];
        select(target);
        target.focus();
      });
    });
  }

  /* ======================================================================
     3. FLAG MARKERS
     ====================================================================== */

  var readout, progressEl;

  function activePanel() {
    return document.querySelector('[role="tabpanel"]:not(.hidden)');
  }

  function resetReadout() {
    if (!readout) { return; }
    document.querySelectorAll('.flag-btn[aria-expanded="true"]').forEach(function (b) {
      b.setAttribute('aria-expanded', 'false');
    });
    readout.querySelector('h3') && readout.querySelector('h3').remove();
    var p = readout.querySelector('p:not(.flag-progress)');
    if (p) {
      p.className = 'placeholder';
      p.textContent = '> awaiting selection — choose any ⚑ mark above';
    }
  }

  function updateProgress() {
    var panel = activePanel();
    if (!panel || !progressEl) { return; }
    var all = panel.querySelectorAll('.flag-btn');
    var seen = panel.querySelectorAll('.flag-btn.seen');
    var bars = '';
    for (var i = 0; i < all.length; i++) { bars += (i < seen.length ? '█' : '░'); }
    progressEl.textContent = 'FOUND ' + seen.length + '/' + all.length + '  ' + bars +
      (seen.length === all.length && all.length ? '  ✓ all flags reviewed' : '');
  }

  function initFlags() {
    readout = document.getElementById('readout');
    progressEl = document.getElementById('progress');
    if (!readout) { return; }

    document.querySelectorAll('.flag-btn').forEach(function (btn) {
      btn.setAttribute('type', 'button');
      btn.setAttribute('aria-expanded', 'false');

      btn.addEventListener('click', function () {
        // Only one open at a time — the readout is a single shared panel.
        document.querySelectorAll('.flag-btn[aria-expanded="true"]').forEach(function (o) {
          if (o !== btn) { o.setAttribute('aria-expanded', 'false'); }
        });
        btn.setAttribute('aria-expanded', 'true');
        btn.classList.add('seen');

        var title = document.createElement('h3');
        title.textContent = '⚑ ' + btn.dataset.title;
        var body = document.createElement('p');
        body.textContent = btn.dataset.explain;

        readout.innerHTML = '';
        readout.appendChild(title);
        readout.appendChild(body);
        var prog = document.createElement('p');
        prog.className = 'flag-progress';
        prog.id = 'progress';
        readout.appendChild(prog);
        progressEl = prog;

        updateProgress();
      });
    });

    updateProgress();
  }

  /* ======================================================================
     4. QUIZ
     Three of the eight are genuine on purpose. Teaching "be suspicious of
     everything" produces people who ignore real fraud alerts.
     ====================================================================== */

  var QUESTIONS = [
    {
      from: 'From: Netflix <no-reply@netflix-billing-update.com>',
      text: 'Your payment method was declined. Update your billing details within 48 hours or your membership will be cancelled. → netflix-billing-update.com/renew',
      answer: 'scam',
      why: 'The address is netflix-billing-update.com, which is not netflix.com — it is a completely different website that simply has the word "netflix" in its name. Add the 48-hour deadline and it is textbook. If you ever wonder about your subscription, open the app you already have.'
    },
    {
      from: 'Text from: Google',
      text: 'G-385920 is your Google verification code. Do not share it with anyone.',
      answer: 'real',
      why: 'This one is genuine — and it is the most misunderstood message in this quiz. A code arriving by itself is normal and harmless. The scam is the phone call or chat that arrives right after, asking you to read it out. If you did not just try to log in somewhere, someone has your password: go and change it.'
    },
    {
      from: 'From: IT Helpdesk <it.helpdesk@company-support-portal.net>',
      text: 'We are conducting a mandatory password audit. Please reply to this email with your current username and password to confirm your account remains active.',
      answer: 'scam',
      why: 'No IT department on earth needs your password — they can reset it without ever knowing it. Any request to send a password, by email, chat or phone, is a scam with no exceptions. Real internal mail also comes from your own company domain, not a "support portal" one.'
    },
    {
      from: 'Text from: NorthPoint (short code 60217)',
      text: 'A payment of $84.20 to TESCO STORES was authorised on your card ending 4471 at 14:32. If this was not you, call the number on the back of your card.',
      answer: 'real',
      why: 'Genuine. Notice what it does NOT do: no link, no attachment, no deadline, no request for details — and it points you to the number on your own card rather than giving you one. That is exactly the shape of a real alert. A scam version would supply its own "fraud line" number.'
    },
    {
      from: 'Text from: +44 7700 900281 (unknown number)',
      text: 'Hi Mum, I dropped my phone down the toilet so this is my new number. Save it. Actually I need a favour — I missed a bill payment, can you send £250 to this account? I will explain later x',
      answer: 'scam',
      why: 'The "Hi Mum" scam, and one of the most common in the world. It opens by explaining away the unfamiliar number, then moves to money fast. Call the number you already have for that person before doing anything. This is exactly what a family safe word is for.'
    },
    {
      from: 'Text from: +1 (415) 555-0177',
      text: 'State Toll Services: our records show an outstanding toll of $6.45. Settle within 24 hours to avoid a $50 late fee and a report to the DMV: stateroads-tolls.icu/pay',
      answer: 'scam',
      why: 'Small amount, big threatened penalty, tight deadline, and a .icu address that belongs to nobody official. Toll authorities bill by post or through the account you already set up. This one exploded in popularity because the sum is too small to feel worth arguing about.'
    },
    {
      from: 'Notification from: the Amazon app on your phone',
      text: 'Your order is out for delivery and should arrive today between 2pm and 4pm. Track it in the app.',
      answer: 'real',
      why: 'Genuine. It arrived inside an app you installed and signed into yourself, it refers to something you actually ordered, it asks for nothing, and it keeps you inside the app rather than sending you off to a website. Notifications from an app you installed cannot be spoofed by a stranger the way a text or email can.'
    },
    {
      from: 'From: Sarah Whitcombe, CEO <s.whitcombe.exec.office@outlook.com>',
      text: 'Are you at your desk? I need a favour and I am stuck in meetings all day so I cannot take calls. Please buy 5 x $100 Apple gift cards for a client thank-you and send me photos of the codes. I will get you expensed by Friday. Keep this between us for now.',
      answer: 'scam',
      why: 'Every ingredient at once: a personal email address rather than the company one, authority, urgency, a reason you cannot verify by voice, secrecy, and gift cards — which are the classic demand because they are untraceable and unrefundable. No real executive has ever needed this. Walk over and ask someone.'
    }
  ];

  function initQuiz() {
    var play    = document.getElementById('quiz-play');
    var done    = document.getElementById('quiz-done');
    if (!play || !done) { return; }

    var countEl = document.getElementById('quiz-count');
    var scoreEl = document.getElementById('quiz-score');
    var barFill = document.getElementById('quiz-bar-fill');
    var fromEl  = document.getElementById('quiz-from');
    var textEl  = document.getElementById('quiz-text');
    var answers = document.getElementById('quiz-answers');
    var feedback = document.getElementById('quiz-feedback');
    var verdict = document.getElementById('quiz-verdict');
    var explain = document.getElementById('quiz-explain');
    var nextBtn = document.getElementById('quiz-next');
    var buttons = Array.prototype.slice.call(answers.querySelectorAll('button'));

    var index = 0, score = 0;

    function render() {
      var q = QUESTIONS[index];
      countEl.textContent = 'QUESTION ' + (index + 1) + ' / ' + QUESTIONS.length;
      scoreEl.textContent = 'SCORE ' + score;
      barFill.style.width = ((index / QUESTIONS.length) * 100) + '%';
      fromEl.textContent = q.from;
      textEl.textContent = q.text;
      feedback.classList.add('hidden');
      buttons.forEach(function (b) { b.disabled = false; });
      nextBtn.textContent = (index === QUESTIONS.length - 1) ? 'See my result →' : 'Next question →';
    }

    function answer(choice) {
      var q = QUESTIONS[index];
      var correct = (choice === q.answer);
      if (correct) { score++; }

      buttons.forEach(function (b) { b.disabled = true; });
      feedback.classList.remove('hidden', 'right', 'wrong');
      feedback.classList.add(correct ? 'right' : 'wrong');
      verdict.textContent = correct
        ? '✅ Correct — this one is ' + (q.answer === 'scam' ? 'a scam' : 'genuine')
        : '✗ Not quite — this one is ' + (q.answer === 'scam' ? 'a scam' : 'genuine');
      explain.textContent = q.why;
      scoreEl.textContent = 'SCORE ' + score;
      // Move focus for keyboard and screen-reader users, but do not let the
      // browser scroll to it — combined with scroll-behavior: smooth that
      // lurches the page and pushes the answer buttons off the top.
      nextBtn.focus({ preventScroll: true });
    }

    function advance() {
      index++;
      if (index >= QUESTIONS.length) { showResult(); } else { render(); }
    }

    function showResult() {
      play.classList.add('hidden');
      done.classList.remove('hidden');
      document.getElementById('final-score').textContent = score + '/' + QUESTIONS.length;

      var title, message;
      if (score === QUESTIONS.length) {
        title = 'Full marks.';
        message = 'You can already read these. The most useful thing you can do now is walk someone else through this page — the people most at risk are the least likely to find it.';
      } else if (score >= 6) {
        title = 'Strong.';
        message = 'You spot the obvious ones reliably. Re-read the explanations for the two you missed; the ones that catch people are almost never the ones they expect.';
      } else if (score >= 4) {
        title = 'A solid start.';
        message = 'You are in the majority here, and that is exactly why these scams still work. Go back to the five warning signs — the pattern matters far more than any single message.';
      } else {
        title = 'Worth another pass.';
        message = 'This is genuinely not obvious, and getting it wrong here costs nothing — which is the entire point of practising. Re-read section 02, then run this again. It sticks fast.';
      }
      document.getElementById('final-title').textContent = title;
      document.getElementById('final-message').textContent = message;
    }

    buttons.forEach(function (b) {
      b.addEventListener('click', function () { answer(b.dataset.answer); });
    });
    nextBtn.addEventListener('click', advance);
    document.getElementById('quiz-restart').addEventListener('click', function () {
      index = 0; score = 0;
      done.classList.add('hidden');
      play.classList.remove('hidden');
      render();
    });

    render();
  }

  /* ====================================================================== */

  function init() {
    runTerminal();
    initTabs();
    initFlags();
    initQuiz();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
