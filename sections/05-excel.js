/* Section "excel" (assignment part 2, script section 5): the Excel walkthrough. Owner: Excel team.
   Slides, in the order of the final video script (the group records live Excel between them, see each slide's notes
   and liveSecs):
   - brc-steps     the plan: a recap of the theory (bond − put, the simulation in three moves), then (click) the seven steps,
                   each with a small picture from our data (5.1); then live
                   Excel: the workbook's Read Me and sheet tabs with the colour legend (the template, assignment 2a)
   - xl-input      step 1: Black-Scholes needs a volatility (5.2), then live Excel: sheets 5, 6 and 4
   - xl-gbm        step 2: the lecture's GBM in discrete time steps (5.3), then live Excel: sheet 7
   - xl-corr       step 2: correlated shocks with Cholesky (5.3), then live Excel: sheets 4 and 8
   - xl-year       step 3: the engine's formula and path 1 (5.4), then live Excel 5.5–5.8 (payoff, data table, fair value, checks)
   - xl-sens       which input matters most (5.8, sheet 11)
   All numbers and formulas come from Deck.util.XL (sections/excel-data.js). Classes are prefixed .xl- */
(function () {
  const U = Deck.util, B = U.BRC, XL = U.XL, XM = XL.model, P1 = XL.path1;
  const fmt = U.fmt, pct = (x, d) => fmt(x * 100, d) + "%";
  const sgn = (x, d) => (x >= 0 ? "+" : "−") + fmt(Math.abs(x), d);
  const TK = B.tickers;
  const LIGHT = ["--c-adbe-light", "--c-aapl-light", "--c-msft-light"];   // stock colours for text
  const DARK = ["--c-adbe", "--c-aapl", "--c-msft"];                      // stock colours for lines and bars
  const KI = B.kickIn, KI_TXT = pct(KI, 0);                                // 65%
  const MIO = XL.paths * XL.steps * 3 / 1e6;                              // 2,000 × 252 × 3 = 1.5 million random numbers
  const DT = `<mi mathvariant="normal">Δ</mi><mi>t</mi>`;
  const sub = (a, b) => `<msub><mi>${a}</mi>${b}</msub>`;
  // path 1 of sheet 8 as a fraction of each stock's start (xl-year, and the small charts of brc-steps)
  const NDAY = XL.steps, LV = P1.daily.map((p, k) => p.map(v => v / XL.S0[k]));
  const YR_MIN = 0.45, YR_MAX = 1.35;
  // sheet 11: the same 2,000 paths in every scenario; change in the put = base fair value − scenario fair value
  // (the bond is the same in every scenario). The two engine checks (rows 10 and 11) are not in this list.
  const BASE = XL.sens[0][1];
  const SENS = XL.sens.slice(1, 9).map(([lab, fv]) => ({ lab, fv, d: BASE - fv }));
  const bySize = (p, q) => Math.abs(q.d) - Math.abs(p.d);
  // the Cholesky clouds (xl-corr, and one of them on brc-steps): 1,000 seeded days of independent draws, mixed with the
  // weights of sheet 4, step D (XL.mix); own simulation
  const M = XL.mix, f2 = x => fmt(x, 2);
  const NC = 1000, CO_SEED = 240;   // a seed whose 1,000 days show the target correlations to two decimals
  const CE = [0, 1, 2].map(() => new Float64Array(NC));
  { const norm = U.normal(U.rng(CO_SEED)); for (let i = 0; i < NC; i++) for (let j = 0; j < 3; j++) CE[j][i] = norm(); }
  const corr = (x, y) => { let mx = 0, my = 0; for (let i = 0; i < NC; i++) { mx += x[i]; my += y[i]; } mx /= NC; my /= NC; let a = 0, b = 0, c = 0; for (let i = 0; i < NC; i++) { const p = x[i] - mx, q = y[i] - my; a += p * q; b += p * p; c += q * q; } return a / Math.sqrt(b * c); };
  // y of the cloud for mixing share m (0 = independent, 1 = our weights)
  const mixY = (k, m) => {
    const w = k === 1 ? [M.r12, M.s12, 0] : [M.r13, M.r23s, M.r33s], own = k === 1 ? 1 : 2;
    const c = [0, 1, 2].map(j => (1 - m) * (j === own ? 1 : 0) + m * w[j]);
    const y = new Float64Array(NC); for (let i = 0; i < NC; i++) y[i] = c[0] * CE[0][i] + c[1] * CE[1][i] + c[2] * CE[2][i];
    return y;
  };
  const RHO_MEAS = [1, 2].map(k => corr(CE[0], mixY(k, 1)));
  const RHO_AM = corr(mixY(1, 1), mixY(2, 1));                // Apple vs Microsoft on the same days: 0.14 (target 0.14)
  const rhoTxt = r => Math.abs(r) < 0.005 ? "0.00" : f2(r).replace("-", "−");

  Deck.addStyle(`
    /* sheet tabs in the workbook's own colours */
    .xl-tabs{display:flex;gap:6px}
    .xl-tabs i{font:700 20px/1 var(--f-body);font-style:normal;font-variant-numeric:tabular-nums;min-width:31px;text-align:center;border:1px solid rgba(0,0,0,.28);border-radius:3px 3px 0 0;padding:5px 7px 4px;letter-spacing:0}
    .xl-tabs.sm{gap:4px}
    .xl-tabs.sm i{font-size:16px;min-width:24px;padding:4px 5px 3px}
    /* small flat tags (never clickable): green = known, black = missing */
    .xl-tag{display:inline-block;font:700 17px/1 var(--f-body);letter-spacing:.06em;text-transform:uppercase;color:#fff;background:var(--green);padding:6px 10px;white-space:nowrap}
    .xl-tag.mis{background:var(--ink)}

    /* ---------- brc-steps ---------- */
    .xl-st{display:flex;flex-direction:column;gap:20px;height:100%}
    .xl-st-in{opacity:0;transform:translateY(18px);transition:opacity .5s ease,transform .5s ease;transition-delay:calc(.2s + var(--k) * 170ms)}
    .xl-st.on .xl-st-in{opacity:1;transform:none}
    /* the seven cards wait for the click (step 1) */
    .xl-st.on .xl-st-list:not(.on) .xl-st-in{opacity:0;transform:translateY(18px);transition-delay:0s}
    .xl-st-head{display:flex;flex-direction:column;gap:22px;padding:36px 30px 26px;flex:none}
    .xl-st-head .chip{top:-24px;font-size:26px;padding:7px 40px}
    .xl-st-eq{display:flex;align-items:center;justify-content:center;gap:30px}
    .xl-st-head math{font-size:50px}
    .xl-st-head .sep{width:2px;height:56px;background:var(--rule);opacity:.6}
    .xl-st-only{font:34px/1.2 var(--f-body);color:var(--ink)}
    .xl-st-put{color:var(--orange-ink)}
    /* the simulation in three moves (the narration's "to price it ..."): an icon each, joined by arrows */
    .xl-st-flow{list-style:none;margin:0;padding:0;display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:40px}
    .xl-st-flow li{position:relative;display:flex;flex-direction:column;align-items:center;text-align:center;text-wrap:balance;font:24px/1.3 var(--f-body);color:#4E5552}
    .xl-st-flow strong{color:var(--ink)}
    .xl-st-ic{width:80px;height:80px;border-radius:50%;background:var(--green);display:grid;place-items:center;margin-bottom:12px}
    .xl-st-ic svg{width:46px;height:46px;fill:none;stroke:#fff;stroke-width:1.9;stroke-linecap:round;stroke-linejoin:round}
    .xl-st-flow b{font:700 30px/1.15 var(--f-head);color:var(--green-ink);margin-bottom:4px;white-space:nowrap}
    /* the arrow from the move before: from 10px right of its circle to 10px left of this one (the grid gap is 40px) */
    .xl-st-flow li+li::before{content:"";position:absolute;top:39px;left:calc(10px - 50%);width:calc(100% - 75px);height:2.5px;background:var(--green-mid)}
    .xl-st-flow li+li::after{content:"";position:absolute;top:31px;left:calc(50% - 65px);border:9px solid transparent;border-left:15px solid var(--green-mid);border-right:0}
    /* seven cards, the table of contents of the Excel part: number and sheets, title, one small picture from our data */
    .xl-st-list{list-style:none;margin:0;padding:0;flex:1;min-height:0;display:grid;grid-template-columns:repeat(7,minmax(0,1fr));gap:12px}
    .xl-st-c{display:flex;flex-direction:column;gap:8px;min-width:0;min-height:0;background:var(--card);border-radius:10px;padding:12px}
    .xl-st-top{display:flex;align-items:center;justify-content:space-between;gap:8px}
    .xl-st-top .num{width:36px;height:36px;font-size:20px}
    .xl-st-t{margin:0;font:700 22px/1.15 var(--f-head);color:var(--green-ink);font-variant-numeric:lining-nums;min-height:3.45em}   /* three lines: "Step 2: …" is the longest, the pictures line up */
    .xl-st-v{flex:1;min-height:0;display:flex;flex-direction:column;background:#fff;border-radius:8px;padding:12px 10px}
    .xl-st-cv{position:relative;flex:1;min-height:0}
    .xl-st-cv canvas{position:absolute;inset:0;width:100%;height:100%;display:block}
    /* 1: the implied volatilities as bars */
    .xl-st-bars{flex:1;min-height:0;display:grid;grid-template-columns:repeat(3,1fr);align-items:end;border-bottom:1.5px solid var(--rule);margin:0 2px}
    .xl-st-bars>div{display:flex;flex-direction:column;align-items:center}
    .xl-st-bars b{font:700 20px var(--f-body);margin-bottom:4px}
    .xl-st-bars i{display:block;width:44px;border-radius:2px 2px 0 0}
    .xl-st-tk{display:grid;grid-template-columns:repeat(3,1fr);margin:6px 2px 0;text-align:center;font:700 17px var(--f-mono)}
    /* 6: bond − put = fair value, as a waterfall */
    .xl-st-wf{flex:1;min-height:0;display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin:26px 2px 0}
    .xl-st-wf>div{position:relative;border-bottom:1.5px solid var(--rule);margin-bottom:26px}
    .xl-st-wf .bar{position:absolute;left:5px;right:5px;border-radius:2px 2px 0 0}
    .xl-st-wf .bar b{position:absolute;left:50%;bottom:100%;transform:translateX(-50%);margin-bottom:3px;font:700 18px var(--f-body);color:var(--ink);white-space:nowrap}
    .xl-st-wf .lab{position:absolute;top:100%;left:-6px;right:-6px;margin-top:5px;text-align:center;font:16px var(--f-body);color:var(--muted);white-space:nowrap}
    .xl-st-wf .bond .bar{background:var(--green-ink)}
    .xl-st-wf .put .bar{background:var(--orange-light);border:1.5px dashed var(--rule);border-radius:2px}
    .xl-st-wf .fv .bar{background:var(--green)}
    /* 7: the eight sensitivities, largest first */
    .xl-st-tor{position:relative;flex:1;min-height:0;display:flex;flex-direction:column;justify-content:space-around;margin:2px 0}
    .xl-st-tor::before{content:"";position:absolute;left:50%;top:0;bottom:0;border-left:1.5px solid var(--rule)}
    .xl-st-tor span{position:relative;height:16px}
    .xl-st-tor i{position:absolute;top:0;bottom:0;border-radius:1px;background:var(--green-ink)}
    .xl-st-tor i.p{left:50%} .xl-st-tor i.n{right:50%}
    .xl-st-tor i.v{background:var(--green)}

    /* ---------- xl-input ---------- */
    .xl-in{display:grid;grid-template-columns:1fr 640px;gap:44px;height:100%}
    .xl-in-l{display:flex;flex-direction:column;justify-content:space-between;padding:8px 0 0;min-width:0}
    .xl-in-l .label{margin:0}
    .xl-in-l .fbox{padding:24px 20px 14px}
    .xl-in-l .fbox math{font-size:40px}
    .xl-in-d{display:grid;grid-template-columns:1.25fr 1fr;gap:26px}
    .xl-in-d .fbox{display:flex;align-items:center;justify-content:center;padding:14px 14px}
    .xl-in-d .fbox math{font-size:37px}
    /* the inputs light up: a background plus a spread shadow, so nothing moves; the missing σ in solid green */
    .xl-in-v{border-radius:3px;transition:background-color .45s ease,box-shadow .45s ease,color .45s ease;transition-delay:calc(var(--k,0) * 420ms)}
    .xl-in .k-S{--k:0} .xl-in .k-K{--k:1} .xl-in .k-T{--k:2} .xl-in .k-r{--k:3} .xl-in .k-s{--k:0}
    .xl-in.s1 .xl-in-v:not(.k-s){background:#BFE0C9;box-shadow:0 0 0 4px #BFE0C9;color:#00692A}
    .xl-in .xl-in-v.k-s{padding:0 4px}   /* room for its solid highlight in every state, so the superscript and the root stay clear */
    .xl-in.s2 .xl-in-v.k-s{background:var(--green);box-shadow:0 -4px 0 var(--green),0 4px 0 var(--green);color:#fff}
    .xl-in-p{display:flex;flex-direction:column;padding:48px 28px 18px}
    .xl-in-row{flex:1;display:grid;grid-template-columns:78px 1fr auto;column-gap:16px;align-items:center;border-top:1px solid var(--rule-light);padding:6px 0}
    .xl-in-row:first-of-type{border-top:0}
    .xl-in-sym math{font-size:40px}
    .xl-in-lab{font:24px/1.2 var(--f-body);color:var(--muted)}
    .xl-in-val{font:700 28px/1.25 var(--f-body);color:var(--ink);font-variant-numeric:tabular-nums;margin-top:3px}
    .xl-in-val small{font:400 22px var(--f-body);color:var(--muted)}
    .xl-in-px{display:flex;gap:18px}
    .xl-in-px span{display:flex;flex-direction:column;line-height:1.1}
    .xl-in-px b{font:700 20px var(--f-body);letter-spacing:.04em}
    .xl-in-val,.xl-in-row .xl-tag{opacity:0;transition:opacity .45s ease;transition-delay:calc(var(--k,0) * 420ms)}
    .xl-in.s1 .xl-in-row:not(.k-s) .xl-in-val,.xl-in.s1 .xl-in-row:not(.k-s) .xl-tag,.xl-in.s2 .xl-in-row.k-s .xl-in-val,.xl-in.s2 .xl-in-row.k-s .xl-tag{opacity:1}
    .xl-in-row.k-s .xl-in-val{color:var(--orange-ink);font-size:42px;line-height:1.05}
    .xl-in-row.k-s .xl-in-val small{display:block;margin-top:2px;font-weight:400;color:var(--ink)}
    .xl-in-row{transition:background-color .45s ease;transition-delay:calc(var(--k,0) * 420ms)}
    .xl-in.s2 .xl-in-row.k-s{background:var(--orange-light);margin:0 -14px;padding:6px 14px;border-radius:8px}
    /* step 2: the implied-volatility idea (option price → Black-Scholes backwards → σ) and the key line */
    .xl-in-new{display:flex;flex-direction:column;gap:18px}
    .xl-in-iv{display:flex;align-items:center;gap:24px}
    .xl-in-flow{display:flex;align-items:center;gap:10px;flex:none}
    .xl-in-nd{font:700 23px/1.1 var(--f-body);color:var(--ink);background:#fff;border:2px solid var(--rule-light);border-radius:8px;padding:11px 14px;white-space:nowrap}
    .xl-in-nd.bs{background:var(--green-light);border-color:var(--green-light);color:var(--green-ink)}
    .xl-in-nd.sg{width:56px;height:56px;padding:0;border-radius:50%;display:grid;place-items:center;background:var(--green);border-color:var(--green);color:#fff}
    .xl-in-nd.sg math{font-size:34px}
    .xl-in-ar{width:42px;height:20px;flex:none;fill:none;stroke:var(--green-ink);stroke-width:3;stroke-linecap:round;stroke-linejoin:round}
    .xl-in-cap{margin:0;font:21px/1.3 var(--f-body);color:var(--muted)}
    .xl-in-key{margin:0;font:700 26px/1.25 var(--f-head);color:var(--green-ink);border-left:6px solid var(--green);padding:4px 0 4px 16px;font-variant-numeric:lining-nums}

    /* ---------- xl-gbm ---------- */
    .xl-gb{display:grid;grid-template-rows:280px minmax(0,1fr) auto;gap:22px;height:100%}
    .xl-gb-row{display:grid;grid-template-columns:1fr 600px;grid-template-rows:minmax(0,1fr);gap:28px;min-height:0}
    .xl-gb-top{display:flex;flex-direction:column;align-items:center;justify-content:center;padding:28px 24px 16px}
    .xl-gb-top math{font-size:76px}
    .xl-gb-top p{margin:16px 0 0;font:28px var(--f-body);color:#4E5552}
    .xl-gb-top p math{font-size:30px}
    /* Drift in dark green, Shock in HSG green: a white chip and a green tint on the light green box */
    .xl-gb-w{font-family:var(--f-body);font-weight:700;border-radius:4px;transition:background-color .45s ease,box-shadow .45s ease}
    .xl-gb-w.dr{color:var(--green-ink)} .xl-gb-w.sh{color:var(--green)}
    .xl-gb.s1 .xl-gb-w.dr{background:#fff;box-shadow:0 0 0 6px #fff}
    .xl-gb.s2 .xl-gb-w.sh{background:#BFE0C9;box-shadow:0 0 0 6px #BFE0C9}
    .xl-gb-sv{padding:44px 18px 12px;display:flex;flex-direction:column;min-height:0}
    .xl-gb-sv svg{display:block;flex:1;min-height:0;width:100%;overflow:visible}
    .xl-gb-sv .p{opacity:0;transition:opacity .5s ease .15s}
    .xl-gb.s1 .p.dr,.xl-gb.s2 .p.sh,.xl-gb.s3 .p.zz{opacity:1}
    /* the same column edges as the row above: 1fr 1fr = the formula box, 600px = the "one time step" panel */
    .xl-gb-cards{display:grid;grid-template-columns:1fr 1fr 600px;gap:28px;min-height:0}
    .xl-gb-c{position:relative;background:var(--card);border-radius:10px;padding:16px 24px 16px;border-top:6px solid var(--rule-light);display:flex;flex-direction:column;gap:12px;opacity:.32;transition:opacity .5s ease,border-color .4s}
    .xl-gb-c.on{opacity:1}
    .xl-gb-c .xl-gb-b{display:flex;flex-direction:column;gap:10px;flex:1;opacity:0;transition:opacity .5s ease .1s}
    .xl-gb-c.on .xl-gb-b{opacity:1}
    .xl-gb-c.dr.on{border-top-color:var(--green-ink)} .xl-gb-c.sh.on{border-top-color:var(--green)} .xl-gb-c.zz.on{border-top-color:var(--green-mid)}
    .xl-gb-h{margin:0;display:flex;align-items:center;gap:12px;font:700 28px/1.2 var(--f-head);color:var(--ink)}
    .xl-gb-h .num{width:44px;height:44px;font-size:22px}
    .xl-gb-h math{font-size:31px}
    .xl-gb-c.dr .xl-gb-h{color:var(--green-ink)} .xl-gb-c.sh .xl-gb-h{color:var(--green)}
    .xl-gb-f{background:#fff;border-radius:8px;padding:10px 10px;text-align:center}
    .xl-gb-f math{font-size:38px}
    .xl-gb-b p{margin:0;font:26px/1.3 var(--f-body);color:var(--ink)}
    .xl-gb-b p.m{font-size:23px;color:#4E5552;margin-top:auto}
    .xl-gb-b p math{font-size:27px}
    /* the lecture's notation, under the drift formula */
    .xl-gb-b p.xl-gb-fn{margin-top:-4px;font-size:19px;color:var(--muted)}
    .xl-gb-b p.xl-gb-fn math{font-size:21px}
    .xl-gb-z{border-radius:3px;transition:background-color .45s ease,box-shadow .45s ease,color .45s ease}
    .xl-gb.s3 .xl-gb-z{background:#BFE0C9;box-shadow:0 0 0 4px #BFE0C9;color:#00692A}
    .xl-gb-bell{display:block;width:100%;height:auto;overflow:visible}
    .xl-gb-drop{transform:translateY(-110px);opacity:0;transition:transform .8s cubic-bezier(.3,1.35,.5,1) .35s,opacity .25s ease .35s}
    .xl-gb.s3 .xl-gb-drop{transform:none;opacity:1}
    /* step 3: the random numbers in Excel, a compact strip at the bottom */
    .xl-gb-strip{display:flex;align-items:center;justify-content:center;background:var(--card);border-radius:10px;padding:12px 22px;font:21px/1.25 var(--f-body);color:var(--ink)}
    .xl-gb-strip>span{white-space:nowrap}
    .xl-gb-strip>span+span{border-left:2px solid var(--rule);margin-left:26px;padding-left:26px}
    .xl-gb-strip math{font-size:24px}
    .xl-gb-strip code{font:500 20px var(--f-mono);color:var(--green-ink);font-variant-ligatures:none}

    /* ---------- xl-corr ---------- */
    .xl-co{display:grid;grid-template-columns:1fr 600px;gap:40px;height:100%}
    .xl-co-l{display:flex;flex-direction:column;gap:22px;min-width:0}
    .xl-co-intro{font-size:26px;line-height:1.35;padding:16px 24px}
    .xl-co-intro math{font-size:29px}
    .xl-co-box{flex:1;padding:40px 26px 72px;display:flex;flex-direction:column;justify-content:space-around;gap:12px}
    .xl-co-box .chip{white-space:nowrap}
    .xl-co-row{text-align:left;border-radius:10px;padding:12px 20px 12px 14px;border-left:8px solid transparent;transition:opacity .45s ease,background-color .35s,border-color .35s}
    .xl-co-row.ghost{opacity:.35}
    .xl-co-row.cur{background:#fff}
    .xl-co-eq{display:grid;grid-template-columns:196px 58px 1fr;align-items:baseline;font-family:var(--f-math)}
    .xl-co-eq math{font-size:44px}
    .xl-co-eq>:first-child{justify-self:end}
    .xl-co-eq>:nth-child(2){justify-self:center}
    .xl-co-eq>:nth-child(3){justify-self:start}
    .xl-co-n{font:24px/1.3 var(--f-body);color:#4E5552;margin:8px 0 0 254px;opacity:0;transition:opacity .45s ease .15s}
    .xl-co-n math{font-size:27px}
    .xl-co-row.cur .xl-co-n,.xl-co-row.done .xl-co-n{opacity:1}
    .xl-co-k{border-radius:3px;transition:background-color .4s,box-shadow .4s,color .4s}
    .xl-co-row.cur .xl-co-k{background:#BFE0C9;box-shadow:0 0 0 4px #BFE0C9;color:#00692A}
    /* the textbook's notation, a small note at the bottom of the box, left of the Excel tag */
    .xl-co-hull{position:absolute;left:26px;right:470px;bottom:12px;margin:0;font:18px/1.3 var(--f-body);color:var(--muted);text-align:left}
    .xl-co-hull math{font-size:21px}
    /* the Excel reference tags sit inside their box, readable on video (theme.css hangs them off the bottom edge at 13 px) */
    .xl-co .xlref,.xl-yr .xlref{font-size:18px;padding:6px 10px}
    .xl-co .xlref{bottom:14px;right:16px}
    .xl-yr .xlref{bottom:12px;right:14px}
    .xl-co .term{height:100%;min-width:0}
    .xl-co .term-body{display:grid;grid-template-rows:1fr 1fr}
    .xl-co .term-body>div{position:relative;min-height:0}
    .xl-co .term-body>div+div{border-top:1px solid var(--term-line)}
    /* Apple vs Microsoft, the pair without a cloud: one line under the two */
    .xl-co .term-stats{padding:11px 18px}
    .xl-co-am{font:500 18px/1.2 var(--f-mono);color:var(--term-muted);letter-spacing:.02em;white-space:nowrap}
    .xl-co-am .pr{color:var(--term-text)}
    .xl-co-am .rv{font-size:22px;color:var(--amber)}

    /* ---------- xl-year ---------- */
    .xl-yr{display:grid;grid-template-rows:212px 1fr;gap:24px;height:100%}
    .xl-yr-top{display:grid;grid-template-columns:1fr 600px;gap:26px;min-height:0}
    .xl-yr-f{display:flex;flex-direction:column;align-items:center;justify-content:center;padding:26px 16px 18px}
    .xl-yr-f math{font-size:44px}
    /* Z (the shock) in a green tint, EXP and −σ²/2 in a white chip with dark green text */
    .xl-yr-h{border-radius:3px;transition:background-color .45s ease,box-shadow .45s ease,color .45s ease}
    .xl-yr.s1 .xl-yr-h.z{background:#BFE0C9;box-shadow:0 0 0 5px #BFE0C9;color:#00692A}
    .xl-yr.s2 .xl-yr-h.e{background:#fff;box-shadow:0 0 0 5px #fff;color:var(--green-ink)}
    .xl-yr-c{display:flex;flex-direction:column;gap:14px}
    .xl-yr-n{flex:1;display:flex;align-items:center;gap:16px;background:var(--card);border-radius:10px;padding:10px 20px;border-left:8px solid var(--rule-light);font:25px/1.28 var(--f-body);color:var(--ink);opacity:.3;transition:opacity .45s ease,border-color .35s}
    /* before its step a card shows only its heading, dimmed (as the xl-gbm cards do) */
    .xl-yr-n .t{opacity:0;transition:opacity .45s ease .1s}
    .xl-yr-n.on{opacity:1}
    .xl-yr-n.on .t{opacity:1}
    .xl-yr-n.z.on{border-left-color:var(--green)} .xl-yr-n.e.on{border-left-color:var(--green-ink)}
    .xl-yr-n math{font-size:27px}
    .xl-yr-n b{white-space:nowrap}
    .xl-yr .term{min-height:0}

    /* ---------- xl-sens ---------- */
    .xl-se .term{height:740px}
    .xl-se .term-body{padding:20px 44px 16px;display:flex;flex-direction:column}
    .xl-se-rows{flex:1;display:flex;flex-direction:column;position:relative;min-height:0}
    /* two groups: the market inputs, then the product's own terms (grey tint, below a thin divider) */
    .xl-se-grp{display:flex;flex-direction:column}
    .xl-se-grp.terms{margin:12px -20px 0;padding:2px 20px 4px;background:var(--tab);border-top:1.5px solid var(--rule);border-radius:0 0 4px 4px}
    .xl-se-gh{margin:0;height:34px;display:flex;align-items:center;font:700 20px var(--f-mono);color:var(--green-ink);letter-spacing:.02em}
    .xl-se-row{height:62px;display:grid;grid-template-columns:330px 1fr;align-items:center;transition:opacity .45s ease}
    .xl-se-row.dim{opacity:.45}
    .xl-se-lab{font:500 25px/1.1 var(--f-mono);color:var(--term-text);white-space:nowrap}
    .xl-se-lab small{display:block;margin-top:3px;font:500 17px var(--f-mono);color:var(--term-muted)}
    .xl-se-plot{position:relative;height:100%}
    .xl-se-bar{position:absolute;top:50%;height:38px;margin-top:-19px;width:0;background:var(--term-blue);opacity:.88;border-radius:2px;transition:width .9s cubic-bezier(.2,.8,.3,1),background-color .4s,opacity .4s;transition-delay:calc(.2s + var(--k) * 90ms),0s,0s}
    .xl-se-bar.pos{left:50%} .xl-se-bar.neg{right:50%}
    .xl-se.on .xl-se-bar{width:var(--w)}
    .xl-se-val{position:absolute;top:50%;transform:translateY(-50%);font:700 26px var(--f-mono);color:var(--term-text);white-space:nowrap;opacity:0;transition:opacity .4s ease;transition-delay:calc(.9s + var(--k) * 90ms)}
    .xl-se.on .xl-se-val{opacity:1}
    .xl-se-call{position:absolute;top:50%;transform:translateY(-50%);font:700 26px var(--f-mono);color:var(--amber);white-space:nowrap;opacity:0;transition:opacity .45s ease .2s}
    .xl-se.s1 .xl-se-call{opacity:1}
    .xl-se.s1 .xl-se-row.hi .xl-se-bar{background:var(--amber);opacity:1}
    .xl-se.s1 .xl-se-row.hi .xl-se-lab{color:var(--amber);font-weight:700}
    .xl-se.s1 .xl-se-row.rho .xl-se-lab{color:var(--amber)}
    .xl-se.s1 .xl-se-row.rho .xl-se-val{opacity:0;transition:opacity .2s ease}   /* gone before its callout fades in at the same place */
    .xl-se.s1 .xl-se-row:not(.hi):not(.rho){opacity:.4}
    .xl-se-z0{position:absolute;left:330px;right:0;top:0;bottom:0;pointer-events:none}
    .xl-se-zero{position:absolute;top:-8px;bottom:-8px;width:0;border-left:2px solid #5A6B63}
    .xl-se-ax{display:grid;grid-template-columns:330px 1fr;margin-top:10px}
    .xl-se-ticks{position:relative;height:30px;border-top:1px solid var(--term-line)}
    .xl-se-ticks span{position:absolute;top:8px;transform:translateX(-50%);font:500 19px var(--f-mono);color:var(--term-muted)}
    .xl-se-cap{display:flex;justify-content:space-between;margin-top:12px;font:500 19px var(--f-mono);color:var(--term-muted);letter-spacing:.04em}
    .xl-se-cap b{color:var(--term-text);font-weight:700}
  `);

  // ---------- shared helpers ----------
  // sheet tabs in the file's own tab colours: dark text on the two light greens, white on the two dark ones
  const tabInk = hex => [1, 3, 5].reduce((s, k, j) => s + [0.299, 0.587, 0.114][j] * parseInt(hex.substr(k, 2), 16), 0) > 140 ? "#0E3B22" : "#fff";
  const tabs = (list, cls) => `<span class="xl-tabs ${cls || ""}">${list.map(n => `<i style="background:${XL.tabColors[n]};color:${tabInk(XL.tabColors[n])}" title="${n}. ${XL.sheetNames[n]}">${n}</i>`).join("")}</span>`;
  // replays a build-in on every forward entry (instant jumps and static mode show the end state at once)
  const replay = (el, cls, o) => {
    if (o.instant || U.reduced) { el.classList.add(cls); return; }
    el.classList.remove(cls); void el.offsetWidth; el.classList.add(cls);
  };
  const hline = (ctx, x0, x1, y, col, w, dash) => { ctx.save(); ctx.strokeStyle = col; ctx.lineWidth = w; ctx.setLineDash(dash || []); ctx.beginPath(); ctx.moveTo(x0, y); ctx.lineTo(x1, y); ctx.stroke(); ctx.restore(); };

  // ================= 1) brc-steps: the plan =================
  // the box on top, a recap of the theory before Excel: bond − put, and the simulation in three moves (the narration's
  // "to price it ..." condensed), named and drawn like the three moves of mc-sample and mc-paths
  const FLOW = [
    { t: "Sample a random path", k: "we use <strong>GBM</strong> for the <strong>three stocks</strong> over the next year", ic: U.icon("dice") },
    { t: "Compute its discounted payoff", k: "did any stock touch its <strong>barrier</strong>? What does the <strong>put</strong> pay at the end?", ic: U.icon("check") },
    // x̄, the sample mean
    { t: "Repeat and average them all", k: `over <strong>${fmt(XL.paths, 0)} paths</strong>, the average discounted payoff is the <strong>price of the put</strong>`,
      ic: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7.5 5h9"/><text x="12" y="19.5" text-anchor="middle" style="font:italic 19px var(--f-math);fill:#fff;stroke:none">x</text></svg>' }
  ];
  // the seven steps, the table of contents of the Excel part: only the title and one small picture made from our three
  // stocks' data (the group, 1 Nov 2026). The step slides take their titles from here (steps 4 to 6 are live Excel)
  const STEPS = [
    { t: "Step 1: Volatility &amp; Correlation", v: "inputs" },
    { t: "Step 2: Random Numbers &amp; Correlated Shocks", v: "shocks" },
    { t: "Step 3: One Simulated Year", v: "year" },
    { t: "Step 4: Barrier &amp; Discounted Payoff", v: "barrier" },
    { t: `Step 5: ${fmt(XL.paths, 0)} Paths`, v: "fan" },
    { t: "Step 6: The Fair Value", v: "value" },
    { t: "Step 7: Checks &amp; Sensitivities", v: "checks" }
  ];
  const RES = XL.res;
  const VOL_PX = 165;                                        // bar height of a 50% volatility
  const WF_TOP = 1150;                                       // top of the waterfall, USD
  const wfBar = (cls, lo, hi, val, lab) => `<div class="${cls}"><span class="bar" style="bottom:${(lo / WF_TOP * 100).toFixed(1)}%;height:${((hi - lo) / WF_TOP * 100).toFixed(1)}%"><b>${val}</b></span><span class="lab">${lab}</span></div>`;
  const TOR = SENS.slice().sort(bySize), TOR_MAX = Math.abs(TOR[0].d);
  const VIS = {
    inputs: `<div class="xl-st-bars">${XM.sigma.map((s, k) => `<div><b style="color:var(${LIGHT[k]})">${Math.round(s * 100)}%</b><i style="height:${(s / 0.5 * VOL_PX).toFixed(0)}px;background:var(${DARK[k]})"></i></div>`).join("")}</div>
      <div class="xl-st-tk">${TK.map((t, k) => `<span style="color:var(${LIGHT[k]})">${t}</span>`).join("")}</div>`,
    shocks: `<div class="xl-st-cv"><canvas data-v="cloud"></canvas></div>`,
    year: `<div class="xl-st-cv"><canvas data-v="year"></canvas></div>`,
    barrier: `<div class="xl-st-cv"><canvas data-v="barrier"></canvas></div>`,
    fan: `<div class="xl-st-cv"><canvas data-v="fan"></canvas></div>`,
    value: `<div class="xl-st-wf">${wfBar("bond", 0, RES.bond, fmt(RES.bond, 0), "bond")}${wfBar("put", RES.fv, RES.bond, "−" + fmt(RES.put, 0), "put")}${wfBar("fv", 0, RES.fv, fmt(RES.fv, 0), "fair value")}</div>`,
    checks: `<div class="xl-st-tor">${TOR.map(s => `<span><i class="${s.d >= 0 ? "p" : "n"}${/^Vol /.test(s.lab) ? " v" : ""}" style="width:${(Math.abs(s.d) / TOR_MAX * 48).toFixed(1)}%"></i></span>`).join("")}</div>`
  };
  // the level labels (100%, 65%) right of the small charts: the charts leave room for the widest one
  const LVL_FONT = "16px " + U.F.body;
  const lvlRoom = ctx => { ctx.font = LVL_FONT; return ctx.measureText(pct(B.strike, 0)).width + 10; };
  // the small charts of steps 3 and 4: path 1, with the kick-in line and the two touches in step 4
  function miniYear(cv, barrier) {
    const c = cv && U.canvas(cv); if (!c) return;
    const { ctx, w, h } = c, f = { x: 2, y: 6, w: w - 2 - lvlRoom(ctx), h: h - 12 };
    const X = t => f.x + t / NDAY * f.w, Y = v => f.y + f.h - (v - YR_MIN) / (YR_MAX - YR_MIN) * f.h;
    const muted = U.css("--term-muted"), ink = U.css("--ink");
    hline(ctx, f.x, f.x + f.w, Y(1), muted, 1.5, [5, 4]);
    if (barrier) hline(ctx, f.x, f.x + f.w, Y(KI), ink, 2, [7, 4]);
    ctx.save(); ctx.lineJoin = "round"; ctx.lineWidth = 2;
    [1, 0, 2].forEach(k => {
      ctx.strokeStyle = U.css(DARK[k]); ctx.beginPath();
      for (let t = 0; t <= NDAY; t++) { const x = X(t), y = Y(LV[k][t]); t ? ctx.lineTo(x, y) : ctx.moveTo(x, y); }
      ctx.stroke();
    });
    ctx.restore();
    ctx.font = LVL_FONT; ctx.textBaseline = "middle"; ctx.textAlign = "left";
    ctx.fillStyle = muted; ctx.fillText(pct(B.strike, 0), f.x + f.w + 8, Y(1));
    if (!barrier) return;
    ctx.fillStyle = ink; ctx.fillText(KI_TXT, f.x + f.w + 8, Y(KI));
    // the touches: the first close at or below 65% (Microsoft on day 166, Adobe on day 243)
    ctx.strokeStyle = ink; ctx.lineWidth = 2.5;
    [2, 0].forEach(k => { const d = P1.kiDay[k]; if (d === null) return; ctx.beginPath(); ctx.arc(X(d), Y(LV[k][d]), 8, 0, 7); ctx.stroke(); });
  }
  // the fan of step 5: 2,000 simulated years of our model (own simulation with the Excel's inputs), the worst of the
  // three stocks each day. Simulated once, when the browser is idle or at the first draw (about 0.1 s)
  const FAN_SEED = 7, FAN_LO = 0.3, FAN_HI = 1.5;
  let FAN = null;
  const fanData = () => {
    if (FAN) return FAN;
    const norm = U.normal(U.rng(FAN_SEED)), n = NDAY + 1, fan = new Float32Array(XL.paths * n);
    for (let i = 0; i < XL.paths; i++) { const p = U.simBRC(norm).paths; for (let t = 0; t < n; t++) fan[i * n + t] = Math.min(p[0][t], p[1][t], p[2][t]); }
    return (FAN = fan);
  };
  function miniFan(cv) {
    const c = cv && U.canvas(cv); if (!c) return;
    const { ctx, w, h } = c, f = { x: 2, y: 4, w: w - 2 - lvlRoom(ctx), h: h - 8 }, n = NDAY + 1, fan = fanData();
    const X = t => f.x + t / NDAY * f.w, Y = v => f.y + f.h - (v - FAN_LO) / (FAN_HI - FAN_LO) * f.h;
    ctx.save(); ctx.beginPath(); ctx.rect(f.x, f.y, f.w, f.h); ctx.clip();
    ctx.strokeStyle = "rgba(31,59,45,.035)"; ctx.lineWidth = 1; ctx.lineJoin = "round";
    for (let i = 0; i < XL.paths; i++) {
      ctx.beginPath(); ctx.moveTo(X(0), Y(1));
      for (let t = 3; t < n; t += 3) ctx.lineTo(X(t), Y(fan[i * n + t]));
      ctx.lineTo(X(NDAY), Y(fan[i * n + NDAY])); ctx.stroke();
    }
    ctx.restore();
    const muted = U.css("--term-muted"), ink = U.css("--ink");
    hline(ctx, f.x, f.x + f.w, Y(1), muted, 1.5, [5, 4]);
    hline(ctx, f.x, f.x + f.w, Y(KI), ink, 2, [7, 4]);
    ctx.font = LVL_FONT; ctx.textBaseline = "middle"; ctx.textAlign = "left";
    ctx.fillStyle = muted; ctx.fillText(pct(B.strike, 0), f.x + f.w + 8, Y(1));
    ctx.fillStyle = ink; ctx.fillText(KI_TXT, f.x + f.w + 8, Y(KI));
  }
  // the cloud of step 2: Adobe's and Microsoft's correlated shocks on 1,000 days (the lower cloud of xl-corr)
  const Z_MSFT = mixY(2, 1);
  function miniCloud(cv) {
    const c = cv && U.canvas(cv); if (!c) return;
    const { ctx, w, h } = c, s = Math.min(w, h) - 2, LIM = 3.6, f = { x: (w - s) / 2, y: (h - s) / 2, w: s, h: s };
    const X = v => f.x + (v + LIM) / (2 * LIM) * f.w, Y = v => f.y + f.h - (v + LIM) / (2 * LIM) * f.h;
    ctx.strokeStyle = U.css("--term-line"); ctx.lineWidth = 1;
    ctx.strokeRect(f.x + .5, f.y + .5, f.w - 1, f.h - 1);
    ctx.beginPath(); ctx.moveTo(X(0), f.y); ctx.lineTo(X(0), f.y + f.h); ctx.moveTo(f.x, Y(0)); ctx.lineTo(f.x + f.w, Y(0)); ctx.stroke();
    ctx.save(); ctx.beginPath(); ctx.rect(f.x, f.y, f.w, f.h); ctx.clip();
    ctx.fillStyle = U.css("--term-text"); ctx.globalAlpha = .45;
    for (let i = 0; i < NC; i++) ctx.fillRect(X(CE[0][i]) - 1.1, Y(Z_MSFT[i]) - 1.1, 2.2, 2.2);
    ctx.globalAlpha = 1; ctx.setLineDash([6, 4]); ctx.strokeStyle = U.css("--green"); ctx.lineWidth = 2.2;
    ctx.beginPath(); ctx.moveTo(X(-LIM), Y(-LIM * M.r13)); ctx.lineTo(X(LIM), Y(LIM * M.r13)); ctx.stroke();
    ctx.restore();
  }

  Deck.addSlide({
    id: "brc-steps", section: "excel", steps: 1, secs: 44, liveSecs: 38,
    title: "Pricing the Multi-BRC in seven steps",
    subtitle: "Our plan for the Excel model, from the market data to the fair value",
    sources: "Arnold (2026), slide 15; own simulation",
    // on entry only the box (bond − put, the simulation in three moves); one click brings in the seven steps. Then live
    // Excel: the workbook's Read Me and sheet tabs (the template, assignment 2a; until 27 Oct 2026 a slide of its own).
    // liveSecs = that narration (84 words) / 145 × 60 + 3 s for the Excel screen
    notes: "Before we open Excel, here is the plan. Our product is a bond minus a put. The bond is easy. The hard part is the put. To price it, we simulate the three stocks over the next year, day by day. On each path, we ask: did any stock touch its barrier? And if so, what does the put pay at the end? We do this two thousand times, take the average and discount it to today. "
      + "[→] For the simulation we need two inputs: how much each stock moves, its volatility, and how the stocks move together, their correlation. At the end, we check our results. "
      + "[Excel: the workbook: the Read Me, then the sheet tabs block by block, with the colour legend (yellow inputs, grey random numbers, white calculated)] "
      + "Our template has twelve sheets: a Read Me, then five blocks. "
      + "Sheets one and two hold the product terms and the Bloomberg market data of the sixth of October. "
      + "Sheets three to six turn price history and option quotes into volatilities and correlations. "
      + "Sheet seven holds the fixed random numbers, eight and nine are the engine, ten and eleven the results. "
      + "Yellow cells are inputs, grey cells the random numbers, white cells are calculated. Change a yellow cell, press F9, and the price updates.",
    render(body) {
      body.innerHTML = `
        <div class="xl-st">
          <div class="fbox xl-st-head xl-st-in" style="--k:0"><span class="chip">RECAP</span>
            <div class="xl-st-eq"><math><mtext>fair value</mtext><mo>=</mo><mtext>bond</mtext><mo>−</mo><mtext class="xl-st-put">put</mtext></math>
              <span class="sep"></span><span class="xl-st-only">only the <span class="hl">put</span> needs a simulation</span></div>
            <ol class="xl-st-flow">${FLOW.map((f, i) => `<li class="xl-st-in" style="--k:${i + 1}"><span class="xl-st-ic">${f.ic}</span><b>${f.t}</b>${f.k ? `<span>${f.k}</span>` : ""}</li>`).join("")}</ol></div>
          <ol class="xl-st-list" data-step="1">${STEPS.map((s, i) => `
            <li class="xl-st-c xl-st-in" style="--k:${i}">
              <div class="xl-st-top"><span class="num">${i + 1}</span></div>
              <p class="xl-st-t">${s.t}</p>
              <div class="xl-st-v">${VIS[s.v]}</div></li>`).join("")}
          </ol>
        </div>`;
      const root = body.querySelector(".xl-st"), cv = {};
      body.querySelectorAll("canvas[data-v]").forEach(c => { cv[c.dataset.v] = c; });
      const draw = () => { miniCloud(cv.cloud); miniYear(cv.year, false); miniYear(cv.barrier, true); miniFan(cv.fan); };
      if (window.requestIdleCallback) window.requestIdleCallback(() => fanData()); else setTimeout(fanData, 600);
      // the box builds in on entry; the click only brings in the cards (data-step), so the box doesn't replay
      return { step(i, o) { if (!i || !root.classList.contains("on")) replay(root, "on", o); }, resize() { draw(); } };
    }
  });

  // ================= 2) xl-input: step 1, the missing input =================
  // Black-Scholes as on Lecture 4, slide 7 (redrawn); the inputs carry classes so they can light up
  const vS = `<msub class="xl-in-v k-S"><mi>S</mi><mn>0</mn></msub>`, vK = `<mi class="xl-in-v k-K">K</mi>`;
  const vT = `<mi class="xl-in-v k-T">T</mi>`, vr = `<mi class="xl-in-v k-r">r</mi>`, vs = `<mi class="xl-in-v k-s">σ</mi>`;
  const N_ = d => `<mi>N</mi><mo stretchy="false">(</mo><msub><mi>d</mi><mn>${d}</mn></msub><mo stretchy="false">)</mo>`;
  const DISC = `${vK}<msup><mi>e</mi><mrow><mo>−</mo>${vr}${vT}</mrow></msup>`;
  const BS_C = `<math display="block"><msub><mi>C</mi><mn>0</mn></msub><mo>=</mo>${vS}${N_(1)}<mo>−</mo>${DISC}${N_(2)}</math>`;
  const BS_P = `<math display="block"><msub><mi>P</mi><mn>0</mn></msub><mo>=</mo>${DISC}<mrow><mo>(</mo><mn>1</mn><mo>−</mo>${N_(2)}<mo>)</mo></mrow><mo>−</mo>${vS}<mrow><mo>(</mo><mn>1</mn><mo>−</mo>${N_(1)}<mo>)</mo></mrow></math>`;
  const BS_D1 = `<math display="block"><msub><mi>d</mi><mn>1</mn></msub><mo>=</mo><mfrac><mrow><mi>ln</mi><mrow><mo>(</mo><mfrac>${vS}${vK}</mfrac><mo>)</mo></mrow><mo>+</mo><mrow><mo>(</mo>${vr}<mo>+</mo><mfrac><msup>${vs}<mn>2</mn></msup><mn>2</mn></mfrac><mo>)</mo></mrow>${vT}</mrow><mrow>${vs}<msqrt>${vT}</msqrt></mrow></mfrac></math>`;
  const BS_D2 = `<math display="block"><msub><mi>d</mi><mn>2</mn></msub><mo>=</mo><msub><mi>d</mi><mn>1</mn></msub><mo>−</mo>${vs}<msqrt>${vT}</msqrt></math>`;
  // not in XL: the options' time to expiry τ, sheet 5 C13 = (C11 − PricingDate)/365 = (17 Sep 2027 − 6 Oct 2026)/365
  // = 0.9479 years (C11 = the listed expiry closest to the redemption date, 6 Oct 2027)
  const TAU = 346 / 365;
  const IN_ROWS = [
    { k: "S", sym: `<msub><mi>S</mi><mn>0</mn></msub>`, lab: "stock price today, USD",
      val: `<span class="xl-in-px">${XL.S0.map((v, j) => `<span style="color:var(${LIGHT[j]})"><b>${TK[j]}</b>${fmt(v, 2)}</span>`).join("")}</span>` },
    // sheet 6 fits σ to the quoted options of sheet 5, each with its own strike and the same time to expiry τ
    { k: "K", sym: "<mi>K</mi>", lab: "strike", val: `each quoted option's strike <small>(sheet 5)</small>` },
    { k: "T", sym: "<mi>T</mi>", lab: "maturity", val: `≈ ${fmt(TAU, 2)} years: <small>the listed expiry closest to redemption (sheet 5)</small>` },
    // the workbook's own source for r (sheet 2, B18 and D18)
    { k: "r", sym: "<mi>r</mi>", lab: "risk-free rate", val: `${pct(XM.r, 2)} <small>· USD 1-year risk-free rate (${XL.data})</small>` },
    { k: "s", sym: "<mi>σ</mi>", lab: "volatility", val: `? <small>from option prices (sheets 5 and 6)</small>`, miss: true }
  ];
  const ARROW = '<svg class="xl-in-ar" viewBox="0 0 42 20" aria-hidden="true"><path d="M2 10h36M30 3l8 7-8 7"/></svg>';

  Deck.addSlide({
    id: "xl-input", section: "excel", steps: 2, secs: 13, liveSecs: 45,
    title: STEPS[0].t,
    subtitle: "Black-Scholes needs five inputs, and we know four of them",
    lecture: "Lecture 4, slide 7",
    sources: "Arnold (2026), slide 7; Black & Scholes (1973); Bloomberg",
    // live Excel follows (sheets 5, 6 and 4): liveSecs = its narration (94 words) / 145 × 60 + 3 s per Excel screen (two)
    notes: "Step one: volatility. Remember the Black-Scholes formula. "
      + "[→] We know almost every input: the stock price, the strike, the maturity and the interest rate. "
      + "[→] Only the volatility is missing. "
      + "[Excel: sheet 5 (option quotes), then the result table of sheet 6 with the three implied volatilities highlighted] "
      + "So we turn the formula around. The market tells us the option prices, and we look for the volatility that fits them best: the implied volatility. Sheet six does this with fifty options per stock. So Black-Scholes can't price our product, but it still finds a missing piece: 45 percent for Adobe, 28 for Apple and 32 for Microsoft. Adobe moves the most, by far. "
      + "[Excel: sheet 4, correlation matrix] "
      + "For the correlation of our three stocks, there's no market price, so sheet four measures it from one year of daily returns. Adobe and Microsoft move together the most.",
    render(body) {
      body.innerHTML = `
        <div class="xl-in">
          <div class="xl-in-l">
            <p class="label">Black-Scholes(-Merton) formula for European options</p>
            <div class="fbox"><span class="chip">CALL</span>${BS_C}</div>
            <div class="fbox orange"><span class="chip orange">PUT</span>${BS_P}</div>
            <div class="xl-in-d"><div class="fbox gray">${BS_D1}</div><div class="fbox gray">${BS_D2}</div></div>
            <div class="xl-in-new">
              <div class="xl-in-iv" data-step="2"><div class="xl-in-flow"><span class="xl-in-nd">option price</span>${ARROW}<span class="xl-in-nd bs">Black-Scholes backwards</span>${ARROW}<span class="xl-in-nd sg"><math><mi>σ</mi></math></span></div>
                <p class="xl-in-cap">implied volatility · ${fmt(XL.quotes / 3, 0)} options per stock (sheet 6)</p></div>
              <p class="xl-in-key" data-step="2" style="--d:3">Black-Scholes can’t price our product, but it finds the missing piece.</p>
            </div>
          </div>
          <section class="panel xl-in-p">
            <h3 class="panel-title">The five inputs</h3>
            ${IN_ROWS.map(r => `<div class="xl-in-row k-${r.k}">
              <span class="xl-in-sym"><math>${r.sym}</math></span>
              <div><div class="xl-in-lab">${r.lab}</div><div class="xl-in-val">${r.val}</div></div>
              <span class="xl-tag${r.miss ? " mis" : ""}">${r.miss ? "missing" : "known"}</span></div>`).join("")}
          </section>
        </div>`;
      const root = body.querySelector(".xl-in");
      return {
        step(i) { root.classList.toggle("s1", i >= 1); root.classList.toggle("s2", i >= 2); },
        resize() { U.tightenRoots(body); }
      };
    }
  });

  // ================= 3) xl-gbm: step 2, simulating a stock =================
  // the lecture's model (Lecture 4, slide 15): S(t+Δt) = S(t) + Drift + Shock, written with r and q as in our Excel
  // (the lecture writes r_f and δ: a footnote on the drift card)
  const S_t = sub("S", "<mi>t</mi>");
  const GBM_TOP = `<math display="block">${sub("S", `<mrow><mi>t</mi><mo>+</mo>${DT}</mrow>`)}<mo>=</mo>${S_t}<mo>+</mo><mtext class="xl-gb-w dr">Drift</mtext><mo>+</mo><mtext class="xl-gb-w sh">Shock</mtext></math>`;
  const GBM_DR = `<math><mo stretchy="false">(</mo><mi>r</mi><mo>−</mo><mi>q</mi><mo stretchy="false">)</mo><mo>·</mo>${S_t}<mo>·</mo>${DT}</math>`;
  const GBM_SH = `<math><mi>σ</mi><mo>·</mo>${S_t}<mo>·</mo><msqrt>${DT}</msqrt><mo>·</mo><mi class="xl-gb-z">Z</mi></math>`;
  const withTk = (xs, f) => xs.map((v, k) => `${TK[k]} ${f(v)}`).join(" · ");
  const Q_TXT = withTk(XM.q, v => fmt(v * 100, 2).replace(/\.00$/, "")) + "%";   // ADBE 0 · AAPL 0.32 · MSFT 0.73%
  const SIG_TXT = withTk(XM.sigma, v => Math.round(v * 100)) + "%";              // ADBE 45 · AAPL 28 · MSFT 32%
  const Z0 = P1.rows[0].eps[0];                                  // the first random number of path 1 (Adobe, day 1): 0.3047
  // a bell curve (standard normal density) with the draw Z0 dropped onto it; own drawing
  const BELL = (() => {
    const W = 520, H = 176, x0 = 20, x1 = W - 20, base = 138, top = 26, zmax = 3.4;
    const X = z => x0 + (z + zmax) / (2 * zmax) * (x1 - x0), Y = z => base - Math.exp(-z * z / 2) * (base - top);
    const pts = []; for (let j = 0; j <= 120; j++) { const z = -zmax + 2 * zmax * j / 120; pts.push(X(z).toFixed(1) + "," + Y(z).toFixed(1)); }
    const zx = X(Z0), zy = Y(Z0);
    const ticks = [-3, -2, -1, 0, 1, 2, 3].map(z => `<line x1="${X(z)}" x2="${X(z)}" y1="${base}" y2="${base + 7}" stroke="#8E9592" stroke-width="1.5"/><text x="${X(z)}" y="${base + 30}" text-anchor="middle" style="font:21px Arial;fill:#6B716E">${z < 0 ? "−" + -z : z}</text>`).join("");
    return `<svg class="xl-gb-bell" viewBox="0 0 ${W} ${H}" aria-hidden="true">
      <polygon points="${X(-zmax)},${base} ${pts.join(" ")} ${X(zmax)},${base}" fill="#CFE6D6" opacity=".7"/>
      <polyline points="${pts.join(" ")}" fill="none" stroke="#1F3B2D" stroke-width="3" stroke-linejoin="round"/>
      <line x1="${x0}" x2="${x1}" y1="${base}" y2="${base}" stroke="#8E9592" stroke-width="1.5"/>${ticks}
      <g class="xl-gb-drop"><line x1="${zx}" x2="${zx}" y1="${zy}" y2="${base}" stroke="#00802F" stroke-width="3" stroke-dasharray="6 5"/>
        <circle cx="${zx}" cy="${zy}" r="10" fill="#00802F" stroke="#fff" stroke-width="3"/>
        <text x="${zx + 18}" y="${zy - 10}" style="font:700 25px Arial;fill:#00802F">Z = ${fmt(Z0, 2)}</text></g>
    </svg>`;
  })();
  // one time step as a picture: today's price, plus the drift (dark green), plus the shock (HSG green); own illustration,
  // not to scale. Drawn at the panel's own size (560 × 220), so its text keeps its pixel size
  const STEP_SVG = (() => {
    const xa = 92, xb = 330, y0 = 126, y1 = 90, y2 = 32, yd = 164, base = 184;
    const head = (x, y, dir, col) => `<polygon points="${x},${y} ${x - 9},${y + dir * 16} ${x + 9},${y + dir * 16}" fill="${col}"/>`;
    const dark = "#1F3B2D", green = "#00802F", ink = "#1A1D1B";
    const lab = (x, y, t, st) => `<text x="${x}" y="${y}" style="${st}">${t}</text>`;
    const S = (x, y, sub, anchor) => `<text x="${x}" y="${y}" text-anchor="${anchor || "start"}" style="font:italic 32px 'STIX Two Math',Cambria,serif;fill:${ink}">S<tspan dy="8" style="font-size:22px">${sub}</tspan></text>`;
    return `<svg viewBox="0 0 560 220" aria-hidden="true">
      <line x1="30" x2="540" y1="${base}" y2="${base}" stroke="#8E9592" stroke-width="1.5"/>
      ${[[xa, "t"], [xb, "t + Δt"]].map(([x, t]) => `<line x1="${x}" x2="${x}" y1="${base}" y2="${base + 8}" stroke="#8E9592" stroke-width="1.5"/>${lab(x, base + 30, t, "font:italic 24px 'STIX Two Math',Cambria,serif;fill:#4E5552;text-anchor:middle")}`).join("")}
      <line x1="${xa}" x2="${xb}" y1="${y0}" y2="${y0}" stroke="#8E9592" stroke-width="2" stroke-dasharray="6 6"/>
      <circle cx="${xa}" cy="${y0}" r="9" fill="${ink}"/>${S(xa - 22, y0 + 10, "t", "end")}
      <g class="p dr"><line x1="${xb}" x2="${xb}" y1="${y0}" y2="${y1 + 14}" stroke="${dark}" stroke-width="5"/>${head(xb, y1, 1, dark)}
        ${lab(xb + 20, (y0 + y1) / 2 + 9, "Drift", `font:700 25px Arial;fill:${dark}`)}</g>
      <g class="p sh"><line x1="${xb}" x2="${xb}" y1="${y1}" y2="${y2 + 14}" stroke="${green}" stroke-width="5"/>${head(xb, y2, 1, green)}
        ${lab(xb + 20, (y1 + y2) / 2 + 9, "Shock", `font:700 25px Arial;fill:${green}`)}
        <line x1="${xa}" x2="${xb}" y1="${y0}" y2="${y2}" stroke="${ink}" stroke-width="3"/><circle cx="${xb}" cy="${y2}" r="9" fill="${ink}"/>${S(xb - 22, y2 - 6, "t+Δt", "end")}</g>
      <g class="p zz"><line x1="${xb - 28}" x2="${xb - 28}" y1="${y1}" y2="${yd - 14}" stroke="${green}" stroke-width="3" stroke-dasharray="6 5"/>${head(xb - 28, yd, -1, green)}
        ${lab(xb - 44, yd - 2, "or down: Z decides", `font:22px Arial;fill:${green};text-anchor:end`)}</g>
      ${lab(548, 16, "not to scale", "font:18px Arial;fill:#8E9592;text-anchor:end")}
    </svg>`;
  })();

  Deck.addSlide({
    id: "xl-gbm", section: "excel", steps: 3, secs: 28, liveSecs: 25,
    title: STEPS[1].t,
    subtitle: "The lecture's geometric Brownian motion, one small time step at a time",
    sources: "Arnold (2026), slides 11 and 15; own illustration",
    // live Excel follows (sheet 7): liveSecs = its narration (54 words) / 145 × 60 + 3 s for the one Excel screen
    notes: "Step two: how do we simulate a stock? With the lecture's geometric Brownian motion: tomorrow's price is today's price, plus a drift, plus a random shock. "
      + "[→] The drift is the risk-free rate minus the dividend yield; that's risk-neutral valuation, so we never need the stocks' expected returns. "
      + "[→] The shock depends on the volatility "
      + "[→] and on Z, a random number from a bell curve. "
      + "[Excel: sheet 7, the grey cells; keep the pointer off cell B4 until its note is corrected] "
      + "We need one bell-curve number for every stock, every day and every path: about one and a half million. We generated them once, in Python, and pasted them in as fixed values. In Excel, you'd use NORM.S.INV of RAND, then Paste Special, Values. Why fixed? So the price doesn't change every time Excel recalculates.",
    render(body) {
      body.innerHTML = `
        <div class="xl-gb">
          <div class="xl-gb-row">
            <div class="fbox xl-gb-top"><span class="chip">GBM IN DISCRETE TIME STEPS</span>${GBM_TOP}
              <p><math>${DT}<mo>=</mo><mi>T</mi><mo>/</mo><mi>N</mi><mo>=</mo><mn>1</mn><mo>/</mo><mn>${NDAY}</mn></math>: one trading day</p></div>
            <section class="panel xl-gb-sv"><h3 class="panel-title">One time step</h3>${STEP_SVG}</section>
          </div>
          <div class="xl-gb-cards">
            <div class="xl-gb-c dr"><p class="xl-gb-h"><span class="num">1</span>Drift (risk-neutral)</p>
              <div class="xl-gb-b"><div class="xl-gb-f">${GBM_DR}</div>
                <p class="xl-gb-fn">lecture: <math>${sub("r", "<mi>f</mi>")}</math> and <math><mi>δ</mi></math></p>
                <p>risk-free rate minus dividend yield: <b style="white-space:nowrap">risk-neutral</b>, no expected returns needed</p>
                <p class="m">our Excel: <math><mi>r</mi></math> = ${pct(XM.r, 2)},<br><math><mi>q</mi></math> = ${Q_TXT}</p></div></div>
            <div class="xl-gb-c sh"><p class="xl-gb-h"><span class="num">2</span>Random shock</p>
              <div class="xl-gb-b"><div class="xl-gb-f">${GBM_SH}</div>
                <p>its size depends on the <b>volatility</b> <math><mi>σ</mi></math></p>
                <p class="m">our Excel (step 1):<br><math><mi>σ</mi></math> = ${SIG_TXT}<br><math><msqrt>${DT}</msqrt></math>: the variance grows with time</p></div></div>
            <div class="xl-gb-c zz"><p class="xl-gb-h"><span class="num">3</span><math><mi>Z</mi><mo>∼</mo><mi>𝒩</mi><mo stretchy="false">(</mo><mn>0</mn><mo>,</mo><mn>1</mn><mo stretchy="false">)</mo></math></p>
              <div class="xl-gb-b"><p>a random number from a <b>bell curve</b></p>${BELL}
                <p class="m">path 1, day 1, Adobe: <math><mi>Z</mi></math> = ${fmt(Z0, 4)}</p></div></div>
          </div>
          <div class="xl-gb-strip" data-step="3">
            <span>One <math><mi>Z</mi></math> per stock × day × path: 3 × ${NDAY} × ${fmt(XL.paths, 0)} ≈ ${fmt(MIO, 1)} million</span>
            <span><code>=NORM.S.INV(RAND())</code> → Paste as values</span>
            <span>“So the prices don’t change every time Excel recalculates.”</span>
          </div>
        </div>`;
      const root = body.querySelector(".xl-gb"), cards = [...body.querySelectorAll(".xl-gb-c")];
      return {
        step(i) {
          ["s1", "s2", "s3"].forEach((c, k) => root.classList.toggle(c, i >= k + 1));
          cards.forEach((c, k) => c.classList.toggle("on", i >= k + 1));
        },
        resize() { U.tightenRoots(body); }
      };
    }
  });

  // ================= 4) xl-corr: step 2, correlated shocks =================
  // Cholesky mixing weights of sheet 4, step D (XL.mix), two decimals on screen
  const zL = k => `<msub><mi style="color:var(${LIGHT[k]})">Z</mi><mtext style="color:var(${LIGHT[k]})">${TK[k]}</mtext></msub>`;
  const eps = j => `<msub><mi>ε</mi><mn>${j}</mn></msub>`;
  const kk = (x, hi) => `<mn${hi ? ' class="xl-co-k"' : ""}>${f2(x)}</mn>`;
  const CO_ROWS = [
    { rhs: eps(1), note: "keeps its own random number" },
    { rhs: `${kk(M.r12, 1)}<mo>·</mo>${eps(1)}<mo>+</mo>${kk(M.s12, 1)}<mo>·</mo>${eps(2)}`,
      note: `<b>${f2(M.r12)}</b> = their correlation · <b>${f2(M.s12)}</b> = <math><msqrt><mn>1</mn><mo>−</mo><msup><mn>${f2(M.r12)}</mn><mn>2</mn></msup></msqrt></math>` },
    { rhs: `${kk(M.r13, 1)}<mo>·</mo>${eps(1)}<mo>+</mo>${kk(M.r23s, 1)}<mo>·</mo>${eps(2)}<mo>+</mo>${kk(M.r33s, 1)}<mo>·</mo>${eps(3)}`,
      note: `mixes all three: correlation <b>${f2(XM.rho[0][2])}</b> with Adobe, <b>${f2(XM.rho[1][2])}</b> with Apple` }
  ];

  Deck.addSlide({
    id: "xl-corr", section: "excel", steps: 2, secs: 24, liveSecs: 8,
    title: STEPS[1].t,
    subtitle: "Our stocks don’t move independently, so we mix the random numbers",
    sources: "own simulation",
    // live Excel follows (sheets 4 and 8, no narration): liveSecs = the owner's value for its screen changes (fix round 1)
    notes: "But these numbers are independent, and our stocks are not. So we mix them, with the Cholesky method. Adobe keeps its own random number. "
      + "[→] Apple takes 0.22 of Adobe's, exactly their correlation, plus 0.98 of its own. "
      + "[→] Microsoft mixes all three. Now our simulated stocks move together just like the real ones. "
      + "[Excel: the same numbers in sheet 4, step D (cells C37 and C40), and in sheet 8, cells E35 and C40, which the formula in cell H49 uses]",
    render(body) {
      body.innerHTML = `
        <div class="xl-co">
          <div class="xl-co-l">
            <div class="card xl-co-intro"><math>${eps(1)}<mo>,</mo>${eps(2)}<mo>,</mo>${eps(3)}</math>: three <b>independent</b> random numbers a day, from sheet 7</div>
            <div class="fbox xl-co-box"><span class="chip">CHOLESKY: MIX THE RANDOM NUMBERS</span>
              ${CO_ROWS.map((r, k) => `<div class="xl-co-row" style="border-left-color:var(${LIGHT[k]})">
                <div class="xl-co-eq"><math>${zL(k)}</math><math><mo>=</mo></math><math>${r.rhs}</math></div>
                <p class="xl-co-n">${r.note}</p></div>`).join("")}
              <span class="xlref">Excel · sheet 4, step D · sheet 8, H49</span>
            </div>
          </div>
          ${U.term({ fn: "CORR", title: `${fmt(NC, 0)} SIMULATED DAYS`, meta: "OWN SIMULATION", body: "<div><canvas></canvas></div><div><canvas></canvas></div>",
            stats: `<div class="xl-co-am" data-step="2"><b class="pr">${TK[1]} vs ${TK[2]}</b> · CORRELATION <b class="rv" data-am>${rhoTxt(RHO_AM)}</b> · TARGET ${f2(XM.rho[1][2])}</div>` })}
        </div>`;
      const rows = [...body.querySelectorAll(".xl-co-row")], cvs = [...body.querySelectorAll("canvas")], am = body.querySelector("[data-am]");
      const st = [0, 0];                                       // mixing share of the Apple and the Microsoft cloud
      let a = null, target = [0, 0];
      function plot(j) {
        const c = U.canvas(cvs[j]); if (!c) return;
        const { ctx, w, h } = c, k = j + 1, m = st[j], y = mixY(k, m), LIM = 3.6;
        const size = Math.min(h - 84, w - 250), f = { x: 96, y: 22, w: size, h: size };
        const ax = U.axes(ctx, f, { xMin: -LIM, xMax: LIM, yMin: -LIM, yMax: LIM, yTicks: [-3, 0, 3], xTicks: [-3, 0, 3], yFmt: v => v < 0 ? "−" + -v : String(v), xFmt: v => v < 0 ? "−" + -v : String(v) });
        ctx.save();
        ctx.strokeStyle = U.css("--term-line"); ctx.lineWidth = 1;
        [-3, 0, 3].forEach(v => { const x = Math.round(ax.X(v)) + .5; ctx.beginPath(); ctx.moveTo(x, f.y); ctx.lineTo(x, f.y + f.h); ctx.stroke(); });
        ctx.beginPath(); ctx.rect(f.x, f.y, f.w, f.h); ctx.clip();
        ctx.fillStyle = U.css("--term-text"); ctx.globalAlpha = .55;
        for (let i = 0; i < NC; i++) ctx.fillRect(ax.X(CE[0][i]) - 1.6, ax.Y(y[i]) - 1.6, 3.2, 3.2);
        ctx.globalAlpha = 1;
        const rho = m * (k === 1 ? M.r12 : M.r13);             // the slope of y on ε1 = its correlation with Adobe
        ctx.setLineDash([10, 8]); ctx.strokeStyle = U.css("--amber"); ctx.lineWidth = 3;
        ctx.beginPath(); ctx.moveTo(ax.X(-LIM), ax.Y(-LIM * rho)); ctx.lineTo(ax.X(LIM), ax.Y(LIM * rho)); ctx.stroke();
        ctx.restore();
        // axis titles in the stock colours
        ctx.font = "700 17px " + U.F.mono; ctx.textAlign = "center"; ctx.textBaseline = "top";
        ctx.fillStyle = U.css(LIGHT[0]); ctx.fillText("Z ADBE", f.x + f.w / 2, f.y + f.h + 34);
        ctx.save(); ctx.translate(f.x - 62, f.y + f.h / 2); ctx.rotate(-Math.PI / 2); ctx.textBaseline = "middle";
        ctx.fillStyle = U.css(LIGHT[k]); ctx.fillText((m > 0 ? "Z " : "ε ") + TK[k], 0, 0); ctx.restore();
        // the read-out on the right (the pair, its correlation and the target)
        const rx = f.x + f.w + 34;
        ctx.textAlign = "left"; ctx.textBaseline = "alphabetic";
        ctx.font = "700 20px " + U.F.mono; ctx.fillStyle = U.css(LIGHT[k]); ctx.fillText(`ADBE vs ${TK[k]}`, rx, f.y + 30);
        // the state under the pair label before and during the mix; no "MIXED" label after it (the group's feedback, 27 Oct 2026)
        ctx.font = "500 17px " + U.F.mono; ctx.fillStyle = U.css("--term-muted");
        if (m < 1) ctx.fillText(m > 0 ? "MIXING…" : "INDEPENDENT", rx, f.y + 58);
        ctx.fillText("CORRELATION", rx, f.y + 118);
        const r = m >= 1 ? RHO_MEAS[j] : corr(CE[0], y);
        ctx.font = "700 44px " + U.F.mono; ctx.fillStyle = U.css("--amber"); ctx.fillText(rhoTxt(r), rx, f.y + 166);
        ctx.font = "500 17px " + U.F.mono; ctx.fillStyle = U.css("--term-muted"); ctx.fillText(`TARGET ${f2(m > 0 ? XM.rho[0][k] : 0)}`, rx, f.y + 196);
      }
      // Apple vs Microsoft from the same days (shown from step 2, when Microsoft is mixed)
      const pair = () => { am.textContent = rhoTxt(st[0] >= 1 && st[1] >= 1 ? RHO_AM : corr(mixY(1, st[0]), mixY(2, st[1]))); };
      const draw = () => { plot(0); plot(1); pair(); };
      return {
        step(i, o) {
          if (a) { a.cancel(); a = null; }
          rows.forEach((r, k) => { r.classList.toggle("ghost", k > i); r.classList.toggle("cur", k === i); r.classList.toggle("done", k < i); });
          target = [i >= 1 ? 1 : 0, i >= 2 ? 1 : 0];
          const j = i - 1;
          if (!o.instant && j >= 0 && st[j] < 1 && target[j] === 1) {
            a = U.anim(1600, e => { st[0] = j === 0 ? e : target[0]; st[1] = j === 1 ? e : target[1]; draw(); }, { ease: U.ease.inOut });
            return;
          }
          st[0] = target[0]; st[1] = target[1]; draw();
        },
        resize() { U.tightenRoots(body); draw(); },
        // leaving in the middle of a mix (scroll mode, fast clicking) ends it, so a return shows the step's end state
        leave() { if (a) { a.cancel(); a = null; st[0] = target[0]; st[1] = target[1]; draw(); } }
      };
    }
  });

  // ================= 5) xl-year: step 3, one simulated year =================
  // the engine's formula as in sheet 8, cell K49, the first engine cell (=K48*EXP(C$30+C$31*G49)); Z = the correlated
  // shock of step 2, EXP instead of the lecture's simple plus
  const GBM_XL = `<math display="block"><mi>S</mi><mo stretchy="false">(</mo><mi>t</mi><mo stretchy="false">)</mo><mo>=</mo><mi>S</mi><mo stretchy="false">(</mo><mi>t</mi><mo>−</mo><mn>1</mn><mo stretchy="false">)</mo><mo>×</mo><mi mathvariant="normal" class="xl-yr-h e">EXP</mi><mrow><mo>(</mo><mrow><mo>(</mo><mi>r</mi><mo>−</mo><mi>q</mi><mrow class="xl-yr-h e"><mo form="infix">−</mo><msup><mi>σ</mi><mn>2</mn></msup><mo>/</mo><mn>2</mn></mrow><mo>)</mo></mrow><mo>·</mo>${DT}<mo>+</mo><mi>σ</mi><mo>·</mo><msqrt>${DT}</msqrt><mo>·</mo><mi class="xl-yr-h z">Z</mi><mo>)</mo></mrow></math>`;

  Deck.addSlide({
    id: "xl-year", section: "excel", steps: 3, secs: 35, liveSecs: 153,
    title: STEPS[2].t,
    subtitle: `Sheet 8 copies the step down ${NDAY} trading days, for all three stocks`,
    lecture: "Lecture 4, slide 15",
    sources: "Arnold (2026), slide 15",
    // live Excel: the K49 shot between clicks 2 and 3, and after this slide all of 5.5–5.8 up to the engine checks
    // (sheets 8, 9, 10 and 11). liveSecs = that narration / 145 × 60 + 3 s per Excel screen (the owner's value, fix round 1)
    notes: "Step three: one simulated year. Sheet eight is the engine: each row is one trading day, and each cell uses this formula, "
      + "[→] with the correlated shock from step two. "
      + "[→] It uses an exponential instead of the lecture's simple plus, so a price can never become negative. And because we exponentiate, we subtract half the variance from the drift, so the average stock still grows at the risk-free rate minus the dividend yield. "
      + "[Excel: sheet 8, click K49 so the formula shows; keep row 5 off screen] "
      + "[→] Copy it down 252 rows, and we have one possible year. "
      + "[Excel: sheet 8, rows 306–325; highlight MIN, IF, MIN/MATCH, payoff and discount in turn] "
      + "Step four: what does this year pay? MIN finds each stock's lowest price, and IF checks whether it touched the barrier. MIN and MATCH find the worst stock at the end. After a touch, if that stock ends below its start, the put pays what the investor loses: a thousand dollars minus the value of the shares, discounted to today. "
      + "[Excel: path 1 (sheet 9, cell F6 = 1; sheet 8 updates at once, no F9 needed); sheet 8, rows 306–325] "
      + "Here's path one. Adobe and Microsoft both touch their barriers, and Microsoft ends worst, down 42 percent. So the investor gets Microsoft shares worth 577 dollars, and the put pays the difference: 423 dollars, or 404 in today's money. "
      + "[Excel: path 2,000 (sheet 9, cell F6 = 2000); sheet 8, rows 306–325, with the caption \"Adobe: kick-in 154.91 (C24) · lowest price 156.34 (C306)\"] "
      + "Now path two thousand. Microsoft is down almost a third, but no barrier is touched. Adobe misses by less than two dollars! So the put pays nothing, and the investor gets the full thousand back. "
      + "[Excel: sheet 9; Data → What-If Analysis → Data Table, column input cell F6. Recording note: data tables only recalculate with F9, and only in desktop Excel.] "
      + "Step five: one path is one roll of the dice. To get two thousand, we use an Excel data table: one copy of the engine, with the path number as the input cell. Excel runs it once for every path. "
      + "[Excel: sheet 10 from top to bottom: bond → put → fair value → fair coupon; then sheet 11, cell F26, the put's standard error of 4.58 dollars, with the caption \"95%: ± 1.96 × 4.58 ≈ ± 9\"] "
      + "Step six: the price. The bond pays two coupons and the thousand. Discounted at the risk-free rate plus a spread for UBS's default risk, it's worth 1,097 dollars. The put is the average of the two thousand discounted payoffs: 173 dollars. Bond minus put: the product is worth about 925 dollars, give or take nine at ninety-five percent confidence. But the investor pays 1,000, so the bank keeps about seven and a half percent. A fair coupon would be almost 23 percent, not 15. "
      + "[Excel: sheet 11, the engine-check rows (scenarios 10 and 11); next to them, the average of sheet 9, column D (select D13:D2012 and read the average in the status bar)] "
      + "Step seven: can we trust the engine? We test two extreme cases. With the barrier at zero, it's never touched, so the put must be worth nothing. And it is. With the barrier at 100 percent, it's always touched, so we must get the plain worst-of put from column D of sheet nine: 227 dollars. Exactly what we get.",
    render(body) {
      body.innerHTML = `
        <div class="xl-yr">
          <div class="xl-yr-top">
            <div class="fbox xl-yr-f"><span class="chip">THE ENGINE'S FORMULA</span>${GBM_XL}<span class="xlref">Excel · sheet 8, cell K49</span></div>
            <div class="xl-yr-c">
              <div class="xl-yr-n z"><div><b><math><mi>Z</mi></math>:</b> <span class="t">the correlated shock from step 2</span></div></div>
              <div class="xl-yr-n e"><div><b>EXP:</b> <span class="t">a price can never become negative</span><br><span class="t"><b><math><mo>−</mo><msup><mi>σ</mi><mn>2</mn></msup><mo>/</mo><mn>2</mn></math>:</b> half the variance, so the average still grows at <math><mi>r</mi><mo>−</mo><mi>q</mi></math></span></div></div>
            </div>
          </div>
          ${U.term({ fn: "PATH", title: `PATH 1 · ${NDAY} TRADING DAYS · % OF EACH STOCK'S START`, meta: "OUR EXCEL, SHEET 8", body: "<canvas></canvas>" })}
        </div>`;
      const root = body.querySelector(".xl-yr"), notes = [...body.querySelectorAll(".xl-yr-n")], cv = body.querySelector("canvas");
      let day = 0, a = null;
      function draw() {
        const c = U.canvas(cv); if (!c) return;
        const { ctx, w, h } = c, f = { x: 104, y: 22, w: w - 104 - 250, h: h - 22 - 62 };
        const ax = U.axes(ctx, f, { xMin: 0, xMax: NDAY, yMin: YR_MIN, yMax: YR_MAX, yTicks: [0.5, 0.75, 1, 1.25], yFmt: v => Math.round(v * 100) + "%",
          xTicks: [0, 63, 126, 189, 252], xLabel: "TRADING DAY" });
        const red = U.css("--term-red"), muted = U.css("--term-muted"), bg = U.css("--term-bg");
        // strike = start (100%) and the kick-in level (65%)
        ctx.save(); ctx.lineWidth = 2; ctx.setLineDash([9, 7]);
        ctx.strokeStyle = muted; ctx.beginPath(); ctx.moveTo(f.x, ax.Y(1)); ctx.lineTo(f.x + f.w, ax.Y(1)); ctx.stroke();
        ctx.strokeStyle = red; ctx.beginPath(); ctx.moveTo(f.x, ax.Y(KI)); ctx.lineTo(f.x + f.w, ax.Y(KI)); ctx.stroke();
        ctx.setLineDash([]); ctx.font = "700 17px " + U.F.mono; ctx.textBaseline = "middle"; ctx.textAlign = "left";
        ctx.fillStyle = red; ctx.fillText(`KICK-IN ${KI_TXT}`, f.x + 10, ax.Y(KI) + 16);
        ctx.textAlign = "right"; ctx.fillStyle = muted; ctx.fillText(`START = STRIKE ${pct(B.strike, 0)}`, f.x + f.w - 8, ax.Y(1) + 17);
        ctx.restore();
        // the three paths up to today's day
        ctx.save(); ctx.lineJoin = "round"; ctx.lineWidth = 2.6;
        [1, 0, 2].forEach(k => {
          ctx.strokeStyle = U.css(DARK[k]); ctx.beginPath();
          for (let t = 0; t <= day; t++) { const x = ax.X(t), y = ax.Y(LV[k][t]); t ? ctx.lineTo(x, y) : ctx.moveTo(x, y); }
          ctx.stroke();
          if (!day) return;   // day 0: all three start on the same spot, one neutral dot below
          ctx.beginPath(); ctx.arc(ax.X(day), ax.Y(LV[k][day]), 6, 0, 7); ctx.fillStyle = U.css(DARK[k]); ctx.fill(); ctx.strokeStyle = bg; ctx.lineWidth = 2; ctx.stroke(); ctx.lineWidth = 2.6;
        });
        if (!day) { ctx.beginPath(); ctx.arc(ax.X(0), ax.Y(1), 6, 0, 7); ctx.fillStyle = U.css("--term-text"); ctx.fill(); }
        ctx.restore();
        // kick-in days (the first close at or below 65%): a ring, and a label in the free band under 50% (no path goes there)
        ctx.save(); ctx.font = "700 17px " + U.F.mono; ctx.textBaseline = "middle"; ctx.textAlign = "left";
        [2, 0].forEach(k => {
          const d = P1.kiDay[k]; if (d === null || day < d) return;
          const x = ax.X(d), y = ax.Y(LV[k][d]), ly = ax.Y(YR_MIN + 0.022);
          const s = `${TK[k]} KICK-IN · DAY ${d}`, tw = ctx.measureText(s).width, lx = Math.min(x - tw / 2, f.x + f.w - tw);
          ctx.strokeStyle = red; ctx.lineWidth = 1.5; ctx.setLineDash([3, 4]); ctx.beginPath(); ctx.moveTo(x, y + 12); ctx.lineTo(x, ly - 12); ctx.stroke(); ctx.setLineDash([]);
          ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(x, y, 12, 0, 7); ctx.stroke();
          ctx.fillStyle = bg; ctx.fillRect(lx - 6, ly - 12, tw + 12, 24);
          ctx.fillStyle = red; ctx.fillText(s, lx, ly);
        });
        ctx.restore();
        // end labels at maturity
        if (day >= NDAY) {
          ctx.save(); ctx.textBaseline = "middle"; ctx.textAlign = "left";
          const ys = [0, 1, 2].map(k => ax.Y(LV[k][NDAY]));
          // keep the labels apart
          const order = [0, 1, 2].sort((p, q) => ys[p] - ys[q]), pos = [];
          order.forEach((k, j) => { pos[k] = j ? Math.max(ys[k], pos[order[j - 1]] + 30) : ys[k]; });
          [0, 1, 2].forEach(k => {
            const worst = k === P1.worst;
            ctx.font = "700 19px " + U.F.mono; ctx.fillStyle = U.css(LIGHT[k]);
            ctx.fillText(`${TK[k]} ${pct(LV[k][NDAY], 2)}`, f.x + f.w + 16, pos[k]);
            if (worst) { ctx.fillStyle = red; ctx.fillText("WORST", f.x + f.w + 16, pos[k] + 24); }
          });
          ctx.restore();
        }
      }
      return {
        step(i, o) {
          if (a) { a.cancel(); a = null; }
          root.classList.toggle("s1", i >= 1); root.classList.toggle("s2", i >= 2);
          notes.forEach((n, k) => n.classList.toggle("on", i >= k + 1));
          if (i < 3) { day = 0; draw(); return; }
          if (o.instant || U.reduced) { day = NDAY; draw(); return; }
          day = 0; draw();
          a = U.anim(2500, k => { day = Math.round(k * NDAY); draw(); }, { ease: U.ease.lin });   // the year draws in 2.5 s
        },
        resize() { U.tightenRoots(body); draw(); },
        // leaving while the year is drawing ends it, so a return (scroll mode) shows the whole path
        leave() { if (a) { a.cancel(); a = null; day = NDAY; draw(); } }
      };
    }
  });

  // ================= 6) xl-sens: which input matters most =================
  // sheet 11 in two groups (the group's feedback, 27 Oct 2026): the market inputs, then the product's own terms (the
  // kick-in level); largest change first within each group. Historical volatility and no dividends are not narrated: dimmed.
  const SE_MAX = 60;                                        // half-width of the chart in USD
  const seName = l => l.replace(/^Vol /, "Volatility ").replace(/^ρ /, "Correlation ").replace(/^Historical vol$/, "Historical volatility");
  const VOL_UP = SENS.find(s => /^Vol \+/.test(s.lab));
  const PUT_UP = XL.res.put + VOL_UP.d;                     // 172.59 + 46.30 = 218.89
  const seCall = s => /^Vol \+/.test(s.lab) ? `put ${fmt(XL.res.put, 0)} → ${fmt(PUT_UP, 0)} · value ${fmt(BASE, 0)} → ${fmt(VOL_UP.fv, 0)}`
    : /^ρ/.test(s.lab) ? `ρ ${s.lab.replace(/^ρ /, "").replace(/^([+−])/, "$1 ")}: ${sgn(Math.round(s.d), 0)}` : "";
  const isTerm = s => /^Kick-in/.test(s.lab);
  const SE_GROUPS = [
    { t: "Market inputs", rows: SENS.filter(s => !isTerm(s)).sort(bySize) },
    { t: "Product terms", rows: SENS.filter(isTerm).sort(bySize), cls: "terms" }
  ];

  Deck.addSlide({
    id: "xl-sens", section: "excel", steps: 1, secs: 15,
    title: STEPS[6].t,
    subtitle: `Sheet 11: how much the put changes when one input changes (same ${fmt(XL.paths, 0)} paths)`,
    notes: "[Excel → web app] And which input matters most? "
      + "[→] Volatility. Five points more, and the put rises from 173 to 219 dollars, so the product's value falls from 925 to 878. Correlation moves it by only about seven.",
    render(body) {
      const X = v => 50 + v / SE_MAX * 50;                  // % of the plot width
      let n = 0;                                            // running index: the bars grow one after another
      const rowHtml = s => {
        const k = n++, pos = s.d >= 0, w = Math.abs(s.d) / SE_MAX * 50, call = seCall(s);
        const cls = /^Vol \+/.test(s.lab) ? "hi" : /^ρ/.test(s.lab) ? "rho" : /^(Historical vol|No dividends)$/.test(s.lab) ? "dim" : "";
        const note = /^Historical vol$/.test(s.lab) ? "<small>(implied → historical)</small>" : "";
        // the value sits at the outer end of the bar; the callout of the volatility bar on the other side of zero
        const val = `<span class="xl-se-val" style="--k:${k};${pos ? `left:calc(${X(s.d)}% + 14px)` : `right:calc(${100 - X(s.d)}% + 14px)`}">${sgn(Math.round(s.d), 0)}</span>`;
        const callPos = cls === "hi" ? `right:calc(50% + 18px)` : pos ? `left:calc(${X(s.d)}% + 14px)` : `right:calc(${100 - X(s.d)}% + 14px)`;
        return `<div class="xl-se-row ${cls}"><span class="xl-se-lab">${seName(s.lab)}${note}</span>
          <div class="xl-se-plot"><span class="xl-se-bar ${pos ? "pos" : "neg"}" style="--k:${k};--w:${w.toFixed(2)}%"></span>${val}${call ? `<span class="xl-se-call" style="${callPos}">${call}</span>` : ""}</div></div>`;
      };
      const groups = SE_GROUPS.map(g => `<div class="xl-se-grp ${g.cls || ""}"><p class="xl-se-gh">${g.t}</p>${g.rows.map(rowHtml).join("")}</div>`).join("");
      const ticks = [-50, -25, 0, 25, 50].map(v => `<span style="left:${X(v)}%">${v ? sgn(v, 0) : "0"}</span>`).join("");
      body.innerHTML = `
        <div class="xl-se">
          ${U.term({ fn: "SENS", title: "CHANGE IN THE PUT, USD PER 1,000 NOTE", meta: `BASE CASE: PUT ${fmt(XL.res.put, 2)} · VALUE ${fmt(BASE, 2)}`,
            body: `<div class="xl-se-rows">${groups}<div class="xl-se-z0"><span class="xl-se-zero" style="left:50%"></span></div></div>
              <div class="xl-se-ax"><span></span><div class="xl-se-ticks">${ticks}</div></div>
              <div class="xl-se-cap"><span>← PUT FALLS: THE PRODUCT IS WORTH MORE</span><span>LARGEST CHANGE FIRST</span><span>PUT RISES: WORTH LESS →</span></div>` })}
        </div>`;
      const root = body.querySelector(".xl-se");
      return {
        step(i, o) {
          root.classList.toggle("s1", i >= 1);
          if (i === 0) replay(root, "on", o); else root.classList.add("on");
        }
      };
    }
  });
})();
