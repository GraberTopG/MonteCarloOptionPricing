/* Title, the three hook slides and the end card (final video script: part 1 "Hook" and the last cue of part 6).
   Owner: web-app team. Classes: .tt- (title and end card), .hk- (hook slides). */
(function () {
  const U = Deck.util, B = U.BRC, XL = U.XL;
  // planned time: the narration at 145 words per minute plus 0.5 s per click (README, time plan)
  const secsFor = (notes, steps) => Math.round(notes.replace(/\[→\]/g, " ").trim().split(/\s+/).length / 145 * 60 + 0.5 * steps);
  // the product's terms (Deck.util.BRC = the Excel's inputs; the coupon from XL)
  const CPN = U.fmt(XL.coupon * 100, 0), KI = Math.round(B.kickIn * 100), NOM = U.fmt(B.nominal, 0);
  const HALF = U.fmt(XL.coupon * B.nominal / B.couponsPerYear, 0);
  // the risk-free rate of our Excel (sheet 2, continuously compounded) and what it pays in a year, e^r − 1
  const R = XL.model.r, R_TXT = U.fmt(R * 100, 2), R_YEAR = U.fmt((Math.exp(R) - 1) * 100, 1);
  const RATIO = Math.floor(XL.coupon / R);   // 15% / 4.43% = 3.4: "more than 3 times"
  const DOT = ["adbe", "aapl", "msft"];

  Deck.addStyle(`
    /* ---------- title and end card: text on the left, simulated years on white on the right ---------- */
    .tt-left{position:absolute;left:120px;top:0;bottom:0;width:820px;display:flex;flex-direction:column;justify-content:center}
    .tt-uni{font:600 22px var(--f-head);letter-spacing:.08em;color:var(--green);text-transform:uppercase;margin:0 0 70px}
    .tt-rule{width:220px;height:7px;background:var(--green);margin:0 0 26px}
    .tt-title{font:800 112px/1.02 var(--f-head);color:var(--green-ink);margin:0;letter-spacing:-.01em}
    .tt-sub{font:300 40px/1.25 var(--f-head);color:var(--muted);margin:26px 0 0;max-width:640px}
    /* the group and its members: mixed case, two lines that end left of the diagonal */
    .tt-meta{font:400 20px/1.45 var(--f-head);color:var(--ink);letter-spacing:.01em;margin:50px 0 0;max-width:700px}
    .tt-meta b{font-weight:700;color:var(--green-ink)}
    .tt-right{position:absolute;inset:0;clip-path:polygon(1130px 0,1920px 0,1920px 1080px,770px 1080px);background:#fff}
    .tt-right canvas{position:absolute;inset:0;width:1920px;height:1080px}
    .tt-edge{position:absolute;inset:0;pointer-events:none}
    /* end card */
    .tt-end .tt-uni{font-size:26px;line-height:1.35;letter-spacing:.05em;margin-bottom:58px}
    .tt-end .tt-sub{color:var(--ink);max-width:700px;margin-top:40px}

    /* ---------- hook 1: the past year of prices ---------- */
    .hk-px{position:relative;height:100%}
    /* the chart starts lower and is a little shorter: the two-line title pushes the subtitle down */
    .hk-px canvas{position:absolute;left:0;top:36px;width:100%;height:574px;display:block}
    .hk-goal{position:absolute;left:0;right:0;bottom:0;height:112px;padding-right:32px}
    .hk-goal p{margin:0}
    .hk-gk{flex:none;font:700 32px var(--f-body);color:var(--green-ink);white-space:nowrap}
    .hk-gv{flex:1;min-width:0;font-size:30px;line-height:1.3}
    .hk-goal .sep{flex:none;width:2px;height:70px;background:var(--rule);margin:0 6px}

    /* ---------- hook 2: shares, a bond or a call ---------- */
    .hk-ch{position:relative;height:100%}
    .hk-opts{position:absolute;left:0;right:0;top:66px;display:grid;grid-template-columns:repeat(3,548px);gap:50px}
    /* step 0: three empty dashed places that the cards fill one per click */
    .hk-slot{height:476px;border:3px dashed #BCC3C0;border-radius:10px}
    .hk-opt{position:relative;height:476px;padding:26px 34px 30px;display:flex;flex-direction:column}
    .slide .hk-opt[data-step]{transform:none}   /* fades in exactly over its slot (no slide-up, so no slot edge peeks out) */
    /* a card is crossed out once its reason has been read: --xd per card (XD below) */
    .hk-art{width:480px;height:240px;display:block;flex:none;transition:opacity .45s ease var(--xd)}
    .hk-opt.on .hk-art{opacity:.4}
    .hk-art .ax{fill:none;stroke:var(--rule);stroke-width:2}
    .hk-art .lv{fill:none;stroke:var(--rule);stroke-width:2;stroke-dasharray:6 6}
    .hk-art .ln{fill:none;stroke-width:5;stroke-linecap:round;stroke-linejoin:round}
    .hk-art .red{stroke:var(--red-ink)} .hk-art .grn{stroke:var(--green)}
    .hk-art text{font:700 17px var(--f-body)}
    .hk-art .t-red{fill:var(--red-ink)} .hk-art .t-grn{fill:var(--green)} .hk-art .t-mut{fill:var(--muted);font-weight:400}
    .hk-opt h3{align-self:flex-start;position:relative;font:700 44px/1.15 var(--f-head);color:var(--green-ink);margin:24px 0 12px}
    .hk-strike{position:absolute;left:-8px;right:-8px;top:calc(50% - 1px);height:6px;border-radius:3px;background:var(--red-ink);transform:scaleX(0);transform-origin:0 50%;transition:transform .35s ease var(--xd)}
    .hk-opt.on .hk-strike{transform:none}
    .hk-opt p{font-size:30px;line-height:1.3;margin:0;color:var(--ink)}
    .hk-x{position:absolute;left:34px;top:26px;width:480px;height:240px;pointer-events:none}
    .hk-x line{stroke:var(--red-ink);stroke-width:13;stroke-linecap:round;stroke-dasharray:1;stroke-dashoffset:1;transition:stroke-dashoffset .3s ease-in var(--xd)}
    .hk-x line+line{transition-delay:calc(var(--xd) + .25s)}
    .hk-opt.on .hk-x line{stroke-dashoffset:0}
    /* the bottom line: empty until click 3, then the answer, when it is spoken (about 5 s after the click) */
    .hk-say{position:absolute;left:0;right:0;top:612px;height:80px;border-left:8px solid var(--orange)}
    .hk-say p{position:absolute;left:26px;top:12px;margin:0;font:700 46px/1.2 var(--f-head);color:var(--green-ink);white-space:nowrap}

    /* ---------- hook 3: the product ---------- */
    .hk-pr{position:relative;height:100%}
    .hk-name{margin:0;font:700 48px/1.15 var(--f-head);color:var(--green-ink)}
    .hk-terms{position:absolute;left:0;right:0;top:82px;height:226px;display:grid;grid-template-columns:repeat(5,1fr);gap:22px}
    .hk-t{position:relative;padding:20px 20px;display:flex;flex-direction:column;font-size:24px}
    .hk-t .k{font:700 20px/1.2 var(--f-body);letter-spacing:.05em;text-transform:uppercase;color:var(--green-ink)}
    .hk-t .v{font:700 52px/1.1 var(--f-head);color:var(--ink);margin:10px 0 8px;white-space:nowrap;font-variant-numeric:lining-nums}
    .hk-t .s{font-size:26px;line-height:1.25;color:var(--muted)}
    .hk-ln{display:block;white-space:nowrap}   /* the two dates of the maturity card: one line each */
    .hk-dot{display:inline-block;width:16px;height:16px;border-radius:50%;margin:0 8px 0 0;vertical-align:1px}
    .hk-dot.adbe{background:var(--c-adbe-light)} .hk-dot.aapl{background:var(--c-aapl-light)} .hk-dot.msft{background:var(--c-msft-light)}
    .hk-stk{display:block;white-space:nowrap}
    .hk-ring{position:absolute;inset:0;border-radius:10px;box-shadow:inset 0 0 0 4px var(--orange);pointer-events:none}
    .slide .hk-ring[data-step]{transform:none}
    .hk-cpn{position:absolute;left:0;right:0;top:340px;height:232px;background:var(--card);border-radius:10px;border-left:10px solid var(--orange);display:flex;align-items:center;padding:0 30px;gap:30px}
    /* "15% p.a.": the rate big, "p.a." small on the same baseline; the box is wide enough for the 1.2× beat of click 1 */
    .hk-big{width:480px;flex:none;text-align:center;font:800 150px/1 var(--f-head);color:var(--orange);white-space:nowrap;font-variant-numeric:lining-nums;transition:transform .8s cubic-bezier(.3,1.5,.5,1)}
    .hk-big .pa{font-size:56px}
    .hk-pr.beat .hk-big{transform:scale(1.2)}
    .hk-ct{width:440px;flex:none}
    .hk-ct .k,.hk-rf .k{font:700 20px/1.2 var(--f-body);letter-spacing:.05em;text-transform:uppercase;color:var(--green-ink);margin:0 0 8px}
    .hk-ct p,.hk-rf p{margin:0;font-size:28px;line-height:1.3}
    .hk-gt{width:160px;flex:none;text-align:center;font:800 84px/1 var(--f-head);color:var(--orange);white-space:nowrap}
    .hk-gt .x{font:700 64px/1 var(--f-body);vertical-align:-.06em;margin-left:4px}   /* centred on the digits: "times", not an exponent */
    .hk-rf{flex:1;min-width:0}
    .hk-rf .n{font:700 92px/1 var(--f-head);color:var(--green-ink);margin:0 0 8px;font-variant-numeric:lining-nums}
    .hk-rf p{font-size:26px;color:var(--muted)}
    .hk-q{position:absolute;left:0;right:0;top:610px;margin:0;font:700 50px/1.2 var(--f-head);color:var(--orange-ink);white-space:nowrap}
    .hk-q .cur{display:inline-block;width:5px;height:50px;background:var(--orange);margin-left:6px;vertical-align:-6px;opacity:0}
    .hk-q.typing .cur{opacity:1}

    /* the two long titles of the hook wrap onto two even lines */
    .slide[data-id="hook-prices"] .s-title,.slide[data-id="hook-choices"] .s-title{text-wrap:balance}
  `);

  // ---------- the right half of the title and the end card: a Monte Carlo picture of our product ----------
  // 2,000 seeded years (the number of paths in our Excel), each the worst of the three stocks day by day: a faint fan of
  // the first 160, one year that never comes near the kick-in level (green), one that touches it (black, with a ring at
  // the touch), and at the right where the worst stock ends after one year: 1,000 back (green) or shares (black).
  // Art from our own model, no results quoted.
  function pathsArt(root, seed) {
    root.insertAdjacentHTML("beforeend", `
      <div class="tt-right"><canvas></canvas></div>
      <svg class="tt-edge" viewBox="0 0 1920 1080"><line x1="1130" y1="0" x2="770" y2="1080" style="stroke:var(--green)" stroke-width="4"/></svg>`);
    const cv = root.querySelector(".tt-right canvas");
    const n = B.steps, N = 2000, FAN = 160;
    // the chart in stage pixels: days from X0 to X1, the histogram from HX (bars up to HW long), levels on Y (100% at y 540)
    const X0 = 1130, X1 = 1650, HX = 1676, HW = 184;
    const X = i => X0 + i / n * (X1 - X0), Y = v => 540 - (v - 1) * 560;
    const LO = 0.2, HI = 1.7, BIN = 0.05, NB = Math.round((HI - LO) / BIN);   // bins of the worst stock after one year

    let sim = null;   // simulated on the first draw (the end card only when it is shown)
    function simulate() {
      const norm = U.normal(U.rng(seed)), fan = [], bins = Array.from({ length: NB }, () => [0, 0]);
      for (let p = 0; p < N; p++) {
        const sc = U.simBRC(norm);
        if (p < FAN) {
          const w = new Float64Array(n + 1);
          let lo = Infinity;
          for (let t = 0; t <= n; t++) { w[t] = Math.min(sc.paths[0][t], sc.paths[1][t], sc.paths[2][t]); lo = Math.min(lo, w[t]); }
          fan.push({ w, lo, end: sc.worst, ki: sc.ki, kiDay: sc.kiDay });
        }
        const b = Math.floor((sc.worst - LO) / BIN);
        if (b >= 0 && b < NB) bins[b][sc.redemption < 1 ? 1 : 0]++;   // [1,000 back, shares]
      }
      // the two highlighted years: one that stays well above the kick-in level and ends near its start, one that touches it
      // mid-year and ends clearly below it
      const good = fan.find(f => !f.ki && f.lo > .78 && f.end > .97 && f.end < 1.2) || fan.find(f => !f.ki);
      const bad = fan.find(f => f.ki && f.kiDay > 90 && f.kiDay < 190 && f.end < .6) || fan.find(f => f.ki);
      const used = bins.map((b, i) => b[0] + b[1] ? i : -1).filter(i => i >= 0);   // the lowest and highest bins with a bar
      return { fan, bins, max: Math.max(...bins.map(b => b[0] + b[1])), bottom: used[0], top: used[used.length - 1], good, bad };
    }

    // the fan is drawn once into a layer at the canvas's own resolution; the animation only reveals it from left to right
    const layer = document.createElement("canvas");
    let layerKey = "", k = 1, a = null;
    function draw() {
      const c = U.canvas(cv); if (!c) return;
      const { ctx } = c;
      if (!sim) sim = simulate();
      const col = { green: U.css("--green"), ink: U.css("--ink"), rule: U.css("--rule"), muted: U.css("--muted"), fan: U.css("--green-mid") };
      const key = cv.width + "x" + cv.height;
      if (layerKey !== key) {
        layer.width = cv.width; layer.height = cv.height; layerKey = key;
        const g = layer.getContext("2d"), r = cv.width / c.w;
        g.setTransform(r, 0, 0, r, 0, 0);
        g.strokeStyle = col.fan; g.globalAlpha = .17; g.lineWidth = 1.3; g.lineJoin = "round";
        sim.fan.forEach(f => { g.beginPath(); g.moveTo(X(0), Y(f.w[0])); for (let i = 1; i <= n; i++) g.lineTo(X(i), Y(f.w[i])); g.stroke(); });
      }
      const upto = Math.max(1, Math.round(n * Math.min(1, k / .72)));   // days shown: the paths grow in the first 72% of the time
      const hg = U.ease.out(Math.max(0, Math.min(1, (k - .6) / .4)));    // then the histogram grows
      // the fan, revealed up to the day shown
      ctx.save(); ctx.beginPath(); ctx.rect(0, 0, X(upto), c.h); ctx.clip();
      ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.drawImage(layer, 0, 0);
      ctx.restore();
      // the strike (grey) and the kick-in level (black), dashed over the fan, labelled on the left like an axis
      const level = (v, colr, wdt) => { ctx.setLineDash([10, 8]); ctx.strokeStyle = colr; ctx.lineWidth = wdt; ctx.beginPath(); ctx.moveTo(X0, Y(v)); ctx.lineTo(HX + HW, Y(v)); ctx.stroke(); ctx.setLineDash([]); };
      level(B.strike, col.rule, 2); level(B.kickIn, col.ink, 2.5);
      ctx.font = "700 18px " + U.F.body; ctx.letterSpacing = "1px"; ctx.textAlign = "right"; ctx.textBaseline = "middle";
      ctx.fillStyle = col.muted; ctx.fillText("STRIKE " + Math.round(B.strike * 100) + "%", X0 - 18, Y(B.strike));
      ctx.fillStyle = col.ink; ctx.fillText("KICK-IN " + KI + "%", X0 - 18, Y(B.kickIn));
      ctx.letterSpacing = "0px";
      // the two highlighted years, each on a thin white edge so it stands clear of the fan
      const path = (f, colr) => {
        ctx.lineJoin = "round"; ctx.lineCap = "round";
        [["#fff", 7.5], [colr, 3.5]].forEach(([s, wdt]) => {
          ctx.strokeStyle = s; ctx.lineWidth = wdt; ctx.beginPath(); ctx.moveTo(X(0), Y(f.w[0]));
          for (let i = 1; i <= upto; i++) ctx.lineTo(X(i), Y(f.w[i]));
          ctx.stroke();
        });
      };
      path(sim.good, col.green); path(sim.bad, col.ink);
      const dot = (x, y, r, fill, ring) => { ctx.beginPath(); ctx.arc(x, y, r, 0, 7); ctx.fillStyle = fill; ctx.fill(); if (ring) { ctx.strokeStyle = ring; ctx.lineWidth = 3; ctx.stroke(); } };
      if (upto >= sim.bad.kiDay) dot(X(sim.bad.kiDay), Y(sim.bad.w[sim.bad.kiDay]), 10, "#fff", col.ink);   // the touch
      if (upto >= n) { dot(X(n), Y(sim.good.w[n]), 7, col.green); dot(X(n), Y(sim.bad.w[n]), 7, col.ink); }
      dot(X(0), Y(1), 7, U.css("--green-ink"));
      // where the worst stock ends: one bar per 5% band, 1,000 back (green) then shares (black), on a baseline as long as the bars
      if (hg > 0) {
        ctx.strokeStyle = col.rule; ctx.lineWidth = 1.5; ctx.globalAlpha = Math.min(1, hg * 3);
        ctx.beginPath(); ctx.moveTo(HX - .5, Y(LO + (sim.top + 1) * BIN) - 8); ctx.lineTo(HX - .5, Y(LO + sim.bottom * BIN) + 8); ctx.stroke();
        const L = HW / sim.max * hg;
        ctx.globalAlpha = .85;
        sim.bins.forEach(([full, shares], b) => {
          const y0 = Y(LO + (b + 1) * BIN) + 3.5, h = Y(LO + b * BIN) - 3.5 - y0;
          ctx.fillStyle = col.green; ctx.fillRect(HX, y0, full * L, h);
          ctx.fillStyle = col.ink; ctx.fillRect(HX + full * L, y0, shares * L, h);
        });
        ctx.globalAlpha = 1;
      }
    }
    return {
      resize: draw,
      step() { if (a) a.cancel(); a = U.anim(2000, t => { k = Math.max(.02, t); draw(); }, { ease: U.ease.inOut }); },
      leave() { if (a) a.cancel(); a = null; }
    };
  }

  // ================= title =================
  Deck.addSlide({
    id: "title", layout: "title", section: "", steps: 0, secs: 3,
    notes: "(No narration: about two seconds on screen, then click.)",
    render(root) {
      root.innerHTML = `
        <div class="tt-left">
          <p class="tt-uni">University of St.Gallen · Corporate Finance (7,107)</p>
          <div class="tt-rule"></div>
          <h1 class="tt-title">Monte Carlo<br>Option Pricing</h1>
          <p class="tt-sub">Pricing a Multi-BRC on Adobe, Apple and Microsoft</p>
          <p class="tt-meta"><b>Group III</b> · Ali Bozan Can, Benjamin Marco Bolliger, Cédric Anwar El Soda, Ivan Kissinger, Joaquim Graber, Leandro Broccucci, Mirko Cirantineo</p>
        </div>`;
      return pathsArt(root, 7);
    }
  });

  // ================= hook 1: the past year of prices (our Excel, sheet 3) =================
  const H = XL.hist, LAST = H.dates.length - 1;
  const MON = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const dayTxt = d => `${+d.slice(8)} ${MON[+d.slice(5, 7) - 1]} ${d.slice(0, 4)}`;   // "2026-10-06" → "6 Oct 2026"
  const MONTHS = H.dates.map((d, i) => i > 0 && d.slice(5, 7) !== H.dates[i - 1].slice(5, 7) ? i : -1).filter(i => i > 0);   // first trading day of each month
  const CHG = H.px.map(p => (p[LAST] / p[0] - 1) * 100);   // 1-year change: ADBE −31.9%, AAPL +29.7%, MSFT +1.1%
  const NOTES_PX = "Hi everyone. It's October 2026, and you have a thousand dollars to invest for one year. Adobe trades at 238 dollars, Apple at 333 and Microsoft at 534. [→] After a rough year for Adobe, you expect a quiet one: no crash, no big rally.";
  Deck.addSlide({
    id: "hook-prices", section: "hook", steps: 1, secs: secsFor(NOTES_PX, 1),
    title: "The starting point: USD 1,000 to invest for an expected sideways or slightly down year",
    subtitle: "Daily closing prices of Adobe, Apple and Microsoft from 6 Oct 2025 to 6 Oct 2026",
    sources: "Bloomberg (2026); own Excel model, sheet 3",
    notes: NOTES_PX,
    render(body) {
      body.innerHTML = `
        <div class="hk-px">
          <canvas></canvas>
          <div class="icard hk-goal" data-step="1">
            <div class="badge">${U.icon("avg")}</div>
            <p class="hk-gk">USD ${NOM} · ${B.T} year</p>
            <span class="sep"></span>
            <p class="hk-gv">Consensus: 86% of analysts issue a HOLD rating for the three underlyings; no growth catalyst ahead and downside risks already priced in</p>
          </div>
        </div>`;
      const cv = body.querySelector("canvas");
      const COL = ["--c-adbe-light", "--c-aapl-light", "--c-msft-light"];
      let k = 1, a = null;
      function draw() {
        const c = U.canvas(cv); if (!c) return;
        const { ctx, w, h } = c;
        const f = { x: 96, y: 50, w: w - 96 - 290, h: h - 50 - 50 };
        const { X, Y } = U.axes(ctx, f, {
          theme: "light", xMin: 0, xMax: LAST, yMin: 150, yMax: 600, yTicks: [200, 300, 400, 500, 600],
          xTicks: [0, ...MONTHS], xFmt: i => i ? MON[+H.dates[i].slice(5, 7) - 1] + (H.dates[i].slice(5, 7) === "01" ? " " + H.dates[i].slice(0, 4) : "") : dayTxt(H.dates[0]),
          yLabel: "Closing price (USD)"
        });
        ctx.strokeStyle = U.css("--rule"); ctx.lineWidth = 1.5;
        ctx.beginPath(); ctx.moveTo(f.x, f.y + f.h); ctx.lineTo(f.x + f.w, f.y + f.h); ctx.stroke();
        // the pricing date at the right end
        const xe = X(LAST);
        ctx.setLineDash([6, 6]); ctx.strokeStyle = U.css("--green-ink"); ctx.globalAlpha = .55; ctx.lineWidth = 2;
        ctx.beginPath(); ctx.moveTo(xe, f.y - 8); ctx.lineTo(xe, f.y + f.h); ctx.stroke();
        ctx.setLineDash([]); ctx.globalAlpha = 1;
        ctx.fillStyle = U.css("--green-ink"); ctx.font = "700 21px " + U.F.body; ctx.textAlign = "right"; ctx.textBaseline = "bottom";
        ctx.fillText("Pricing date " + dayTxt(H.dates[LAST]), xe + 6, f.y - 14);
        // the three price lines, drawn from left to right
        const upto = Math.max(1, Math.round(LAST * k));
        H.px.forEach((p, s) => {
          const col = U.css(COL[s]);
          ctx.strokeStyle = col; ctx.lineWidth = 3.2; ctx.lineJoin = "round";
          ctx.beginPath(); ctx.moveTo(X(0), Y(p[0]));
          for (let i = 1; i <= upto; i++) ctx.lineTo(X(i), Y(p[i]));
          ctx.stroke();
          ctx.fillStyle = col; ctx.beginPath(); ctx.arc(X(upto), Y(p[upto]), 6.5, 0, 7); ctx.fill();
        });
        // labels at the right end: today's price and the change over the year
        const lab = Math.max(0, Math.min(1, (k - .9) / .1));
        if (lab > 0) {
          ctx.globalAlpha = lab; ctx.textAlign = "left";
          H.px.forEach((p, s) => {
            const y = Y(p[LAST]), x = xe + 22;
            ctx.fillStyle = U.css(COL[s]); ctx.font = "700 28px " + U.F.body; ctx.textBaseline = "bottom";
            ctx.fillText(B.names[s] + " " + U.fmt(XL.S0[s], 2), x, y + 2);
            ctx.fillStyle = CHG[s] < 0 ? U.css("--red-ink") : U.css("--green");
            ctx.font = "700 23px " + U.F.body; ctx.textBaseline = "top";
            ctx.fillText((CHG[s] < 0 ? "−" : "+") + U.fmt(Math.abs(CHG[s]), 1) + "% in 1 year", x, y + 6);
          });
          ctx.globalAlpha = 1;
        }
      }
      return {
        resize: draw,
        step(i, o) {
          if (a) a.cancel(); a = null;
          // the lines take 5 s (the group asked for a 2–3 times slower drawing than the 2 s before)
          if (i === 0 && !o.instant) a = U.anim(5000, t => { k = t; draw(); }, { ease: U.ease.inOut });
          else { k = 1; draw(); }
        },
        leave() { if (a) a.cancel(); a = null; k = 1; }
      };
    }
  });

  // ================= hook 2: shares, a bond or a call =================
  // our own small drawings (300 × 150): a falling share price, a bond's slow and steady rise, a call's payoff
  // (every label lies clear of the X drawn over the card: "big jump" right of the payoff line, "premium you pay" below the X)
  const ART = {
    shares: `<path class="ax" d="M18 8V138H290"/><path class="lv" d="M22 34H286"/>
      <polyline class="ln red" points="22,34 44,46 62,38 84,62 104,54 126,82 148,72 170,98 192,90 214,114 238,106 262,126"/>
      <path class="ln red" d="M262 126l-17-1M262 126l-8-15"/>`,
    bond: `<path class="ax" d="M18 8V138H290"/><path class="lv" d="M22 96H286"/>
      <path class="ln grn" d="M22 96L270 82"/><circle cx="270" cy="82" r="7" fill="var(--green)"/>
      <text class="t-grn" x="270" y="66" text-anchor="end">≈ ${R_YEAR}%</text>`,
    call: `<path class="ax" d="M18 8V138"/><path class="lv" d="M18 104H290"/>
      <path class="ln red" d="M22 122H172"/><path class="ln grn" d="M172 122L282 18"/>
      <text class="t-red" x="26" y="146">premium you pay</text><text class="t-grn" x="298" y="94" text-anchor="end">big jump</text>`
  };
  const OPTS = [
    { art: ART.shares, t: "Shares", why: "You are exposed to the full downside" },
    { art: ART.bond, t: "Government bond", why: `Safe, but only ≈ ${R_YEAR}% a year` },
    { art: ART.call, t: "Call option", why: "You are not expecting an increase in the share price" }
  ];
  const NOTES_CH = "So how would you invest? [→] Shares? You take the full downside. [→] A government bond? Safe, but only about four and a half percent. [→] A call option? You pay for a big jump you don't expect. None of them fits a quiet year.";
  Deck.addSlide({
    id: "hook-choices", section: "hook", steps: 3, secs: secsFor(NOTES_CH, 3),
    title: "Which product expresses the market view adequately?",
    subtitle: `Three ways to invest USD ${NOM} for one year · Consensus: HOLD`,
    sources: "Bloomberg (2026) (USD 1-year rate); own Excel model, sheet 2; own illustration",
    notes: NOTES_CH,
    render(body) {
      // the X ends above the bottom label band of the drawings (y 196 of 240)
      // when each card is crossed out (s after its click), at 145 words a minute: after "…the full downside" (2.5 s),
      // near the end of "…four and a half percent" (5.0 s) and of "…you don't expect" (5.0 s), just before the answer
      const XD = [2.2, 4.3, 4.1];
      body.innerHTML = `
        <div class="hk-ch">
          <div class="hk-opts">${OPTS.map(() => `<div class="hk-slot"></div>`).join("")}</div>
          <div class="hk-opts">${OPTS.map((o, i) => `
            <div class="card hk-opt" data-step="${i + 1}" style="--xd:${XD[i]}s">
              <svg class="hk-art" viewBox="0 0 300 150" aria-hidden="true">${o.art}</svg>
              <h3>${o.t}<span class="hk-strike"></span></h3>
              <p>${o.why}</p>
              <svg class="hk-x" viewBox="0 0 480 240" aria-hidden="true"><line x1="110" y1="22" x2="370" y2="196" pathLength="1"/><line x1="370" y1="22" x2="110" y2="196" pathLength="1"/></svg>
            </div>`).join("")}
          </div>
          <div class="hk-say" data-step="3" style="--d:55"><p>None are suitable for a <span class="hl">sideways or slightly downward market</span></p></div>
        </div>`;
      return {};
    }
  });

  // ================= hook 3: the product =================
  const NOTES_PR = "But banks sell a product for exactly this view: a worst-of multi barrier reverse convertible, or Multi-BRC. You get a fifteen percent coupon whatever happens, but never more. As long as no stock touches 65 percent of its starting price, you get your thousand back. If one does, you may get shares instead. [→] Fifteen percent: more than three times the risk-free rate. [→] But is it enough for the risk you take? Let's take a closer look at the product.";
  const QUESTION = "But is it fair for the risk you take on?";
  Deck.addSlide({
    id: "hook-product", section: "hook", steps: 2, secs: secsFor(NOTES_PR, 2),
    title: "Banks' solution: A Multi-BRC",
    subtitle: "Banks created a product for this exact market view",
    sources: "UBS AG (2018) (model for the structure); Bloomberg (2026); own Excel model, sheets 1–2",
    notes: NOTES_PR,
    render(body) {
      // click 1: the 15% grows and holds for about a second, then the risk-free rate (after 0.99 s) and "> 3×" (1.26 s) fade in
      const tile = (k, v, s, ring) => `<div class="card hk-t"><span class="k">${k}</span><span class="v">${v}</span><span class="s">${s}</span>${ring ? `<span class="hk-ring" data-step="2" style="--d:${ring}"></span>` : ""}</div>`;
      body.innerHTML = `
        <div class="hk-pr">
          <p class="hk-name">The product: A <span class="g">Multi-BRC</span> on ${B.tickers.map(t => "$" + t).join(", ")}</p>
          <div class="hk-terms">
            ${tile("Nominal", "USD " + NOM, "(=Issue price)")}
            ${tile("Maturity", B.T + " year", `<span class="hk-ln">Initial fixing date: 6 Oct 2026</span><span class="hk-ln">Expiration: 6 Oct 2027</span>`)}
            ${tile("Kick-in barrier", KI + "%", "of underlying’s reference price", 3)}
            ${tile("Underlyings", "Worst of 3", B.names.map((n, s) => `<span class="hk-stk"><span class="hk-dot ${DOT[s]}"></span>${n}</span>`).join(""), 5)}
            ${tile("Issuer", "UBS", "simulated with UBS as the issuer")}
          </div>
          <div class="hk-cpn">
            <div class="hk-big">${CPN}%<span class="pa"> p.a.</span></div>
            <div class="hk-ct"><p class="k">Semi-annual coupon</p><p><b>2 × ${HALF}</b> per USD ${NOM}, paid whatever happens, but never more</p></div>
            <div class="hk-gt" data-step="1" style="--d:14">&gt; ${RATIO}<span class="x">×</span></div>
            <div class="hk-rf" data-step="1" style="--d:11"><p class="k">Risk-free rate</p><p class="n">${R_TXT}%</p><p>continuously compounded ≈ ${R_YEAR}% a year</p></div>
          </div>
          <p class="hk-q" data-step="2"><span class="qt"></span><span class="cur"></span></p>
        </div>`;
      const pr = body.querySelector(".hk-pr"), q = body.querySelector(".hk-q"), qt = q.querySelector(".qt");
      let a = null;
      return {
        step(i, o) {
          if (a) a.cancel(); a = null;
          pr.classList.toggle("beat", i >= 1);
          q.classList.remove("typing");
          if (i < 2) { qt.textContent = ""; return; }
          if (o.instant) { qt.textContent = QUESTION; return; }
          q.classList.add("typing");
          a = U.anim(1300, t => { qt.textContent = QUESTION.slice(0, Math.round(QUESTION.length * t)); }, { ease: U.ease.lin, done: () => q.classList.remove("typing") });
        },
        leave() { if (a) a.cancel(); a = null; q.classList.remove("typing"); }
      };
    }
  });

  // ================= end card (placed after the conclusion's "Is 15% enough?") =================
  Deck.addSlide({
    id: "end", layout: "title", section: "", after: "conc-enough", steps: 0, secs: 8,
    notes: "Thank you for watching. And next time you see a fifteen percent coupon, ask yourself what it really costs you.",
    render(root) {
      root.innerHTML = `
        <div class="tt-left tt-end">
          <p class="tt-uni">Corporate Finance (7,107)<br>University of St.Gallen · Fall Term 2026</p>
          <div class="tt-rule"></div>
          <h1 class="tt-title">Thank you<br>for watching</h1>
          <p class="tt-sub">Next time you see a <span class="hl">${CPN}% coupon</span>, ask yourself what it really costs you.</p>
        </div>`;
      return pathsArt(root, 9);
    }
  });
})();
