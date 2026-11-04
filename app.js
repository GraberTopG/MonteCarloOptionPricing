/* Slide engine for the Monte Carlo web app.
   - Fixed 1920x1080 stage, scaled to the window (record it full screen at 1920x1080).
   - Step-by-step navigation: arrow keys / space / scroll wheel / swipe. Each press is one step.
   - Section files call Deck.addSlide({...}); see README.md for the slide contract. */
(function () {
  "use strict";
  const W = 1920, H = 1080;
  // the order of the video script; the tab names follow the group's feedback (27 Oct 2026): the hook slides got a tab
  const TABS = [
    { id: "hook", label: "A QUIET YEAR" },
    { id: "product", label: "THE MULTI-BRC" },
    { id: "why", label: "WHY MONTE CARLO" },
    { id: "mc", label: "MONTE CARLO" },
    { id: "excel", label: "PRICING IN EXCEL" },
    { id: "conclusion", label: "CONCLUSION" }
  ];
  const slides = [];
  let cur = -1, step = 0, scale = 1;
  const $ = (s, root) => (root || document).querySelector(s);

  // ---------- shared utilities ----------
  const F = { head: 'Arial, Helvetica, sans-serif', body: "Arial, Helvetica, sans-serif", mono: 'Arial, Helvetica, sans-serif', math: '"Cambria Math", "STIX Two Math", Cambria, serif' };
  const util = {
    W, H, F,
    // the system's "Reduce motion" turns the animations off, except in record mode: a take always animates
    reduced: window.matchMedia("(prefers-reduced-motion: reduce)").matches && !/[?&]record=1/.test(location.search),
    osReduced: window.matchMedia("(prefers-reduced-motion: reduce)").matches,
    css(name) { return getComputedStyle(document.documentElement).getPropertyValue(name).trim(); },
    // seeded random numbers, so every recording take shows the same numbers
    // the maths core stays unscrambled in the published build, so the simulations keep full speed
    // javascript-obfuscator:disable
    rng(seed) { let a = seed >>> 0; return function () { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; },
    normal(rand) { let spare = null; return function () { if (spare !== null) { const s = spare; spare = null; return s; } let u = 0; while (u === 0) u = rand(); const v = rand(); const m = Math.sqrt(-2 * Math.log(u)); spare = m * Math.sin(2 * Math.PI * v); return m * Math.cos(2 * Math.PI * v); }; },
    // single-stock example for the concept slides (dice -> one stock)
    // (a stock as volatile as Apple in our Excel, 28%; r = our Excel's USD 1-year rate on 6 Oct 2026; no dividends)
    MODEL: { S0: 100, sigma: 0.28, r: 0.044322, q: 0, T: 1, n: 252 },
    simPath(norm, p) {
      p = Object.assign({}, util.MODEL, p);
      const dt = p.T / p.n, mu = (p.r - (p.q || 0) - p.sigma * p.sigma / 2) * dt, vol = p.sigma * Math.sqrt(dt);
      const s = [p.S0]; let x = p.S0;
      for (let i = 0; i < p.n; i++) { x *= Math.exp(mu + vol * norm()); s.push(x); }
      return s;
    },
    // ---- the product: barrier reverse convertible (Multi-BRC) on the worst of three stocks ----
    // Modelled on UBS CH0419059040 (Kick-In GOAL, 2018: 8.50%), relaunched with our FINAL Excel (Monte_Carlo_Option_Pricing_
    // Group_III.xlsx, 14 Oct 2026): coupon 15%, market data of 6 Oct 2026 (Bloomberg). The same numbers as Deck.util.XL.model
    // (sections/excel-data.js): implied vols, dividend yields, correlations of 252 daily returns, r and UBS's CDS spread
    // (the bond part is discounted at r + cds, the put at r), coupon times in years ACT/365.
    BRC: {
      names: ["Adobe", "Apple", "Microsoft"], tickers: ["ADBE", "AAPL", "MSFT"],
      sigma: [0.4518, 0.28, 0.3214], q: [0, 0.0032, 0.0073],
      rho: [[1, 0.2210, 0.4116], [0.2210, 1, 0.1365], [0.4116, 0.1365, 1]],
      r: 0.044322, cds: 0.0043518, cpnT: [182 / 365, 1],
      T: 1, steps: 252, strike: 1.00, kickIn: 0.65, coupon: 0.15, couponsPerYear: 2, nominal: 1000, issuePrice: 1.00,
      // reference results, % of nominal: the same model in numpy with 400,000 scenarios (= Deck.util.XL.ref)
      ref: { fv: 92.10, fvCI: 0.06, pKickIn: 48.5, pLoss: 47.7, expRedemption: 81.59, put: 17.61, breakEvenCoupon: 23.19, interestPart: 4.93 },
      // 2018 term sheet of the original: coupon 8.50% = 2.58% interest + 5.92% option premium
      termSheet2018: { coupon: 8.50, interest: 2.58, premium: 5.92, isin: "CH0419059040", kickIn: 0.65, pricingDate: "27 June 2018" }
    },
    chol(A) {
      const n = A.length, L = A.map(() => new Array(n).fill(0));
      for (let i = 0; i < n; i++) for (let j = 0; j <= i; j++) {
        let s = A[i][j];
        for (let k = 0; k < j; k++) s -= L[i][k] * L[j][k];
        L[i][j] = i === j ? Math.sqrt(s) : s / L[j][j];
      }
      return L;
    },
    // one scenario: three correlated daily paths as a fraction of the initial level (1 = 100%)
    simBRC(norm, o) {
      const P = Object.assign({}, util.BRC, o), n = P.steps, dt = P.T / n, L = util.chol(P.rho);
      const paths = [0, 1, 2].map(() => { const a = new Float64Array(n + 1); a[0] = 1; return a; });
      const lx = [0, 0, 0], mu = P.sigma.map((s, k) => (P.r - P.q[k] - s * s / 2) * dt), vol = P.sigma.map(s => s * Math.sqrt(dt));
      const lb = Math.log(P.kickIn);
      let kiDay = -1, kiAsset = -1;
      for (let t = 1; t <= n; t++) {
        const z0 = norm(), z1 = norm(), z2 = norm();
        const z = [L[0][0] * z0, L[1][0] * z0 + L[1][1] * z1, L[2][0] * z0 + L[2][1] * z1 + L[2][2] * z2];
        for (let k = 0; k < 3; k++) {
          lx[k] += mu[k] + vol[k] * z[k];
          paths[k][t] = Math.exp(lx[k]);
          if (kiDay < 0 && lx[k] <= lb) { kiDay = t; kiAsset = k; }
        }
      }
      const finals = paths.map(a => a[n]), worst = Math.min(...finals), worstAsset = finals.indexOf(worst);
      const ki = kiDay >= 0;
      return { paths, ki, kiDay, kiAsset, worst, worstAsset, redemption: ki && worst < P.strike ? worst / P.strike : 1 };
    },
    // value of the note per 1 of nominal: PV(coupons) + PV(redemption); also the embedded put and the break-even coupon
    priceBRC(M, seed, o) {
      const P = Object.assign({}, util.BRC, o), norm = util.normal(util.rng(seed));
      let sum = 0, sum2 = 0, nKI = 0, nLoss = 0;
      for (let i = 0; i < M; i++) {
        const sc = util.simBRC(norm, P);
        sum += sc.redemption; sum2 += sc.redemption * sc.redemption;
        if (sc.ki) nKI++; if (sc.redemption < 1) nLoss++;
      }
      return util.valueBRC(sum / M, Math.sqrt(Math.max(0, sum2 / M - (sum / M) * (sum / M))), M, P, { pKickIn: nKI / M, pLoss: nLoss / M });
    },
    // fair value from the average redemption m (per 1 of nominal) of M scenarios with standard deviation sd:
    // bond (coupons + nominal) minus the put the investor sold. Optional P.cds: the bond part is discounted at r + cds
    // (the issuer's credit risk, as in our Excel), the put at r; optional P.cpnT: coupon times in years.
    valueBRC(m, sd, M, P, extra) {
      const s = P.cds || 0, d = Math.exp(-P.r * P.T), db = Math.exp(-(P.r + s) * P.T);
      const cpnDates = P.cpnT || Array.from({ length: P.couponsPerYear * P.T }, (_, k) => (k + 1) / P.couponsPerYear);
      const annuity = cpnDates.reduce((t, x) => t + Math.exp(-(P.r + s) * x), 0) / P.couponsPerYear;
      const bond = P.coupon * annuity + db, put = d * (1 - m);
      return Object.assign({ fv: bond - put, se: d * sd / Math.sqrt(M), expRedemption: m, bond, put, breakEvenCoupon: (1 - db + put) / annuity, interestPart: (1 - db) / annuity }, extra);
    },
    normCdf(x) { const t = 1 / (1 + 0.2316419 * Math.abs(x)), d = 0.3989423 * Math.exp(-x * x / 2), p = d * t * (0.3193815 + t * (-0.3565638 + t * (1.781478 + t * (-1.821256 + t * 1.330274)))); return x > 0 ? 1 - p : p; },
    bs(S, K, r, sigma, T, q) {
      q = q || 0;
      const d1 = (Math.log(S / K) + (r - q + sigma * sigma / 2) * T) / (sigma * Math.sqrt(T)), d2 = d1 - sigma * Math.sqrt(T), N = util.normCdf;
      return { call: S * Math.exp(-q * T) * N(d1) - K * Math.exp(-r * T) * N(d2), put: K * Math.exp(-r * T) * N(-d2) - S * Math.exp(-q * T) * N(-d1) };
    },
    // javascript-obfuscator:enable
    avg(path) { let t = 0; for (let i = 1; i < path.length; i++) t += path[i]; return t / (path.length - 1); },
    fmt(x, d) { return x.toLocaleString("en-US", { minimumFractionDigits: d, maximumFractionDigits: d }); },
    // sizes a canvas to its CSS box at full resolution; returns {ctx, w, h} in stage pixels
    // Chrome lays out <msqrt> with some empty space after the bar, which leaves a gap before the next symbol: close it.
    // Call it from a slide's resize() (runs when the slide is shown; measuring forces a layout).
    tightenRoots(root) {
      const stage = document.getElementById("stage"), k = (stage && stage.getBoundingClientRect().width / W) || 1;
      root.querySelectorAll("msqrt").forEach(s => {
        const last = s.lastElementChild;
        if (!last || s.closest("mphantom")) return;
        const gap = (s.getBoundingClientRect().right - last.getBoundingClientRect().right) / k;
        if (gap > 3) s.style.marginRight = -(gap - 2).toFixed(1) + "px";
      });
    },
    // the slides PDF for the hand-in (made with npm run pdf; the build passes window.__CF_PDF__), for the download
    // button on the references slide: {href, title, old} or null when the published site has no PDF yet
    slidesPdf() {
      const info = window.__CF_PDF__;
      if (info === null) return null;
      if (info === undefined) return null;   // no slides PDF yet: it is made from the final web app before the hand-in
      const old = !info.current;
      return { href: info.href, old, title: `All ${info.pages} slide steps, made ${info.made}${old ? ". The slides have changed since: ask for a new PDF (npm run pdf)." : ""}` };
    },
    canvas(el) {
      const w = el.clientWidth, h = el.clientHeight;
      if (!w || !h) return null;
      const ratio = Math.max(1, scale * (window.devicePixelRatio || 1));
      const pw = Math.round(w * ratio), ph = Math.round(h * ratio);
      if (el.width !== pw || el.height !== ph) { el.width = pw; el.height = ph; }
      const ctx = el.getContext("2d");
      ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
      ctx.clearRect(0, 0, w, h);
      return { ctx, w, h };
    },
    ease: { out: t => 1 - Math.pow(1 - t, 3), inOut: t => (t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2), lin: t => t },
    // animation helper; runs instantly when the engine jumps (going back, skipping)
    anim(ms, onFrame, opts) {
      opts = opts || {};
      const ease = opts.ease || util.ease.out;
      if (Deck.instant || util.reduced || ms <= 0) { onFrame(1); if (opts.done) opts.done(); return { cancel() {} }; }
      let raf = 0, t0 = null, dead = false;
      const tick = t => {
        if (dead) return;
        if (t0 === null) t0 = t;
        const k = Math.min(1, (t - t0) / ms);
        onFrame(ease(k));
        if (k < 1) raf = requestAnimationFrame(tick); else if (opts.done) opts.done();
      };
      raf = requestAnimationFrame(tick);
      return { cancel() { dead = true; cancelAnimationFrame(raf); } };
    },
    counter(el, from, to, ms, digits, prefix, suffix) {
      return util.anim(ms, k => { el.textContent = (prefix || "") + util.fmt(from + (to - from) * k, digits) + (suffix || ""); });
    },
    // axes + grid for canvas charts; theme "term" (data panel: mono labels) or "light" (on the slide itself)
    axes(ctx, f, o) {
      const term = o.theme !== "light";
      const X = v => f.x + (v - o.xMin) / (o.xMax - o.xMin) * f.w;
      const Y = v => f.y + f.h - (v - o.yMin) / (o.yMax - o.yMin) * f.h;
      ctx.save();
      ctx.lineWidth = 1;
      ctx.strokeStyle = term ? util.css("--term-line") : util.css("--rule-light");
      ctx.fillStyle = term ? util.css("--term-muted") : util.css("--muted");
      ctx.font = term ? "500 17px " + F.mono : "18px " + F.body;
      ctx.textAlign = "right"; ctx.textBaseline = "middle";
      (o.yTicks || []).forEach(v => {
        const y = Math.round(Y(v)) + .5;
        if (o.grid !== false) { ctx.beginPath(); ctx.moveTo(f.x, y); ctx.lineTo(f.x + f.w, y); ctx.stroke(); }
        ctx.fillText(o.yFmt ? o.yFmt(v) : String(v), f.x - 12, y);
      });
      ctx.textAlign = "center"; ctx.textBaseline = "top";
      (o.xTicks || []).forEach(v => ctx.fillText(o.xFmt ? o.xFmt(v) : String(v), X(v), f.y + f.h + 10));
      if (o.xLabel) ctx.fillText(o.xLabel, f.x + f.w / 2, f.y + f.h + 38);
      if (o.yLabel) { ctx.translate(f.x - 74, f.y + f.h / 2); ctx.rotate(-Math.PI / 2); ctx.textBaseline = "middle"; ctx.fillText(o.yLabel, 0, 0); }
      ctx.restore();
      return { X, Y };
    },
    // data panel markup (white since 27 Oct 2026; once a dark terminal panel): util.term({fn, title, meta, body, stats, ticker})
    term(o) {
      return `<div class="term ${o.cls || ""}" style="${o.style || ""}">
        <div class="term-bar"><span class="term-fn">${o.fn || "MCSIM"}</span><span class="term-title">${o.title || ""}</span><span class="term-meta">${o.meta || ""}</span></div>
        <div class="term-body">${o.body || ""}</div>
        ${o.stats ? `<div class="term-stats">${o.stats}</div>` : ""}
        ${o.ticker ? `<div class="tk"><div class="tk-track"></div></div>` : ""}
      </div>`;
    },
    // fills a .tk ticker with items [{lab, val, cls}] (duplicated for a seamless loop)
    ticker(root, items, seconds) {
      const track = root.querySelector(".tk-track");
      if (!track) return;
      const html = items.map(i => `<span><span class="lab">${i.lab}</span> <span class="${i.cls || "val"}">${i.val}</span></span>`).join("");
      track.innerHTML = html + html;
      if (seconds) track.style.setProperty("--tk-dur", seconds + "s");
    },
    // small line icons for badges (24x24 viewBox, stroke only)
    icon(name) {
      const P = {
        recap: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/><path d="M3 4v4h4"/>',
        chart: '<path d="M4 20V4"/><path d="M4 20h16"/><path d="M7 15l4-4 3 3 5-6"/>',
        dice: '<rect x="4" y="4" width="16" height="16" rx="3"/><circle cx="9" cy="9" r="1.2"/><circle cx="15" cy="15" r="1.2"/><circle cx="15" cy="9" r="1.2"/><circle cx="9" cy="15" r="1.2"/>',
        grid: '<rect x="3" y="4" width="18" height="16" rx="1"/><path d="M3 9h18M3 14h18M9 4v16M15 4v16"/>',
        check: '<rect x="5" y="3" width="14" height="18" rx="2"/><path d="M9 9l2 2 4-4M9 15h6"/>',
        avg: '<path d="M3 17c3-6 5-9 8-5s5 1 10-6"/><path d="M3 12h18" stroke-dasharray="2 3"/>',
        paths: '<path d="M3 12c4 0 6-6 18-7"/><path d="M3 12c5 0 8 2 18 1"/><path d="M3 12c4 1 8 6 18 7"/>',
        clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
        book: '<path d="M4 5a2 2 0 0 1 2-2h13v16H6a2 2 0 0 0-2 2z"/><path d="M4 19V5"/>',
        warn: '<path d="M12 3l9 17H3z"/><path d="M12 10v4M12 17v.5"/>',
        bulb: '<path d="M9 18h6M10 21h4"/><path d="M12 3a6 6 0 0 0-4 10.5c.8.8 1 1.5 1 2.5h6c0-1 .2-1.7 1-2.5A6 6 0 0 0 12 3z"/>'
      };
      return `<svg viewBox="0 0 24 24" aria-hidden="true">${P[name] || P.chart}</svg>`;
    }
  };

  // ---------- registration ----------
  function addSlide(def) {
    slides.push(Object.assign({ steps: 0, layout: "standard", section: "lecture", secs: 0, notes: "" }, def));
  }
  function addStyle(cssText) {
    const s = document.createElement("style");
    s.textContent = cssText;
    document.head.appendChild(s);
  }

  // ---------- build ----------
  function chrome(sl, n) {
    const tabs = TABS.map(t => `<button type="button" class="${t.id === sl.section ? "on" : ""}" data-tab="${t.id}" title="Go to: ${t.label.toLowerCase()}">${t.label}</button>`).join("");
    return `
      <div class="s-mark">Corporate Finance (7,107)<b>Monte Carlo Option Pricing</b></div>
      <header class="s-head"><h1 class="s-title">${sl.title || ""}</h1><div class="s-rule"></div>${sl.subtitle ? `<p class="s-sub">${sl.subtitle}</p>` : ""}</header>
      ${sl.lecture ? `<div class="s-lecture" title="Which part of our Corporate Finance lecture this slide builds on">${util.icon("book")}<span>Lecture reference: <b>${sl.lecture}</b></span></div>` : ""}
      <div class="s-body"></div>
      <nav class="s-tabs">${tabs}</nav>
      ${sl.sources ? `<p class="s-sources">Sources: ${sl.sources}</p>` : ""}
      <span class="s-num">${n}</span>`;
  }
  function build() {
    // a slide with after: "<id>" is moved right behind that slide (lets a section file place a slide after one from another file)
    slides.filter(sl => sl.after).forEach(sl => {
      const to = slides.findIndex(x => x.id === sl.after);
      if (to < 0) return;
      slides.splice(slides.indexOf(sl), 1);
      slides.splice(slides.findIndex(x => x.id === sl.after) + 1, 0, sl);
    });
    const st = $("#stage");
    slides.forEach((sl, i) => {
      const el = document.createElement("section");
      el.className = "slide layout-" + sl.layout;
      el.dataset.id = sl.id || ("s" + (i + 1));
      el.innerHTML = sl.layout === "title" ? `<div class="s-full"></div>` : chrome(sl, i + 1);
      st.appendChild(el);
      sl.el = el;
      sl.body = el.querySelector(sl.layout === "title" ? ".s-full" : ".s-body");
    });
    // render after all slides exist, so sizes are known
    slides.forEach(sl => {
      try { sl.api = (sl.render && sl.render(sl.body, { util, slide: sl, Deck })) || {}; }
      catch (e) { console.error("Slide render failed:", sl.id, e); sl.body.innerHTML = `<p style="color:#b00;font:24px monospace">Render error in ${sl.id}: ${e.message}</p>`; sl.api = {}; }
    });
    document.addEventListener("click", e => {
      const b = e.target.closest(".slide .s-tabs button");
      if (!b) return;
      const i = slides.findIndex(s => s.section === b.dataset.tab);
      if (i >= 0) show(i, 0, 1);
    });
  }

  // ---------- navigation ----------
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const params = new URLSearchParams(location.search);
  const scrollMode = params.get("mode") === "scroll";

  function show(i, s, dir) {
    i = clamp(i, 0, slides.length - 1);
    if (scrollMode) { scrollToSlide(i); return; }
    if (i !== cur) {
      if (cur >= 0) {
        const old = slides[cur];
        old.el.classList.remove("active");
        try { old.api.leave && old.api.leave(); } catch (e) { console.error(e); }
      }
      cur = i;
      const sl = slides[cur];
      // a slide seen before still shows its later steps: clear them without a transition before it fades in
      const to = clamp(s, 0, sl.steps);
      sl.el.classList.add("instant");
      sl.el.querySelectorAll("[data-step]").forEach(el => { if (+el.dataset.step > to) el.classList.remove("on"); });
      void sl.el.offsetWidth;
      sl.el.classList.remove("instant");
      sl.el.classList.add("active");
      try { sl.api.resize && sl.api.resize(); sl.api.enter && sl.api.enter(); } catch (e) { console.error(e); }
    }
    step = clamp(s, 0, slides[cur].steps);
    applyStepTo(slides[cur], step, dir);
    try { history.replaceState(null, "", location.search + "#" + slides[cur].el.dataset.id + (step ? "/" + step : "")); } catch (e) {}
    hud();
  }
  // shows state s of one slide; dir 1 = animate forwards, anything else = jump
  function applyStepTo(sl, s, dir) {
    const instant = dir !== 1 || util.reduced;
    sl.el.classList.toggle("instant", instant);
    sl.el.querySelectorAll("[data-step]").forEach(el => el.classList.toggle("on", +el.dataset.step <= s));
    Deck.instant = instant;
    try { sl.api.step && sl.api.step(s, { instant, dir }); } catch (e) { console.error("step failed", sl.id, e); }
    Deck.instant = false;
    if (instant) requestAnimationFrame(() => requestAnimationFrame(() => sl.el.classList.remove("instant")));
    sl.curStep = s;
  }
  function next() {
    const sl = slides[cur];
    if (step < sl.steps) show(cur, step + 1, 1);
    else if (cur < slides.length - 1) show(cur + 1, 0, 1);
  }
  function prev() {
    if (step > 0) show(cur, step - 1, -1);
    else if (cur > 0) show(cur - 1, slides[cur - 1].steps, -1);
  }

  // ---------- scroll mode: one long page, each slide pinned while its steps build up ----------
  const STEP_VH = 70;  // scroll distance per step, in % of the window height
  function setupScroll() {
    document.documentElement.classList.add("scroll-mode");
    document.body.classList.add("scroll-mode");
    const page = document.createElement("main");
    page.id = "scrollPage";
    slides.forEach(sl => {
      const track = document.createElement("div");
      track.className = "sc-track";
      track.style.height = `calc(100vh + ${sl.steps * STEP_VH}vh)`;
      track.innerHTML = `<div class="sc-sticky"><div class="sc-box"><div class="sc-frame"></div></div>${sl.steps ? `<div class="sc-dots">${Array.from({ length: sl.steps + 1 }, () => "<i></i>").join("")}</div>` : ""}</div>`;
      track.querySelector(".sc-frame").appendChild(sl.el);
      sl.el.classList.add("active");
      sl.track = track; sl.dots = [...track.querySelectorAll(".sc-dots i")];
      sl.curStep = -1; sl.visible = false;
      page.appendChild(track);
    });
    const hint = document.createElement("div");
    hint.className = "sc-hint ui-hint";
    hint.textContent = "Scroll down ↓";
    slides[0].track.querySelector(".sc-sticky").appendChild(hint);
    $("#viewport").replaceWith(page);
    window.addEventListener("scroll", onScroll, { passive: true });
  }
  function onScroll() { syncScroll(); }
  function syncScroll() {
    const vh = window.innerHeight;
    let best = -1, bestVis = 0;
    slides.forEach((sl, i) => {
      const r = sl.track.getBoundingClientRect();
      const vis = Math.max(0, Math.min(r.bottom, vh) - Math.max(r.top, 0));
      const visible = vis > 0;
      if (visible && !sl.visible) {
        sl.visible = true;
        try { sl.api.resize && sl.api.resize(); sl.api.enter && sl.api.enter(); } catch (e) { console.error(e); }
        // leave() may have stopped an animation half-way: show the step the slide was left at, finished
        if (sl.curStep >= 0) applyStepTo(sl, sl.curStep, 0);
      }
      if (!visible && sl.visible) { sl.visible = false; try { sl.api.leave && sl.api.leave(); } catch (e) { console.error(e); } }
      if (vis > bestVis) { bestVis = vis; best = i; }
      if (!visible) return;
      // the step follows how far we have scrolled through this slide's track
      const span = r.height - vh;
      const progress = span > 0 ? clamp(-r.top / span, 0, 1) : (r.top <= vh * 0.35 ? 1 : 0);
      const target = sl.steps ? Math.min(sl.steps, Math.floor(progress * (sl.steps + 0.999))) : 0;
      const ready = r.top < vh * 0.6;   // start a slide's animation once it is mostly in view
      if (!ready) return;
      if (sl.curStep !== target) applyStepTo(sl, target, target > sl.curStep ? 1 : -1);
      sl.dots.forEach((d, k) => d.classList.toggle("on", k <= target));
    });
    if (best >= 0 && best !== cur) {
      cur = best; step = Math.max(0, slides[cur].curStep);
      try { history.replaceState(null, "", location.search + "#" + slides[cur].el.dataset.id); } catch (e) {}
    }
    if (cur >= 0) { step = Math.max(0, slides[cur].curStep); hud(); }
  }
  function scrollToSlide(i) {
    const t = slides[i].track;
    window.scrollTo({ top: t.offsetTop, behavior: util.reduced ? "auto" : "smooth" });
  }

  // ---------- presenter HUD ----------
  function hud() {
    const sl = slides[cur];
    if (!sl) return;
    const nav = scrollMode ? "scroll to move" : "← → or scroll";
    $("#hud").textContent = `${util.reduced && !document.body.classList.contains("static") ? "⚠ Reduce motion is on in the system settings, so there are no animations here (record mode R plays them anyway) · " : ""}${cur + 1}/${slides.length} · step ${step}/${sl.steps} · ${nav} · H show clickable · R record mode · F full screen`;
  }

  // ---------- input ----------
  function typing(t) { return t && t.closest && t.closest("input,textarea,select,[contenteditable]"); }
  function onKey(e) {
    if (typing(e.target)) return;
    const k = e.key;
    if (k === "h" || k === "H" || k === "?") { document.body.classList.toggle("show-ui"); return; }
    if (k === "r" || k === "R") {
      const rec = document.body.classList.toggle("rec");
      if (!document.body.classList.contains("static")) util.reduced = util.osReduced && !rec;
      hud(); return;
    }
    if ((k === "u" || k === "U") && updateReady) { reloadNow(); return; }
    if (k === "f" || k === "F") { if (!document.fullscreenElement) document.documentElement.requestFullscreen && document.documentElement.requestFullscreen().catch(() => {}); else document.exitFullscreen(); return; }
    if (scrollMode) return;   // in scroll mode the arrow keys and space scroll the page as usual
    if (k === "ArrowRight" || k === "ArrowDown" || k === "PageDown" || k === " " || k === "Enter") { e.preventDefault(); next(); }
    else if (k === "ArrowLeft" || k === "ArrowUp" || k === "PageUp" || k === "Backspace") { e.preventDefault(); prev(); }
    else if (k === "Home") show(0, 0, 0);
    else if (k === "End") show(slides.length - 1, slides[slides.length - 1].steps, 0);
  }
  let wheelAcc = 0, wheelLock = 0, wheelLast = 0, wheelHold = false;
  function onWheel(e) {
    if (scrollMode) return;
    if (e.target.closest && e.target.closest("[data-wheel]")) return;
    e.preventDefault();
    const now = Date.now(), gap = now - wheelLast;
    wheelLast = now;
    // one step per swipe: after a step, wait until the swipe (and the trackpad's momentum) has stopped for 200 ms
    if (wheelHold) { if (gap < 200) return; wheelHold = false; }
    if (now < wheelLock) return;
    wheelAcc += e.deltaY;
    if (Math.abs(wheelAcc) > 40) { (wheelAcc > 0 ? next : prev)(); wheelAcc = 0; wheelLock = now + 650; wheelHold = true; }
  }
  let touchX = null, touchY = null;
  function onTouchStart(e) { const t = e.touches[0]; touchX = t.clientX; touchY = t.clientY; }
  function onTouchEnd(e) {
    if (scrollMode || touchX === null) return;
    const t = e.changedTouches[0], dx = t.clientX - touchX, dy = t.clientY - touchY;
    touchX = null;
    if (Math.max(Math.abs(dx), Math.abs(dy)) < 50) return;
    ((Math.abs(dx) > Math.abs(dy) ? dx : dy) < 0 ? next : prev)();
  }

  function fit() {
    scale = Math.min(window.innerWidth / W, window.innerHeight / H);
    document.documentElement.style.setProperty("--s", scale);
    if (scrollMode) {
      slides.forEach(sl => { if (sl.visible) { try { sl.api.resize && sl.api.resize(); } catch (e) { console.error(e); } } });
      return;
    }
    $("#stage").style.transform = `translate(-50%, -50%) scale(${scale})`;
    if (cur >= 0) { const sl = slides[cur]; try { sl.api.resize && sl.api.resize(); } catch (e) { console.error(e); } }
  }

  // switch between presentation (step by step) and scroll mode; keeps the current slide
  function modeButton() {
    const b = document.createElement("a");
    b.id = "modeBtn";
    b.className = "ui-btn small";
    const q = new URLSearchParams(location.search);
    if (scrollMode) q.delete("mode"); else q.set("mode", "scroll");
    const qs = q.toString();
    b.href = location.pathname + (qs ? "?" + qs : "") + (location.hash || "");
    b.innerHTML = scrollMode ? '<span class="ic">▶</span>Presentation mode' : '<span class="ic">↕</span>Scroll mode';
    b.title = scrollMode ? "Step through the slides with the arrow keys" : "Read everything as one long page";
    b.addEventListener("click", () => {
      const sl = slides[cur];
      if (sl) b.href = b.href.split("#")[0] + "#" + sl.el.dataset.id;
    });
    corner().appendChild(b);
  }
  // top-right corner for the presenter buttons; hidden in record mode (R), so they never appear in the video
  function corner() {
    let c = $("#corner");
    if (!c) { c = document.createElement("div"); c.id = "corner"; document.body.appendChild(c); }
    return c;
  }

  // ---------- auto-update: open tabs pick up a newly published version by themselves ----------
  // Only on the published site (the build sets __CF_BUILD__), never in the local copy. Checks every 30 s,
  // then reloads on the same slide and step. Never while recording (R); in full screen it asks first (U).
  const RESTORE = "cf-restore";
  let updateReady = false, reloading = false;
  function autoUpdate() {
    const mine = window.__CF_BUILD__;
    if (!mine || location.protocol === "file:") return;
    const check = () => {
      if (updateReady || document.hidden) return;
      fetch("/version.json?t=" + Date.now(), { cache: "no-store", credentials: "same-origin" })
        .then(r => r.ok ? r.json() : null)
        .then(d => {
          if (!d || !d.v || d.v === mine) return;
          let tried = null;
          try { tried = sessionStorage.getItem(RESTORE + "-v"); } catch (e) {}
          if (tried === d.v) return;   // already reloaded once for this version: never loop
          updateReady = d.v; tryUpdate();
        })
        .catch(() => {});
    };
    setInterval(check, 30000);
    document.addEventListener("visibilitychange", () => { if (!document.hidden) check(); });
    setInterval(() => { if (updateReady) tryUpdate(); }, 2000);   // goes ahead once recording or full screen ends
  }
  function tryUpdate() {
    if (reloading) return;
    if (document.body.classList.contains("rec")) return;   // never during a take
    if (document.fullscreenElement) { updatePill("New version ready · press U to update"); return; }   // a reload would leave full screen
    reloadNow();
  }
  function updatePill(text) {
    let p = $("#updatePill");
    if (!p) { p = document.createElement("div"); p.id = "updatePill"; p.className = "ui-hint"; document.body.appendChild(p); }
    p.textContent = text;
  }
  function reloadNow() {
    reloading = true;
    updatePill("New version · updating…");
    try {
      sessionStorage.setItem(RESTORE, JSON.stringify({ y: window.scrollY, ui: document.body.classList.contains("show-ui") }));
      sessionStorage.setItem(RESTORE + "-v", updateReady);
    } catch (e) {}
    setTimeout(() => location.reload(), 1200);
  }
  function restored() {
    let saved = null;
    try { saved = JSON.parse(sessionStorage.getItem(RESTORE) || "null"); sessionStorage.removeItem(RESTORE); } catch (e) {}
    if (saved) {
      if (saved.ui) document.body.classList.add("show-ui");
    }
    return saved;
  }

  // a source line that wraps onto two lines moves up, so it keeps a margin to the bottom edge of the slide
  function placeSources() {
    slides.forEach(sl => {
      const p = sl.el && sl.el.querySelector(".s-sources");
      if (!p) return;
      p.style.top = "";
      const h = p.offsetHeight;
      if (h > 24) p.style.top = Math.max(1038, 1074 - h) + "px";
    });
  }

  let hudTimer = 0;
  function wake() { document.body.classList.remove("idle"); clearTimeout(hudTimer); hudTimer = setTimeout(() => document.body.classList.add("idle"), 2500); }
  function start() {
    build();
    if (/[?&]record=1/.test(location.search)) document.body.classList.add("rec");
    if (/[?&]static=1/.test(location.search)) { util.reduced = true; document.body.classList.add("static"); }
    ["mousemove", "keydown", "wheel", "touchstart", "scroll"].forEach(t => window.addEventListener(t, wake, { passive: true }));
    wake();
    modeButton();
    if (scrollMode) setupScroll();
    fit();
    window.addEventListener("resize", fit);
    document.addEventListener("keydown", onKey);
    window.addEventListener("wheel", onWheel, { passive: false });
    window.addEventListener("touchstart", onTouchStart, { passive: true });
    window.addEventListener("touchend", onTouchEnd, { passive: true });
    const m = /^#([^/]+)(?:\/(\d+))?$/.exec(decodeURIComponent(location.hash || ""));
    let i = 0, s = 0;
    if (m) { const j = slides.findIndex(x => x.el.dataset.id === m[1]); if (j >= 0) { i = j; s = +(m[2] || 0); } }
    const saved = restored();
    if (scrollMode) {
      cur = i;
      if (saved && saved.y) window.scrollTo(0, saved.y);
      else if (i > 0) { window.scrollTo(0, slides[i].track.offsetTop); }
      syncScroll();
    } else {
      show(i, s, s ? 0 : 1);
    }
    placeSources();
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(() => { fit(); placeSources(); });
    autoUpdate();
  }

  window.Deck = { addSlide, addStyle, start, util, next, prev, show, instant: false, _syncScroll: () => scrollMode && syncScroll(), get scrollMode() { return scrollMode; }, get slides() { return slides; }, get current() { return { index: cur, step }; } };
})();
