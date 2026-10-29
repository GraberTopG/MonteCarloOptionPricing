/* Wrap-up and outlook (script section 6, assignment 3). Owner: video team.
   - conc-sum: the video in four lines: Monte Carlo · the Multi-BRC · why Monte Carlo · the Excel recipe
   - conc-limits: three limits of our model, each with its next step, then the simulation error (a limit of the
     estimate, not of the model, so it is set apart) and the two further limits listed in the workbook's Read Me
   - conc-enough: is 15% enough? fair coupon, fair value, what the bank keeps at other volatilities (sheet 11) and how
     many of our 2,000 simulated years end below 1,000
   The end card (sections/00-title.js) follows with after: "conc-enough". Excel numbers: Deck.util.XL (sections/excel-data.js). */
(function () {
  const U = Deck.util, B = U.BRC, XL = U.XL, XM = XL.model, fmt = U.fmt;
  const TK = B.tickers, LIGHT = ["--c-adbe-light", "--c-aapl-light", "--c-msft-light"];   // stock colours on white
  const NOMINAL = B.nominal * B.issuePrice;                 // 1,000: what the investor pays
  const KI = Math.round(B.kickIn * 100);                     // 65 (%)
  const ARROW = `<svg viewBox="0 0 44 24" aria-hidden="true"><path d="M3 12h34M28 4l9 8-9 8"/></svg>`;
  const svgIcon = inner => `<svg viewBox="0 0 24 24" aria-hidden="true">${inner}</svg>`;

  // a small fan of simulated stock paths (seeded: every take shows the same picture), as SVG path data in a w × h box
  function fan(seed, n, steps, w, h, pad) {
    const norm = U.normal(U.rng(seed)), P = Array.from({ length: n }, () => U.simPath(norm, { n: steps }));
    let lo = Infinity, hi = -Infinity;
    P.forEach(p => p.forEach(v => { lo = Math.min(lo, v); hi = Math.max(hi, v); }));
    const x = t => pad + t / steps * (w - 2 * pad), y = v => pad + (hi - v) / (hi - lo) * (h - 2 * pad);
    return P.map(p => ({ d: "M" + p.map((v, t) => x(t).toFixed(1) + " " + y(v).toFixed(1)).join("L"), end: [x(steps), y(p[steps])] }));
  }
  const polyD = pts => "M" + pts.map(p => p[0].toFixed(1) + " " + p[1].toFixed(1)).join("L");

  /* ======================================================================================================
     conc-sum: "Summary of the video"
     ====================================================================================================== */
  const FAN1 = fan(5, 11, 36, 300, 132, 6);
  const FAN_MC = fan(9, 7, 30, 132, 62, 3);
  // a recombining binomial tree, five levels (the lecture's tree, drawn small)
  const TREE = (() => {
    const L = 5, x = l => 8 + l * 29, y = (l, j) => 31 + (2 * j - l) * 6.6;
    let s = "";
    for (let l = 0; l < L - 1; l++) for (let j = 0; j <= l; j++) s += `<path d="M${x(l)} ${y(l, j)}L${x(l + 1)} ${y(l + 1, j)}M${x(l)} ${y(l, j)}L${x(l + 1)} ${y(l + 1, j + 1)}"/>`;
    for (let l = 0; l < L; l++) for (let j = 0; j <= l; j++) s += `<circle cx="${x(l)}" cy="${y(l, j)}" r="3.4"/>`;
    return `<svg class="cc-tree" viewBox="0 0 132 62" aria-hidden="true">${s}</svg>`;
  })();
  const MARK = ok => `<svg class="cc-mk ${ok ? "ok" : "no"}" viewBox="0 0 32 32" aria-hidden="true"><circle cx="16" cy="16" r="15"/><path d="${ok ? "M9 16.5l5 5 9-10" : "M10.5 10.5l11 11M21.5 10.5l-11 11"}"/></svg>`;
  const PAYOFF_ICON = svgIcon('<path d="M3 5l9 10h9"/><path d="M3 20h18" stroke-dasharray="2 3"/>');
  // the five steps of the Excel recipe, with the sheets they live on (the template's five blocks, XL.blocks)
  const RECIPE = [
    { t: "Inputs", s: "Sheets 1–6", ic: U.icon("grid") },
    { t: "Random shocks", s: "Sheet 7", ic: U.icon("dice") },
    { t: "Paths", s: "Sheet 8", ic: U.icon("paths") },
    { t: "Payoff", s: "Sheets 8–9", ic: PAYOFF_ICON },
    { t: "Average", s: "Sheet 10", ic: U.icon("avg") }
  ];
  const MC_PRICE = `<math display="block"><mtext>price</mtext><mo>≈</mo><msup><mi>e</mi><mrow><mo>−</mo><mi>r</mi><mi>T</mi></mrow></msup><mo>·</mo><mfrac><mn>1</mn><mi>n</mi></mfrac><munderover><mo movablelimits="false">∑</mo><mrow><mi>i</mi><mo>=</mo><mn>1</mn></mrow><mi>n</mi></munderover><msub><mtext>payoff</mtext><mi>i</mi></msub></math>`;

  Deck.addStyle(`
    .cc-sum{display:flex;flex-direction:column;gap:16px;height:100%}
    .cc-srow{flex:1;min-height:0;display:grid;grid-template-columns:64px 1fr 680px;column-gap:28px;align-items:center;background:var(--card);border-radius:10px;padding:10px 26px 10px 20px}
    .cc-srow .num{width:64px;height:64px;font-size:32px}
    .cc-srow h3{margin:0 0 6px;font:700 30px/1.15 var(--f-head);color:var(--green-ink)}
    .cc-srow p{margin:0;font:26px/1.3 var(--f-body);color:var(--ink)}
    .cc-sfig{display:flex;align-items:center;justify-content:flex-end;gap:18px;min-width:0}
    /* 1 · Monte Carlo: paths fan out, then the formula */
    .cc-fan{width:300px;height:132px;flex:none;overflow:visible}
    .cc-fan path{fill:none;stroke:var(--green-mid);stroke-width:2;stroke-linejoin:round;stroke-dasharray:1;stroke-dashoffset:1;transition:stroke-dashoffset 1s ease calc(.15s + var(--k,0) * 60ms)}
    .cc-fan circle{fill:var(--orange);opacity:0;transition:opacity .4s ease 1.2s}
    .cc-srow.on .cc-fan path{stroke-dashoffset:0}
    .cc-srow.on .cc-fan circle{opacity:1}
    .cc-mcf{font-size:30px;min-width:0}
    .cc-mcf math{font-size:30px}
    /* 2 · the Multi-BRC: bond minus put */
    .cc-box{border-radius:8px;padding:12px 20px 12px;text-align:center;display:flex;flex-direction:column;align-items:center;gap:2px}
    .cc-box b{font:800 30px/1.1 var(--f-head);color:var(--green-ink)}
    .cc-box em{font:22px/1.25 var(--f-body);font-style:normal;color:var(--ink)}
    .cc-box.bond{background:var(--green-light);border:2px solid var(--green)}
    .cc-box.put{background:var(--orange-light);border:2px solid var(--rule)}   /* the put: the grey "other side" box */
    .cc-tks{display:flex;gap:12px;font:700 22px var(--f-body);margin-top:2px}
    .cc-op{font:700 50px/1 var(--f-head);color:var(--green-ink)}
    /* 3 · why Monte Carlo: two tools that fail, one that works */
    .cc-tiles{display:flex;gap:18px}
    .cc-tile{position:relative;width:190px;height:122px;background:#fff;border-radius:8px;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:8px}
    .cc-tile b{font:700 22px var(--f-body);color:var(--ink);white-space:nowrap}
    .cc-tile .cc-tg{height:62px;display:flex;align-items:center}
    .cc-tile math{font-size:36px;color:var(--muted)}
    .cc-tile.no .cc-tg{opacity:.55}
    .cc-tree{width:132px;height:62px}
    .cc-tree path{stroke:var(--muted);stroke-width:1.5;fill:none}
    .cc-tree circle{fill:var(--muted)}
    .cc-mfan{width:132px;height:62px;overflow:visible}
    .cc-mfan path{fill:none;stroke:var(--green-mid);stroke-width:2;stroke-linejoin:round}
    .cc-mk{position:absolute;right:-12px;top:-12px;width:38px;height:38px;transform:scale(0);transition:transform .35s cubic-bezier(.3,1.6,.5,1) calc(.45s + var(--k,0) * .3s)}
    .cc-mk circle{stroke:#fff;stroke-width:2}
    .cc-mk.no circle{fill:var(--red-ink)} .cc-mk.ok circle{fill:var(--green)}
    .cc-mk path{fill:none;stroke:#fff;stroke-width:3.4;stroke-linecap:round;stroke-linejoin:round}
    .cc-srow.on .cc-mk{transform:none}
    /* 4 · the Excel recipe: five chips in a row */
    .cc-srow.recipe{grid-template-columns:64px 1fr}
    .cc-flow{display:flex;align-items:center;gap:10px;margin-top:10px}
    .cc-chip{flex:1 1 0;min-width:max-content;display:flex;align-items:center;gap:12px;background:#fff;border-radius:8px;padding:9px 12px}
    .cc-cic{width:52px;height:52px;border-radius:50%;background:var(--green-ink);display:grid;place-items:center;flex:none}
    .cc-cic svg{width:30px;height:30px;stroke:#fff;fill:none;stroke-width:2;stroke-linecap:round;stroke-linejoin:round}
    .cc-chip b{display:block;font:700 26px/1.15 var(--f-body);color:var(--ink);white-space:nowrap}
    .cc-chip em{display:inline-block;margin-top:4px;font:700 19px/1 var(--f-body);font-style:normal;letter-spacing:.05em;text-transform:uppercase;color:#fff;background:#1D6F42;border-radius:3px;padding:4px 7px}
    .cc-carr{flex:none;width:36px;height:20px;display:grid;place-items:center}
    .cc-carr svg{width:36px;height:20px;fill:none;stroke:var(--green);stroke-width:3.5;stroke-linecap:round;stroke-linejoin:round}
  `);

  Deck.addSlide({
    id: "conc-sum", section: "conclusion", steps: 3, secs: 27,
    title: "Summary of the video",
    subtitle: "The whole video in four lines",
    sources: "Arnold (2026), slides 7, 10 and 15; own Excel model",
    notes: "So, to sum up. Our product is a bond minus a put on the worst of three stocks. [→] Black-Scholes can't price it and a binomial tree is far too big. [→] Monte Carlo can: it prices an option by simulating many futures and averaging the discounted payoffs. [→] And in Excel, the recipe is simple: inputs, random shocks, paths, payoff, average.",
    render(body) {
      body.innerHTML = `
        <div class="cc-sum">
          <div class="cc-srow" data-step="0">
            <div class="num">1</div>
            <div><h3>The Multi-BRC</h3><p>A bond minus a put on the worst of three stocks</p></div>
            <div class="cc-sfig">
              <div class="cc-box bond"><b>Bond</b><em>coupons + ${fmt(NOMINAL, 0)}</em></div>
              <span class="cc-op">−</span>
              <div class="cc-box put"><b>Put</b><em>on the worst of</em><span class="cc-tks">${TK.map((t, k) => `<span style="color:var(${LIGHT[k]})">${t}</span>`).join("")}</span></div>
            </div>
          </div>
          <div class="cc-srow" data-step="1">
            <div class="num">2</div>
            <div><h3>Why Monte Carlo</h3><p>Black-Scholes can't price it, a binomial tree is far too big</p></div>
            <div class="cc-sfig cc-tiles">
              <div class="cc-tile no" style="--k:0"><div class="cc-tg"><math><mi>N</mi><mo>(</mo><msub><mi>d</mi><mn>1</mn></msub><mo>)</mo></math></div><b>Black-Scholes</b>${MARK(false)}</div>
              <div class="cc-tile no" style="--k:1"><div class="cc-tg">${TREE}</div><b>Binomial tree</b>${MARK(false)}</div>
              <div class="cc-tile ok" style="--k:2"><div class="cc-tg"><svg class="cc-mfan" viewBox="0 0 132 62" aria-hidden="true">${FAN_MC.map(p => `<path d="${p.d}"/>`).join("")}</svg></div><b>Monte Carlo</b>${MARK(true)}</div>
            </div>
          </div>
          <div class="cc-srow" data-step="2">
            <div class="num">3</div>
            <div><h3>Monte Carlo</h3><p>Simulate many futures, average the discounted payoffs</p></div>
            <div class="cc-sfig">
              <svg class="cc-fan" viewBox="0 0 300 132" aria-hidden="true">${FAN1.map((p, k) => `<path pathLength="1" style="--k:${k}" d="${p.d}"/>`).join("")}${FAN1.map(p => `<circle cx="${p.end[0].toFixed(1)}" cy="${p.end[1].toFixed(1)}" r="4.5"/>`).join("")}</svg>
              <div class="cc-mcf">${MC_PRICE}</div>
            </div>
          </div>
          <div class="cc-srow recipe" data-step="3">
            <div class="num">4</div>
            <div><h3>The Excel recipe</h3>
              <div class="cc-flow">${RECIPE.map((r, i) => `${i ? `<span class="cc-carr" data-step="3" style="--d:${2 * i}">${ARROW}</span>` : ""}<div class="cc-chip" data-step="3" style="--d:${2 * i + 1}"><span class="cc-cic">${r.ic}</span><span><b>${r.t}</b><em>${r.s}</em></span></div>`).join("")}</div>
            </div>
          </div>
        </div>`;
      return { step() {} };
    }
  });

  /* ======================================================================================================
     conc-limits: "Limits and next steps"
     ====================================================================================================== */
  // Broadie, Glasserman & Kou (1997): a barrier checked every Δt acts like a continuously watched barrier shifted by
  // e^(∓0.5826·σ·√Δt). Our down barrier: 65% checked daily ≈ 65% × e^(−0.5826·σ·√Δt) watched continuously (the bias).
  // The term sheet's kick-in is continuous (sheet 1 C28), so the correction checks daily against 65% × e^(+0.5826·σ·√Δt).
  const BGK_BETA = 0.5826, DT = 1 / XL.steps, BGK_SHIFT = BGK_BETA * XM.sigma[0] * Math.sqrt(DT);   // Adobe
  const BGK_BIAS = B.kickIn * 100 * Math.exp(-BGK_SHIFT);   // ≈ 63.9%: what our daily 65% acts like
  const BGK_FIX = B.kickIn * 100 * Math.exp(BGK_SHIFT);     // ≈ 66.1%: the daily barrier that prices the continuous 65%
  const SENS = name => { const s = XL.sens.find(x => x[0] === name); if (!s) console.error("conc-limits: no sensitivity " + name); return s ? s[1] : NaN; };
  const FV_BASE = SENS("Base case"), FV_RHO_DN = SENS("ρ −0.1"), FV_RHO_UP = SENS("ρ +0.1");
  const RHO = [[0, 1], [0, 2], [1, 2]].map(([a, b]) => ({ a, b, v: XM.rho[a][b] }));

  // limitation 1: between two daily checks the price dips below the barrier and comes back (own illustration)
  const DIP = (() => {
    const W = 280, H = 128, bar = 92, days = [40, 52, 60, 57, 50, 36], xs = days.map((_, i) => 14 + i * 48);
    const rnd = U.rng(11), pts = [];
    let low = null;
    for (let i = 0; i < days.length - 1; i++) for (let k = 0; k < 12; k++) {
      const u = k / 12, bump = Math.sin(Math.PI * u);
      const p = [xs[i] + (xs[i + 1] - xs[i]) * u, days[i] + (days[i + 1] - days[i]) * u + (i === 2 ? bump * 52 : 0) + (rnd() - .5) * 12 * bump];
      pts.push(p);
      if (i === 2 && (!low || p[1] > low[1])) low = p;
    }
    pts.push([xs[xs.length - 1], days[days.length - 1]]);
    return `<svg class="cc-lsvg" viewBox="0 0 ${W} ${H}" aria-hidden="true">
      <line x1="0" x2="${W}" y1="${bar}" y2="${bar}" class="bar"/><text x="${W}" y="${bar + 22}" text-anchor="end" class="bar">${KI}%</text>
      <path d="${polyD(pts)}" class="px"/>
      ${xs.map((x, i) => `<circle cx="${x}" cy="${days[i]}" r="6" class="day"/>`).join("")}
      <circle cx="${low[0].toFixed(1)}" cy="${low[1].toFixed(1)}" r="10" class="miss"/>
      <text x="${(low[0] + 16).toFixed(1)}" y="${(low[1] + 9).toFixed(1)}" class="miss">missed</text>
      <text x="0" y="16" class="lab"><tspan class="dot">●</tspan> daily check</text>
    </svg>`;
  })();
  // limitation 2: the market's smile (every strike its own volatility) against our one flat volatility (own sketch, no data)
  const SMILE = `<svg class="cc-lsvg" viewBox="0 0 280 128" aria-hidden="true">
      <path d="M26 26V106H276" class="ax"/>
      <path d="M36 36Q176 128 270 50" class="smile"/>
      <line x1="36" x2="270" y1="76" y2="76" class="flat"/>
      <line x1="30" x2="52" y1="10" y2="10" class="smile"/><text x="58" y="16" class="smile">market</text>
      <line x1="140" x2="162" y1="10" y2="10" class="flat"/><text x="168" y="16" class="flat">our model</text>
      <text x="276" y="126" text-anchor="end" class="lab">strike</text><text x="18" y="66" text-anchor="middle" class="lab" transform="rotate(-90 18 66)">volatility</text>
    </svg>`;
  // next step 2: volatility that moves over time (own sketch: a seeded mean-reverting walk)
  const SVOL = (() => {
    const rnd = U.normal(U.rng(23)), n = 70, pts = [];
    let v = 0.5;
    for (let t = 0; t <= n; t++) { pts.push([36 + t / n * 234, 92 - v * 70]); v += 0.14 * (0.5 - v) + 0.075 * rnd(); v = Math.max(0.05, Math.min(1.1, v)); }
    return `<svg class="cc-lsvg" viewBox="0 0 280 128" aria-hidden="true">
      <path d="M26 6V106H276" class="ax"/>
      <path d="${polyD(pts)}" class="smile"/>
      <text x="276" y="126" text-anchor="end" class="lab">time</text><text x="20" y="56" text-anchor="middle" class="lab" transform="rotate(-90 20 56)">volatility</text>
    </svg>`;
  })();
  // next step 3: fair value with the correlation shifted by ± 0.1 (sheet 11)
  const STRESS = (() => {
    const lo = 914, hi = 936, X = v => 22 + (v - lo) / (hi - lo) * 256;
    const pts = [[FV_RHO_DN, "ρ − 0.1", "o"], [FV_BASE, "base", "b"], [FV_RHO_UP, "ρ + 0.1", "o"]];
    return `<svg class="cc-lsvg" viewBox="0 0 300 128" aria-hidden="true">
      <line x1="10" x2="290" y1="64" y2="64" class="ax"/>
      ${pts.map(([v, lab, c]) => `<text x="${X(v).toFixed(1)}" y="40" text-anchor="middle" class="lab">${lab}</text><circle cx="${X(v).toFixed(1)}" cy="64" r="9" class="${c}"/><text x="${X(v).toFixed(1)}" y="102" text-anchor="middle" class="val ${c}">${fmt(v, 0)}</text>`).join("")}
    </svg>`;
  })();
  const BGK_F = `<math><mn>${KI}%</mn><mo>×</mo><msup><mi>e</mi><mrow><mo>+</mo><mn>${BGK_BETA}</mn><mi>σ</mi><msqrt><mrow><mi mathvariant="normal">Δ</mi><mi>t</mi></mrow></msqrt></mrow></msup><mo>≈</mo><mn>${fmt(BGK_FIX, 1)}%</mn></math>`;

  // the simulation error (a limit of the estimate, not of the model): the 95% interval of the fair value,
  // fv ± 1.96 × standard error of the put (Read Me C29 = sheet 10 C39 ± 1.96 × sheet 11 F26), in USD per 1,000
  const FV0 = XL.res.fv, CI = XL.res.ci;
  if (Math.abs(CI[0] - (FV0 - 1.96 * XL.res.putSE)) > 0.01 || Math.abs(CI[1] - (FV0 + 1.96 * XL.res.putSE)) > 0.01)
    console.error("conc-limits: XL.res.ci is not fv ± 1.96 × putSE");
  const whisker = (x1, x2, y, cls) => `<path d="M${x1.toFixed(1)} ${y}H${x2.toFixed(1)}M${x1.toFixed(1)} ${y - 9}v18M${x2.toFixed(1)} ${y - 9}v18" class="${cls}"/>`;
  const CI_FIG = (() => {
    const W = 300, X = v => 62 + (v - CI[0]) / (CI[1] - CI[0]) * (W - 124), y = 62;
    return `<svg class="cc-lsvg cc-csvg" viewBox="0 0 ${W} 80" aria-hidden="true">
      <text x="${W / 2}" y="16" text-anchor="middle" class="lab">95% simulation interval</text>
      ${whisker(X(CI[0]), X(CI[1]), y, "ci")}
      <circle cx="${X(FV0).toFixed(1)}" cy="${y}" r="8" class="b"/>
      <text x="${X(FV0).toFixed(1)}" y="${y - 16}" text-anchor="middle" class="val">${fmt(FV0, 0)}</text>
      <text x="${(X(CI[0]) - 10).toFixed(1)}" y="${y + 8}" text-anchor="end" class="end">${fmt(CI[0], 0)}</text>
      <text x="${(X(CI[1]) + 10).toFixed(1)}" y="${y + 8}" class="end">${fmt(CI[1], 0)}</text>
    </svg>`;
  })();
  // its next step: 4× the paths halve the interval (the error falls with 1/√n), drawn to scale
  const MORE_FIG = (() => {
    const c = 210, half = 80;
    return `<svg class="cc-lsvg cc-csvg" viewBox="0 0 300 80" aria-hidden="true">
      ${[[XL.paths, 1, 22], [4 * XL.paths, 0.5, 60]].map(([n, k, y]) => `<text x="0" y="${y + 7}" class="lab">${fmt(n, 0)} paths</text>
        ${whisker(c - half * k, c + half * k, y, "ci")}<circle cx="${c}" cy="${y}" r="7" class="b"/>`).join("")}
    </svg>`;
  })();
  const EXTRA = { l: { h: "Simulation error", p: `${fmt(XL.paths, 0)} paths; ${fmt(FV0, 0)} is an estimate`, fig: CI_FIG },
    n: { h: "More paths", p: "4× the paths halve the interval", fig: MORE_FIG } };

  const LIMITS = [
    { l: { h: "Daily barrier check", p: "Once a day, not continuously", fig: DIP },
      n: { h: "Barrier correction", p: "Broadie et al. (1997)", fig: `<div class="cc-fx">${BGK_F}<small>our daily ${KI}% acts like a continuous ${fmt(BGK_BIAS, 1)}%;<br>to price the continuous ${KI}%,<br>check daily against ≈&nbsp;${fmt(BGK_FIX, 1)}%<br>(Adobe, σ&nbsp;=&nbsp;${fmt(XM.sigma[0] * 100, 0)}%, Δt&nbsp;=&nbsp;1/${XL.steps})</small></div>` } },
    { l: { h: "One flat volatility", p: "One σ per stock, no smile", fig: SMILE },
      n: { h: "Stochastic volatility", p: "Volatility moves at random, too", fig: SVOL } },
    { l: { h: "Correlation from past data", p: "One year of daily returns",
        fig: `<div class="cc-rho">${RHO.map(r => `<div><span><b style="color:var(${LIGHT[r.a]})">${TK[r.a]}</b> · <b style="color:var(${LIGHT[r.b]})">${TK[r.b]}</b></span><span class="v">ρ = ${fmt(r.v, 2)}</span></div>`).join("")}</div>` },
      n: { h: "Stress test (sheet 11)", p: "Fair value with correlation ± 0.1", fig: STRESS } }
  ];

  Deck.addStyle(`
    .cc-lim{display:flex;flex-direction:column;gap:10px;height:100%}
    .cc-lhead,.cc-lrow{display:grid;grid-template-columns:64px 1fr 64px 1fr;column-gap:20px}
    .cc-lhead{flex:none;height:28px;align-items:end}
    .cc-lhead span{font:700 22px/1 var(--f-body);letter-spacing:.08em;text-transform:uppercase;color:var(--muted)}
    .cc-lhead span:nth-child(2){grid-column:2} .cc-lhead span:nth-child(3){grid-column:4;color:var(--green)}
    .cc-lrow{flex:1;min-height:0;align-items:stretch}
    .cc-lrow>.num{align-self:center;width:64px;height:64px;font-size:32px}
    .cc-lcard{display:grid;grid-template-columns:1fr auto;column-gap:18px;align-items:center;border-radius:10px;padding:10px 22px;background:var(--card);min-width:0}
    .cc-lcard.next{background:var(--green-light);box-shadow:inset 0 0 0 2px var(--green)}
    .cc-lcard h3{margin:0 0 8px;font:700 29px/1.15 var(--f-head);color:var(--green-ink)}
    .cc-lcard p{margin:0;font:26px/1.3 var(--f-body);color:var(--ink)}
    .cc-larr{align-self:center;display:grid;place-items:center}
    .cc-larr svg{width:56px;height:30px;fill:none;stroke:var(--green);stroke-width:3.5;stroke-linecap:round;stroke-linejoin:round}
    .cc-lsvg{display:block;width:280px;height:128px;overflow:visible}
    .cc-lsvg .bar{stroke:var(--red-ink);stroke-width:2.5;stroke-dasharray:8 6}
    .cc-lsvg text{font:19px var(--f-body);fill:var(--muted)}
    .cc-lsvg text.bar{fill:var(--red-ink);font-weight:700;stroke:none}
    .cc-lsvg .px{fill:none;stroke:var(--green-mid);stroke-width:2.2;stroke-linejoin:round}
    .cc-lsvg circle.day{fill:var(--green-ink)}
    .cc-lsvg .dot{fill:var(--green-ink)}
    .cc-lsvg circle.miss{fill:none;stroke:var(--red-ink);stroke-width:3}
    .cc-lsvg text.miss{fill:var(--red-ink);font-weight:700}
    .cc-lsvg .ax{fill:none;stroke:var(--rule);stroke-width:2}
    .cc-lsvg .smile{fill:none;stroke:var(--orange);stroke-width:3.5;stroke-linecap:round}
    .cc-lsvg text.smile{fill:var(--orange-ink);stroke:none;font-weight:700}
    .cc-lsvg .flat{stroke:var(--green-ink);stroke-width:3;stroke-dasharray:10 6}
    .cc-lsvg text.flat{fill:var(--green-ink);stroke:none;font-weight:700}
    .cc-lsvg circle.b{fill:var(--green-ink)} .cc-lsvg circle.o{fill:var(--orange)}
    .cc-lsvg text.val{font:700 26px var(--f-body);fill:var(--ink)} .cc-lsvg text.val.o{fill:var(--orange-ink)}
    .cc-fx{background:#fff;border-radius:8px;padding:6px 16px;text-align:center;width:430px}
    .cc-fx math{font-size:28px}
    .cc-fx small{display:block;margin-top:4px;font:18px/1.22 var(--f-body);color:var(--muted)}
    /* the simulation error: set apart from the model's three limits (thin rule, un-numbered badge), a shorter row */
    .cc-ldiv{flex:none;border-top:2px solid var(--rule-light)}
    .cc-lrow.extra{flex:none;height:100px}
    .cc-lrow.extra .cc-lcard{padding:8px 22px}
    .cc-lrow.extra .cc-lcard h3{margin-bottom:6px}
    .cc-lrow.extra>.num svg{width:30px;height:30px;fill:none;stroke:var(--green-ink);stroke-width:3;stroke-linecap:round}
    .cc-lsvg.cc-csvg{width:300px;height:80px}
    .cc-lsvg .ci{fill:none;stroke:var(--green);stroke-width:3.5;stroke-linecap:round}
    .cc-lsvg text.end{font:700 22px var(--f-body);fill:var(--ink)}
    .cc-lnote{flex:none;margin:0;font:20px/1.3 var(--f-body);color:var(--muted)}
    .cc-rho{display:flex;flex-direction:column;gap:10px;width:280px}
    .cc-rho div{display:flex;justify-content:space-between;align-items:baseline;background:#fff;border-radius:6px;padding:6px 14px;font:21px var(--f-body);color:var(--muted)}
    .cc-rho b{font-weight:700}
    .cc-rho .v{font:700 24px var(--f-body);color:var(--ink);font-variant-numeric:tabular-nums}
  `);

  Deck.addSlide({
    id: "conc-limits", section: "conclusion", steps: 2, secs: 24,
    title: "Limits and next steps",
    subtitle: "Three limits of our model, and what fixes each one.",
    sources: "Broadie et al. (1997); own Excel model, Read Me and sheet 11; own illustration",
    notes: "Our model has limits. We check the barrier once a day, not continuously; a barrier correction fixes most of that. [→] We use one flat volatility per stock and ignore the smile, where every strike has its own volatility. Stochastic volatility is the next step. [→] And our correlation comes from past data, so we stress-test it.",
    render(body) {
      const card = (c, cls, i, d) => `<div class="cc-lcard ${cls}" data-step="${i}" style="--d:${d}"><div><h3>${c.h}</h3><p>${c.p}</p></div><div>${c.fig}</div></div>`;
      const row = (r, badge, i, d, extra) => `
            <div class="cc-lrow${extra ? " extra" : ""}">
              <div class="num${extra ? " soft" : ""}" data-step="${i}" style="--d:${d}">${badge}</div>
              ${card(r.l, "", i, d)}
              <div class="cc-larr" data-step="${i}" style="--d:${d + 4}">${ARROW}</div>
              ${card(r.n, "next", i, d + 6)}
            </div>`;
      // the model's three limits (numbered), then, with the last step, the simulation error set apart and the Read Me line
      body.innerHTML = `
        <div class="cc-lim">
          <div class="cc-lhead"><span></span><span>Limitation</span><span>Next step</span></div>
          ${LIMITS.map((r, i) => row(r, i + 1, i, 0)).join("")}
          <div class="cc-ldiv" data-step="2" style="--d:8"></div>
          ${row(EXTRA, `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 5v14M5 12h14"/></svg>`, 2, 9, true)}
          <p class="cc-lnote" data-step="2" style="--d:17">Two more limitations are in the workbook’s Read Me: the discounting choice and the option maturity gap.</p>
        </div>`;
      return { step() {}, resize() { U.tightenRoots(body); } };
    }
  });

  /* ======================================================================================================
     conc-enough: "Is 15% enough?"
     ====================================================================================================== */
  const FAIR_CPN = XL.res.fairCoupon, PAID = XL.coupon * 100, FV = XL.res.fv, GAP = NOMINAL - FV;
  const CPN_MAX = 25;   // top of the coupon chart, % p.a.
  // which of the 2,000 paths of sheet 9 end below 1,000 with the coupons included: XL.below.mask, 4 paths per hex digit,
  // most significant bit first, path 1 first
  const N_PATHS = XL.paths;
  const BELOW = (() => {
    const m = XL.below.mask, bits = new Uint8Array(N_PATHS);
    for (let p = 0; p < N_PATHS; p++) bits[p] = (parseInt(m[p >> 2], 16) >> (3 - (p & 3))) & 1;
    const cum = new Uint16Array(N_PATHS + 1);
    for (let p = 0; p < N_PATHS; p++) cum[p + 1] = cum[p] + bits[p];
    if (m.length * 4 !== N_PATHS || cum[N_PATHS] !== XL.below.n || XL.below.n !== 891 || bits[0] !== 1 || bits[N_PATHS - 1] !== 0
      || Math.abs(XL.below.n / N_PATHS * 100 - XL.below.pct) > 1e-9) console.error("conc-enough: XL.below.mask does not decode to 891 paths below 1,000 (path 1 below, path 2,000 not)");
    return { bits, cum };
  })();
  const PCT_BELOW = Math.round(XL.below.pct);   // 45
  const COLS = 50, ROWS = N_PATHS / COLS;        // the waffle: 50 × 40 squares, path 1 top left, row by row
  // what the bank keeps (1,000 − fair value, in % of 1,000) with every volatility 5 points lower, today, 5 points higher
  // (sheet 11 scenarios 2, 1 and 3: 2.7%, 7.5%, 12.2%)
  const KEEP = ["Vol −5 pp", "Base case", "Vol +5 pp"].map(n => {
    const s = XL.sens.find(x => x[0] === n);
    if (!s) console.error("conc-enough: no sensitivity " + n);
    return s ? (NOMINAL - s[1]) / NOMINAL * 100 : NaN;
  });
  const VOLS = [
    `Volatility −5 pts → bank keeps <b>≈${fmt(KEEP[0], 0)}%</b>`,
    `Today → <b>≈${fmt(KEEP[1], 1)}%</b> (${fmt(GAP, 0)} of ${fmt(NOMINAL, 0)})`,
    `Volatility +5 pts → bank keeps <b>≈${fmt(KEEP[2], 0)}%</b>`
  ];

  Deck.addStyle(`
    .cc-en{display:flex;flex-direction:column;gap:16px;height:100%}
    .cc-ecols{flex:1;min-height:0;display:grid;grid-template-columns:470px 470px 1fr;grid-template-rows:minmax(0,1fr) auto;column-gap:24px;row-gap:14px}
    .cc-ecol:nth-child(3){grid-column:3;grid-row:1 / span 2}   /* the simulated years: next to the coupon, the value and the strip */
    .cc-ecol{display:flex;flex-direction:column;gap:12px;min-width:0}
    .cc-ecol>.panel{flex:1;min-height:0;display:flex;flex-direction:column;padding:44px 30px 16px}
    .cc-cap{margin:0;height:68px;font:26px/1.3 var(--f-body);color:var(--ink)}
    .cc-cap b{color:var(--orange-ink)} .cc-cap b.r{color:var(--red-ink)}
    .cc-chart{position:relative;flex:1;min-height:0;display:grid;grid-template-columns:1fr 1fr;column-gap:46px;padding:54px 22px 0;border-bottom:3px solid var(--ink)}
    .cc-bar{position:relative}
    .cc-bar .f{position:absolute;left:0;right:0;bottom:0;height:calc(var(--h) * 100%);border-radius:4px 4px 0 0;transform-origin:50% 100%;transform:scaleY(0);transition:transform .9s cubic-bezier(.2,.7,.2,1) calc(.2s + var(--k,0) * .25s)}
    .cc-bar .f.fair{background:var(--orange)} .cc-bar .f.real{background:var(--green-ink)}
    .cc-bar .v{position:absolute;left:0;right:0;bottom:calc(var(--h) * 100% - 62px);text-align:center;font:800 44px/1 var(--f-head);font-variant-numeric:lining-nums;opacity:0;transition:opacity .4s ease calc(.9s + var(--k,0) * .25s)}
    .cc-bar .v.fair{color:var(--ink)} .cc-bar .v.real{color:#fff}
    .cc-ecol.on .cc-bar .f{transform:none}
    .cc-ecol.on .cc-bar .v{opacity:1}
    .cc-gap{position:absolute;left:-6px;right:-6px;bottom:calc(var(--b) * 100%);height:calc((var(--t) - var(--b)) * 100%);border:3px dashed var(--red-ink);border-radius:4px;background:var(--red-soft);display:flex;flex-direction:column;align-items:center;justify-content:center}
    .cc-gap.late{opacity:0;transition:opacity .4s ease 1.3s}
    .cc-ecol.on .cc-gap.late{opacity:1}
    .cc-gap b{font:700 26px/1.1 var(--f-body);color:var(--red-ink)}
    .cc-gap small{font:22px/1.2 var(--f-body);color:var(--red-ink)}
    .cc-gap .above{position:absolute;left:0;right:0;bottom:calc(100% + 6px);text-align:center;font:800 40px/1 var(--f-head);color:var(--red-ink);font-variant-numeric:lining-nums}
    .cc-xl{display:grid;grid-template-columns:1fr 1fr;column-gap:46px;padding:8px 22px 0;text-align:center;font:700 24px var(--f-body);color:var(--ink)}
    .cc-term{flex:1;min-height:0}
    .cc-term .term-body canvas{left:18px;top:16px;width:calc(100% - 36px);height:calc(100% - 32px)}
    .cc-term .term-stats{justify-content:space-between;gap:16px;padding:10px 20px}
    .cc-term .term-stats .v{font-size:30px}
    .cc-term .term-stats .v.t-red{color:var(--term-red)} .cc-term .term-stats .v.t-green{color:var(--term-green)}
    /* the volatility strip under the coupon and the value: what the bank keeps at three volatilities, as three mini bars
       to scale (black, like the 75 the bank keeps) */
    .cc-vol{grid-column:1 / span 2;grid-row:2;display:grid;grid-template-columns:auto 1fr;column-gap:24px;row-gap:5px;align-items:center;background:var(--green-light);border-radius:10px;padding:11px 26px}
    .cc-vt{font:22px/1.2 var(--f-body);color:var(--ink);white-space:nowrap}
    .cc-vt b{font-weight:700}
    .cc-vb{position:relative;height:16px}
    .cc-vb i{position:absolute;left:0;top:0;bottom:0;width:calc(var(--w) * 100%);background:var(--red-ink);border-radius:0 3px 3px 0;clip-path:inset(0 100% 0 0);transition:clip-path .7s cubic-bezier(.2,.7,.2,1) calc(1.4s + var(--k,0) * .15s)}
    .cc-vol.on .cc-vb i{clip-path:inset(0)}
    .cc-warn{flex:none;height:96px;background:var(--orange-light);font-size:26px;padding:14px 26px 14px 16px}
    .cc-warn .badge{background:var(--orange)}
    .cc-warn b{color:var(--ink)}
    .cc-ltag{margin-left:auto;flex:none;font:700 18px var(--f-body);color:var(--green-ink);border:1.5px solid var(--green);padding:5px 10px;white-space:nowrap}
  `);

  Deck.addSlide({
    id: "conc-enough", section: "conclusion", steps: 3, secs: 44,
    title: `Is ${fmt(PAID, 0)}% enough?`,
    subtitle: "Who gets what: fair coupon vs. what you get",
    lecture: "Lecture 4, slide 11",
    sources: "own Excel model, sheets 10 and 11; own count over the 2,000 paths of sheet 9 (891 years; sheet 10, C27, 46.85%, counts losses before coupons); Arnold (2026), slide 11",
    notes: "So, is fifteen percent enough? A fair coupon would be about 23 percent. You get 15. [→] That gap is worth 75 dollars, which the bank keeps, we assume, for its hedging, risk and margin. You pay 1,000 for something worth about 925, [→] and in 45 percent of our simulated years, you end up below your thousand, coupons included. [→] One warning: these are risk-neutral numbers, where stocks grow only at the risk-free rate. That's right for pricing, but it's not a forecast: if stocks earn more, the real chance of a loss is lower. That's the point we promised to come back to.",
    render(body) {
      const bar = (h, cls, label, k, extra) => `<div class="cc-bar" style="--h:${h.toFixed(4)};--k:${k}"><i class="f ${cls}"></i><span class="v ${cls}">${label}</span>${extra || ""}</div>`;
      body.innerHTML = `
        <div class="cc-en">
          <div class="cc-ecols">
            <div class="cc-ecol" data-step="0">
              <section class="panel"><h3 class="panel-title">The coupon</h3>
                <div class="cc-chart">
                  ${bar(FAIR_CPN / CPN_MAX, "fair", "≈ " + fmt(FAIR_CPN, 0) + "%", 0)}
                  ${bar(PAID / CPN_MAX, "real", fmt(PAID, 0) + "%", 1,
                    `<div class="cc-gap" data-step="1" style="--b:${(PAID / CPN_MAX).toFixed(4)};--t:${(FAIR_CPN / CPN_MAX).toFixed(4)}"><b>gap</b><small>worth ${fmt(GAP, 0)}</small></div>`)}
                </div>
                <div class="cc-xl"><span>fair</span><span>you get</span></div>
              </section>
              <p class="cc-cap">Fair: the coupon that would make it worth ${fmt(NOMINAL, 0)}</p>
            </div>
            <div class="cc-ecol" data-step="1">
              <section class="panel"><h3 class="panel-title">The value</h3>
                <div class="cc-chart">
                  ${bar(FV / NOMINAL, "fair", "≈ " + fmt(FV, 0), 0,
                    `<div class="cc-gap late" style="--b:${(FV / NOMINAL).toFixed(4)};--t:1"><span class="above">${fmt(GAP, 0)}</span></div>`)}
                  ${bar(1, "real", fmt(NOMINAL, 0), 1)}
                </div>
                <div class="cc-xl"><span>worth</span><span>you pay</span></div>
              </section>
              <p class="cc-cap">The bank keeps <b class="r">${fmt(GAP, 0)}</b> (we assume: hedging, risk, margin)</p>
            </div>
            <div class="cc-ecol" data-step="2">
              ${U.term({ cls: "cc-term", fn: "MCSIM", title: `${fmt(N_PATHS, 0)} SIMULATED YEARS`, meta: "SHEET 9 · ONE SQUARE = ONE PATH",
                body: `<canvas></canvas>`,
                stats: `<div><div class="k">Below ${fmt(NOMINAL, 0)}</div><div class="v t-red" data-c="below">0</div></div>
                  <div><div class="k">${fmt(NOMINAL, 0)} or more</div><div class="v t-green" data-c="above">0</div></div>
                  <div><div class="k">Share below</div><div class="v t-red" data-c="share">0%</div></div>` })}
              <p class="cc-cap"><b class="r">${PCT_BELOW}%</b> of our simulated years end below ${fmt(NOMINAL, 0)}, coupons included</p>
            </div>
            <div class="cc-vol" data-step="1" style="--d:12">${VOLS.map((t, k) => `<span class="cc-vt">${t}</span><span class="cc-vb"><i style="--w:${(KEEP[k] / Math.max(...KEEP)).toFixed(4)};--k:${k}"></i></span>`).join("")}</div>
          </div>
          <div class="icard cc-warn" data-step="3"><div class="badge">${U.icon("warn")}</div>
            <div><b>Risk-neutral numbers, not a forecast:</b> if stocks earn more, the real chance of a loss is lower</div>
            <span class="cc-ltag">Lecture 4, slide 11</span></div>
        </div>`;

      const cv = body.querySelector(".cc-term canvas"), cnt = {};
      body.querySelectorAll("[data-c]").forEach(el => { cnt[el.dataset.c] = el; });
      let shown = 0, run = null;
      function draw() {
        const c = U.canvas(cv); if (!c) return;
        const { ctx: g, w, h } = c, cell = Math.min(w / COLS, h / ROWS), q = cell * 0.39;
        const x0 = (w - COLS * cell) / 2 + cell / 2, y0 = (h - ROWS * cell) / 2 + cell / 2;
        const layers = [new Path2D(), new Path2D(), new Path2D()];   // not yet counted, below 1,000, 1,000 or more
        for (let p = 0; p < N_PATHS; p++) {
          const L = p >= shown ? 0 : BELOW.bits[p] ? 1 : 2, x = x0 + (p % COLS) * cell, y = y0 + Math.floor(p / COLS) * cell;
          layers[L].rect(x - q, y - q, 2 * q, 2 * q);
        }
        g.fillStyle = U.css("--term-line"); g.fill(layers[0]);
        g.fillStyle = U.css("--term-green"); g.globalAlpha = 0.42; g.fill(layers[2]); g.globalAlpha = 1;
        g.fillStyle = U.css("--term-red"); g.fill(layers[1]);
      }
      function setShown(n) {
        shown = n;
        const below = BELOW.cum[n];
        cnt.below.textContent = fmt(below, 0);
        cnt.above.textContent = fmt(n - below, 0);
        cnt.share.textContent = fmt(below / N_PATHS * 100, 0) + "%";   // one number with the caption: 45%
        draw();
      }
      const stop = () => { if (run) { run.cancel(); run = null; } };
      return {
        step(i, o) {
          stop();
          if (i < 2) { setShown(0); return; }
          if (i > 2 || o.instant) { setShown(N_PATHS); return; }
          // step 2, forwards: the squares are coloured in path order while the panel fades in
          setShown(0);
          run = U.anim(1900, k => setShown(Math.round(Math.max(0, (k - 0.1) / 0.9) * N_PATHS)), { ease: U.ease.lin, done: () => { run = null; setShown(N_PATHS); } });
        },
        resize: draw,
        // leaving mid-count (scroll mode may not call step again on return): finish at the end state of step 2
        leave() { if (run) { stop(); setShown(N_PATHS); } }
      };
    }
  });
})();
