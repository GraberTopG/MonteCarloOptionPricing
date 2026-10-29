/* 03-montecarlo: What is Monte Carlo? (part 2 of the final video script, assignment 1c, about 2:20).
   Owner: video team. Slides, in the script's order (titles and texts from the group's feedback of 27 Oct 2026):
     mc-origin  "What is Monte Carlo?": three short lines of history next to a fair die: its expected value 3.5, then
                1,000 simulated rolls whose average settles at 3.5
     mc-sample  "Monte Carlo: averaging the payoffs of random paths": price = discounted risk-neutral expectation, 2,000
                simulated years (as many as our Excel's paths)
     mc-grid    "Monte Carlo escapes the curse of dimensionality": a grid needs 10^756 points for our 756 random numbers,
                random points do not care
     mc-pi      "How precise is Monte Carlo?": 5 darts, then 10,000, with a 95% interval
     mc-paths   "Geometric Brownian motion: building one simulated year": one year of three stocks, then ten, then hundreds
   All random numbers are seeded (Deck.util.rng), so every take shows the same picture. Classes keep the prefix .mc-. */
(function () {
  const U = Deck.util, XL = U.XL, B = U.BRC;
  const fmt = U.fmt, css = U.css;
  const instantOf = o => !!(o && o.instant) || U.reduced;
  const fwd = o => !!(o && o.dir === 1) && !instantOf(o);        // an animated click forwards
  const NDAY = XL.steps, NSTOCK = B.names.length, DIMS = NSTOCK * NDAY;   // 3 stocks × 252 days = 756 random numbers a year
  const MONTHS = { xMin: 0, xMax: NDAY, xTicks: [0, 63, 126, 189, 252], xFmt: d => String(Math.round(d / 21)) };
  // the slides write r and q (as our Excel); the lecture writes r_f and δ: a small grey note next to the formula says so
  const RF = `<msub><mi>r</mi><mi>f</mi></msub>`;
  const lectureNote = sym => `<span class="mc-fn">lecture: ${sym}</span>`;
  // a long title on two lines: the header grows by one line, so the body starts lower (.mc-t2)
  const twoLines = body => body.closest(".slide").classList.add("mc-t2");

  Deck.addStyle(`
    /* shared */
    .mc-tag{display:inline-block;font:700 16px/1 var(--f-mono);letter-spacing:.06em;text-transform:uppercase;color:var(--term-muted);border:1.5px dashed #3c4b44;border-radius:3px;padding:4px 8px;white-space:nowrap}
    .mc-term .term-stats{gap:44px;padding:10px 20px 12px}
    .mc-term .term-stats .k{font-size:16px}
    .mc-term .term-stats .k em{font-style:normal;color:var(--amber);opacity:.8}
    .mc-ul{font:700 24px var(--f-body);color:var(--green-ink)}
    .mc-ul2 mtd{padding:0}
    .mc-o .chip,.mc-sa .chip,.mc-pi .chip,.mc-pa .chip{white-space:nowrap}
    .mc-cap{font:24px/1.35 var(--f-body);color:var(--ink);margin:8px 0 0;text-align:center}
    .mc-cap math{font-size:26px}
    .mc-fn{font:18px/1.5 var(--f-body);color:var(--muted);white-space:nowrap}
    .mc-fn math,.fbox .mc-fn math{font-size:23px}   /* its subscript stays at 16px or more */
    /* legend swatches in a panel's header: a line, or a dashed line */
    .mc-lg{display:inline-block;width:28px;margin-right:8px;vertical-align:middle;border-top:3px solid var(--green)}
    .mc-lg.d{border-top:2px dashed var(--ink)}
    /* a title on two lines (balanced); the lecture tag stays on the subtitle's line and the body starts lower */
    .slide.mc-t2 .s-title{text-wrap:balance}
    .slide.mc-t2 .s-lecture{top:221px}
    .slide.mc-t2 .s-body{top:292px;height:680px}
    /* a title a little too long for one line: it may run further right (no lecture tag on that slide) */
    .slide.mc-tw .s-title{padding-right:320px}
    .mc-key{background:var(--orange-light);border-radius:8px;padding:14px 22px;font-size:26px;line-height:1.35}
    .mc-key math{font-size:28px}
    .mc-key .hl{color:var(--green-ink)}

    /* ---------- 1) mc-origin ---------- */
    .slide[data-id="mc-sample"] .s-title{font-size:43px;white-space:nowrap}
    .slide[data-id="mc-origin"] .s-title{font-size:50px;white-space:nowrap}
    .mc-o{display:grid;grid-template-columns:400px minmax(0,1fr);column-gap:48px;height:100%}
    .mc-o-h{display:flex;flex-direction:column;gap:32px;padding:4px 40px 0 0;border-right:2px solid var(--rule-light);min-width:0}
    .mc-o-h b{display:block;font:800 32px/1 var(--f-head);color:var(--green-ink);font-variant-numeric:lining-nums}
    .mc-o-h b::before{content:"";display:block;width:56px;height:4px;background:var(--green);margin-bottom:12px}
    .mc-o-h p{margin:10px 0 0;font:23px/1.36 var(--f-body);color:var(--ink)}
    .mc-o-h p em{font-style:normal;font-weight:700}
    .mc-o-h p.mc-o-lab{margin:0 0 -12px;font:700 24px var(--f-head);text-transform:uppercase;color:var(--ink)}
    .mc-o-h small{display:block;margin-top:6px;font:16px var(--f-body);color:var(--muted)}
    .mc-o-m{display:flex;flex-direction:column;gap:30px;min-width:0}
    .mc-o-ev{flex:none;padding:28px 28px 8px}
    .mc-o-dice{display:grid;grid-template-columns:auto repeat(6,56px);column-gap:30px;row-gap:2px;justify-content:center;align-items:center}
    .mc-o-dice .rl{justify-self:end;padding-right:8px;font-size:24px}
    .mc-o-dice .p{justify-self:center;font-size:21px;math-style:normal}   /* full-size fractions */
    .mc-die{display:block;width:56px;height:56px}
    .mc-die rect{fill:#fff;stroke:var(--green-ink);stroke-width:4}
    .mc-die circle{fill:var(--green-ink)}
    .mc-o-ev>math,.mc-o-evf>math{margin-top:2px;font-size:28px}
    .mc-o-chk{flex:1;min-height:0;display:flex;flex-direction:column;justify-content:center;gap:6px;padding:26px 26px 20px}
    .mc-o-chk p{margin:0;font:24px/1.3 var(--f-body);color:var(--ink)}
    .mc-o-chk b{font-size:34px;color:var(--green)}
    .mc-o-chk p+p{font-size:21px;color:var(--muted)}
    .mc-o-ev .ev{color:var(--green)}
    .mc-o-lo{order:-1;flex:1;min-height:0;display:grid;grid-template-columns:minmax(0,1fr) 380px;column-gap:28px}
    .mc-o-chart{margin:0;min-height:0;display:flex;flex-direction:column}
    .mc-o-chart canvas{flex:1 1 0;height:0;min-height:0;width:100%;display:block}
    .mc-o-lg{display:flex;justify-content:flex-end;gap:28px;font:19px var(--f-body);color:var(--ink)}
    .mc-o-lg span:first-child{color:var(--green);font-weight:700}
    .mc-o-chart figcaption{margin-top:6px;font:21px var(--f-body);color:var(--muted)}
    .mc-o-r{display:flex;flex-direction:column;gap:30px;min-width:0}
    .mc-o-res{flex:1;display:flex;flex-direction:column;justify-content:center;gap:8px;padding:20px 26px;font-size:26px}
    .mc-o-res .chk{margin:14px 0 0;padding-top:14px;border-top:2px solid var(--rule-light);font:22px/1.35 var(--f-body);color:var(--ink)}
    .mc-o-res b{font:800 56px/1 var(--f-head);color:var(--green);font-variant-numeric:lining-nums}
    .mc-o-int{flex:1;min-height:0;display:flex;flex-direction:column;justify-content:center;gap:12px;padding:20px 22px}
    .mc-o-int p{margin:0;font:24px/1.3 var(--f-body);color:var(--ink)}
    .mc-o-int math{font-size:34px}
    .mc-o-int p.mb{font-size:21px;color:var(--muted)}

    /* ---------- 2) mc-sample ---------- */
    .mc-sa{display:grid;grid-template-rows:96px minmax(0,1fr);row-gap:26px;height:100%}
    .mc-sa .n{width:36px;height:36px;border-radius:50%;background:var(--green-ink);color:#fff;display:inline-grid;place-items:center;font:800 20px/1 var(--f-body);flex:none}
    .mc-sa-lo{display:grid;grid-template-columns:minmax(0,1fr) 700px;column-gap:32px;min-height:0}
    .mc-sa-chart{margin:0;min-height:0;display:flex;flex-direction:column}
    .mc-sa-h{display:flex;align-items:center;gap:12px;margin:0 0 6px;font:700 24px var(--f-body);color:var(--green-ink)}
    .mc-sa-chart canvas{flex:1 1 0;height:0;min-height:0;width:100%;display:block}
    .mc-sa-chart figcaption{margin-top:6px;font:21px var(--f-body);color:var(--muted)}
    .mc-sa-r{display:flex;flex-direction:column;gap:34px;min-width:0;padding-top:14px}
    .mc-sa-f{position:relative;flex:1;min-height:0;display:flex;align-items:center;justify-content:center;padding:34px 24px 14px 60px}
    .mc-sa-f math{font-size:34px}
    .mc-sa-fw{position:relative}
    .mc-sa-fw .mc-fn{position:absolute;right:0;top:100%;margin-top:6px}
    .mc-sa .fbox>.n{position:absolute;left:18px;top:18px}
    .mc-flow{display:grid;grid-template-columns:1fr 40px 1.25fr 40px 1fr;align-items:center}
    .mc-flow .box{background:var(--card);border:3px solid transparent;border-radius:10px;height:96px;display:flex;align-items:center;justify-content:center;gap:14px;font:700 24px/1.15 var(--f-body);color:var(--green-ink);padding:0 16px;transition:border-color .3s,background .3s}
    .mc-flow .box.act{border-color:var(--green);background:var(--green-light)}
    .mc-flow .badge{width:46px;height:46px;flex:none}
    .mc-flow .badge svg{width:28px;height:28px}
    .mc-flow .ar{font:700 32px/1 var(--f-body);color:var(--green);text-align:center}
    .mc-lln{position:relative;flex:1;min-height:0;padding:34px 18px 10px 60px;display:flex;flex-direction:column;justify-content:center}
    .mc-lln math{font-size:32px}
    .mc-lln p{margin:4px 0 0;font:26px/1.3 var(--f-body);text-align:center}

    /* ---------- 3) mc-grid ---------- */
    .mc-gr{--mc-gcols:1fr 66px 1fr 66px 1fr 66px 1fr;display:grid;grid-template-rows:auto 314px minmax(0,1fr);row-gap:32px;height:100%}
    .mc-gr-s{margin:0;font:24px/1.3 var(--f-body);color:var(--ink);white-space:nowrap}
    .mc-gr>.panel{padding:34px 32px 12px}
    .mc-gcells{display:grid;grid-template-columns:var(--mc-gcols);height:100%}
    .mc-gc{display:flex;flex-direction:column;align-items:center;min-width:0;opacity:0;transform:translateY(14px);transition:opacity .5s ease,transform .5s ease;transition-delay:calc(var(--d) * 220ms)}
    .mc-gr.in .mc-gc{opacity:1;transform:none}
    .mc-gh{font:700 24px/1 var(--f-head);color:var(--muted);text-transform:uppercase;letter-spacing:.03em;margin:4px 0 0;font-variant-numeric:lining-nums;white-space:nowrap}
    .mc-gc svg{display:block;width:300px;height:169px;margin-top:10px;flex:none}
    .mc-gn{display:flex;align-items:baseline;gap:12px;margin-top:6px;white-space:nowrap}
    .mc-gn b{font:800 48px/1 var(--f-head);color:var(--green-ink);font-variant-numeric:lining-nums}
    .mc-gn span{font:26px var(--f-body);color:var(--muted)}
    .mc-gn b.q{color:var(--rule-light)}
    .mc-gn b.x{color:var(--orange)}
    .mc-gn b sup{font-size:.56em;vertical-align:.78em;line-height:0;margin-left:2px}
    .mc-g756{width:300px;height:169px;margin-top:10px;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:14px;text-align:center}
    .mc-g756 .d{font:700 46px/1 var(--f-head);color:var(--green-ink);letter-spacing:.06em}
    .mc-g756 .s{font:28px/1.2 var(--f-body);color:var(--ink)}
    .mc-g756 .t{font:700 26px/1.2 var(--f-body);color:var(--orange)}
    .mc-gx{display:flex;flex-direction:row;align-items:flex-start;justify-content:center;padding-top:110px;font:700 26px/1 var(--f-body);color:var(--orange);white-space:nowrap}
    .mc-gt{min-height:0}
    .mc-gt .term-body{display:grid;grid-template-columns:var(--mc-gcols);padding:12px 34px 10px}
    .mc-gt .cl{position:relative;min-width:0;display:flex;flex-direction:column;align-items:center}
    .mc-gt .cl canvas{position:relative;inset:auto;flex:1;min-height:0;height:auto;width:100%}
    .mc-gt .cl p{margin:6px 0 0;font:700 18px/1 var(--f-mono);letter-spacing:.06em;color:var(--term-muted);white-space:nowrap}
    .mc-gt .cl.f{justify-content:center;gap:10px;text-align:center}
    .mc-gt .cl.f math{font-size:40px;color:var(--amber)}
    .mc-gt .cl.f span{font:700 26px/1.3 var(--f-mono);color:var(--term-text)}
    .mc-gt .cl.f .mc-gmc{display:flex;flex-direction:column;align-items:center;gap:6px}
    .mc-gt .cl.f .mc-gmc>span{color:var(--amber)}

    /* ---------- 4) mc-pi ---------- */
    .mc-pi{display:grid;grid-template-columns:780px minmax(0,1fr);column-gap:36px;height:100%}
    .mc-pi .term{height:100%}
    .mc-pi .term-stats{gap:30px}
    .mc-pi .term-stats>div:first-child{min-width:104px}
    .mc-pi .term-stats>div:nth-child(2){min-width:88px}
    .mc-pi .term-meta .t-green,.mc-pi .term-meta .t-red{font-weight:700}
    .mc-pi-r{display:flex;flex-direction:column;justify-content:space-between;gap:24px;min-width:0}
    .mc-pi-f{padding:34px 20px 18px}
    .mc-pi-f math{font-size:32px}
    .mc-pi-f math+math{margin-top:18px}
    .mc-pr{display:grid;grid-template-columns:190px 170px 1fr;align-items:center;gap:14px;background:var(--card);border-radius:10px;padding:18px 22px;font-size:26px;color:var(--muted)}
    .mc-pr b{font:700 26px var(--f-body);color:var(--green-ink)}
    .mc-pr .v{font:700 28px var(--f-mono);color:var(--ink);text-align:right;font-variant-numeric:tabular-nums;white-space:nowrap}
    .mc-pr.last .v{color:var(--orange)}
    .mc-pi-ci{padding:34px 20px 16px}
    .mc-pi-ci math{font-size:32px}
    .mc-pi-ci .mc-cap{margin-top:12px}
    .mc-pi-ci .mc-cap math{font-size:26px}

    /* ---------- 5) mc-paths ---------- */
    .mc-pa{display:grid;grid-template-rows:160px minmax(0,1fr);row-gap:22px;height:100%}
    .mc-pa-t{display:grid;grid-template-columns:420px minmax(0,1fr) 640px;column-gap:32px;min-height:0}
    .mc-pa-y{display:flex;flex-direction:column;justify-content:center}   /* a year and one line of text (no timeline) */
    .mc-pa-y b{display:block;font:800 40px/1 var(--f-head);color:var(--green-ink);font-variant-numeric:lining-nums}
    .mc-pa-y p{margin:10px 0 0;font:26px/1.3 var(--f-body);color:var(--ink)}
    .mc-pa-m{display:flex;flex-direction:column;justify-content:center;padding:14px 26px}
    .mc-pa-m p{margin:0;font:26px/1.3 var(--f-body);color:var(--ink)}
    .mc-pa-m b{display:block;margin-top:6px;font:800 34px/1.18 var(--f-head);color:var(--green-ink);font-variant-numeric:lining-nums}
    .mc-pa-m b .x{font:700 34px var(--f-body)}
    .mc-pa-g{display:flex;flex-direction:column;justify-content:center;padding:26px 20px 8px}
    .mc-pa-g math{font-size:36px}
    .mc-pa-g .mc-cap{margin-top:4px}
    .mc-pa-g .mc-fn{display:block;margin-top:4px;text-align:center}
    .mc-kern{margin-left:-.07em}   /* Arial Bold leaves a gap between O and T in "MOTION": close it */
    .mc-pa .term{min-height:0}
  `);

  // =====================================================================================================
  // 1) What is Monte Carlo? A fair die: expected value 3.5, then 1,000 rolls
  // =====================================================================================================
  // a die face as SVG (own drawing): pips on a 3 x 3 grid
  const PIPS = { 1: [4], 2: [0, 8], 3: [0, 4, 8], 4: [0, 2, 6, 8], 5: [0, 2, 4, 6, 8], 6: [0, 2, 3, 5, 6, 8] };
  const dieSVG = v => `<svg class="mc-die" viewBox="0 0 100 100" role="img" aria-label="${v}"><rect x="4" y="4" width="92" height="92" rx="16"/>${PIPS[v].map(i => `<circle cx="${26 + (i % 3) * 24}" cy="${26 + Math.floor(i / 3) * 24}" r="8.5"/>`).join("")}</svg>`;
  // Seed 1838 (searched offline with Deck.util.rng): the first roll is a 6, the first 10 average 4.5, the first 100 3.71
  // and all 1,000 3.499. One roll = one draw, 1 + floor(6u).
  const ROLL = { seed: 1838, n: 1000, ms: 5200 };
  const rolls = (() => {
    const r = U.rng(ROLL.seed), v = new Uint8Array(ROLL.n), avg = new Float64Array(ROLL.n + 1);
    let s = 0;
    for (let i = 0; i < ROLL.n; i++) { v[i] = 1 + Math.floor(r() * 6); s += v[i]; avg[i + 1] = s / (i + 1); }
    return { v, avg };
  })();
  if (Math.abs(rolls.avg[ROLL.n] - 3.5) >= 0.005) console.error("mc-origin: the seeded rolls no longer average 3.50 after 1,000 rolls");
  const EX = `<mi mathvariant="normal">E</mi><mo stretchy="false">(</mo><mi>X</mi><mo stretchy="false">)</mo>`;
  const XI = `<msub><mi>x</mi><mi>i</mi></msub>`, SIXTH = `<mfrac><mn>1</mn><mn>6</mn></mfrac>`;
  const EV = `<math display="block">${EX}<mo>=</mo><mo>∑</mo>${XI}<mo>·</mo><mi>P</mi><mo stretchy="false">(</mo>${XI}<mo stretchy="false">)</mo><mo>=</mo>
      <mo stretchy="false">(</mo><mn>1</mn><mo>+</mo><mn>2</mn><mo>+</mo><mn>3</mn><mo>+</mo><mn>4</mn><mo>+</mo><mn>5</mn><mo>+</mo><mn>6</mn><mo stretchy="false">)</mo><mo>·</mo>${SIXTH}
      <mo>=</mo><mfrac><mn>21</mn><mn>6</mn></mfrac><mo>=</mo><mn class="ev">3.5</mn></math>`;
  const INT = `<math display="block">${EX}<mo>=</mo><mo>∫</mo><mi>x</mi><mo>·</mo><mi>f</mi><mo stretchy="false">(</mo><mi>x</mi><mo stretchy="false">)</mo><mspace width="0.2em"></mspace><mi>d</mi><mi>x</mi></math>`;

  Deck.addSlide({
    id: "mc-origin", section: "mc", steps: 2, secs: 40,
    title: "Monte Carlo: averaging random draws to estimate E(X)",
    subtitle: "Roll a die 1,000 times: by the law of large numbers, the average converges to the expected value",
    sources: "Eckhardt (1987); Metropolis (1987); own simulation",
    notes: "In 1946, Stanislaw Ulam was recovering from an illness and playing solitaire. Instead of calculating his chances, he asked: why not play a hundred games and count the wins? His colleague Nicholas Metropolis named it after the casino: Ulam had an uncle who just had to go to Monte Carlo. Here's the idea with a die. What's the average roll? Instead of calculating it, let's roll. [→] A thousand rolls: at first the average jumps around, then it settles at about 3.5. [→] Now the calculation: one to six, each with probability one sixth, gives exactly 3.5. The simulation got it right. That's the law of large numbers, and that's Monte Carlo: when we can't calculate an expected value, we estimate it by averaging random draws. For our Multi-BRC there's no closed-form solution, so that's exactly what we'll do.",
    render(body) {
      body.innerHTML = `
        <div class="mc-o">
          <aside class="mc-o-h">
            <p class="label mc-o-lab">Origin</p>
            <div><b>1946</b><p>Stanislaw Ulam, recovering from an illness, plays solitaire: why not play <em>100 games</em> and <em>count the wins</em>?</p></div>
            <div><b>The name</b><p>His colleague Nicholas Metropolis suggests it: Ulam had an uncle who “just had to go to Monte Carlo”</p></div>
            <div class="mc-o-link" data-step="1"><b>Applied to a die</b><p>Ulam's idea: <em>don't calculate, roll</em> and take the average</p></div>
          </aside>
          <div class="mc-o-m">
            <div class="fbox mc-o-ev"><span class="chip">A FAIR DIE</span>
              <div class="mc-o-dice">
                <math class="rl">${XI}</math>${[1, 2, 3, 4, 5, 6].map(dieSVG).join("")}
                <math class="rl"><mi>P</mi><mo stretchy="false">(</mo>${XI}<mo stretchy="false">)</mo></math>${[1, 2, 3, 4, 5, 6].map(() => `<math class="p">${SIXTH}</math>`).join("")}
              </div>
              <div class="mc-o-evf" data-step="2">${EV}</div>
            </div>
            <div class="mc-o-lo">
              <figure class="mc-o-chart">
                <div class="mc-o-lg"><span><i class="mc-lg"></i>Average so far</span><span data-step="2"><i class="mc-lg d"></i>Exact E(X) = 3.5</span></div>
                <canvas></canvas>
                <figcaption>${fmt(ROLL.n, 0)} simulated rolls of a fair die: each dot is one roll, the line the average so far</figcaption>
              </figure>
              <div class="mc-o-r">
                <div class="card mc-o-res" data-step="1" style="--d:58"><span>average of ${fmt(ROLL.n, 0)} rolls</span><b>≈ 3.5</b>
                  <p class="chk" data-step="2" style="--d:4">= the exact expected value: simulation and calculation agree</p></div>
              </div>
            </div>
          </div>
        </div>`;
      const cv = body.querySelector("canvas");
      let n = 0, a = null, cur = 0;   // n: rolls shown
      function draw() {
        const c = U.canvas(cv); if (!c) return;
        const { ctx, w, h } = c;
        // x: the number of rolls on a log scale (1, 10, 100, 1,000), so the noisy start is as wide as the calm end
        const f = { x: 92, y: 14, w: w - 112, h: h - 74 };
        const ax = U.axes(ctx, f, { xMin: 0, xMax: Math.log10(ROLL.n), xTicks: [0, 1, 2, 3], xFmt: v => fmt(Math.pow(10, v), 0), xLabel: "Number of rolls (log scale)", yLabel: "Roll", yMin: 1, yMax: 6, yTicks: [1, 2, 3, 4, 5, 6] });
        const X = m => ax.X(Math.log10(m)), green = css("--green"), ink = css("--ink");
        if (cur >= 2) { ctx.save(); ctx.setLineDash([8, 6]); ctx.strokeStyle = ink; ctx.lineWidth = 1.8;
        ctx.beginPath(); ctx.moveTo(f.x, ax.Y(3.5)); ctx.lineTo(f.x + f.w, ax.Y(3.5)); ctx.stroke(); ctx.restore(); }
        if (!n) return;
        // every roll as a faint dot on its face, then the average of the rolls so far
        ctx.fillStyle = css("--green-ink"); ctx.globalAlpha = .16;
        for (let i = 0; i < n; i++) { ctx.beginPath(); ctx.arc(X(i + 1), ax.Y(rolls.v[i]), 3.2, 0, 7); ctx.fill(); }
        ctx.globalAlpha = 1;
        ctx.save(); ctx.strokeStyle = green; ctx.lineWidth = 3.2; ctx.lineJoin = "round"; ctx.beginPath();
        for (let m = 1; m <= n; m++) { const x = X(m), y = ax.Y(rolls.avg[m]); if (m === 1) ctx.moveTo(x, y); else ctx.lineTo(x, y); }
        ctx.stroke(); ctx.restore();
        const ex = X(n), ey = ax.Y(rolls.avg[n]);
        ctx.fillStyle = "#fff"; ctx.beginPath(); ctx.arc(ex, ey, 8, 0, 7); ctx.fill();
        ctx.fillStyle = green; ctx.beginPath(); ctx.arc(ex, ey, 5.5, 0, 7); ctx.fill();
      }
      function step(i, o) {
        if (a) { a.cancel(); a = null; }
        cur = i;
        if (i === 0) { n = 0; draw(); return; }
        // click 1: the rolls come in, ten times faster every third of the time (1 → 10 → 100 → 1,000)
        if (i === 1 && fwd(o)) {
          n = 1;
          a = U.anim(ROLL.ms, k => { n = Math.max(1, Math.round(Math.pow(ROLL.n, k))); draw(); }, { ease: U.ease.lin, done: () => { a = null; n = ROLL.n; draw(); } });
          return;
        }
        n = ROLL.n; draw();
      }
      return {
        resize() { U.tightenRoots(body); draw(); },
        step,
        // cancelled rolls end complete
        leave() { if (a) step(cur, { instant: true }); }
      };
    }
  });

  // =====================================================================================================
  // 2) Monte Carlo: averaging the payoffs of random paths
  // =====================================================================================================
  const M = U.MODEL;                               // one stock as volatile as Apple in our Excel (28%), r of our Excel
  // 2,000 seeded years, as many as our Excel's paths. Seed 48 (searched offline with Deck.util.rng): the 2,000 ends
  // average 104.53%, the risk-free growth e^r. The years come in from left to right (the first 80% of the time), then
  // the distribution at month 12 grows. Three years are drawn on top: those ending at the 10%, 50% and 90% point.
  const FAN = { n: XL.paths, seed: 48, ms: 2400, reveal: .8, top: [.1, .5, .9] };
  const HIST = { lo: 40, hi: 200, bin: 5, w: 168 };   // the distribution at month 12: bins of 5 points; w: its strip (px)
  const EQ = `<msup><mi mathvariant="normal">E</mi><mi>Q</mi></msup><mo stretchy="false">[</mo><mtext>payoff</mtext><mo stretchy="false">]</mo>`;
  // an under-label in two short lines, so the terms of the formula stay close together; every line has the same box
  // (mpadded), so both labels line up whatever their letters
  const ULL = t => `<mtr><mtd><mpadded class="mc-ul" height="0.95em" depth="0.3em"><mtext>${t}</mtext></mpadded></mtd></mtr>`;
  const UL = (a, b) => `<mtable class="mc-ul2">${ULL(a)}${ULL(b)}</mtable>`;
  // the discount factor carries an invisible copy of E^Q[payoff], so both braces hang at the same depth, and a little
  // space on each side: a brace narrower than that gets a smaller, flatter glyph, and its label would sit higher
  const PRICE = `<math display="block"><mtext>price</mtext><mo>=</mo>
      <munder><munder><mrow><mspace width="0.2em"></mspace><msup><mi>e</mi><mrow><mo>−</mo><mi>r</mi><mi>T</mi></mrow></msup><mspace width="0.2em"></mspace><mpadded width="0"><mphantom>${EQ}</mphantom></mpadded></mrow><mo>⏟</mo></munder>${UL("discounted at", "the risk-free rate")}</munder>
      <mo>·</mo>
      <munder><munder><mrow>${EQ}</mrow><mo>⏟</mo></munder>${UL("expected payoff", "in a risk-neutral world")}</munder></math>`;
  const LLN = `<math display="block"><mfrac><mn>1</mn><mi>n</mi></mfrac><munderover><mo>∑</mo><mrow><mi>i</mi><mo>=</mo><mn>1</mn></mrow><mi>n</mi></munderover><msub><mtext>payoff</mtext><mi>i</mi></msub>
      <mspace width="0.3em"></mspace><mover><mo stretchy="true">⟶</mo><mrow><mi mathsize="0.85em">n</mi><mo mathsize="0.85em">→</mo><mi mathsize="0.85em">∞</mi></mrow></mover><mspace width="0.3em"></mspace>${EQ}</math>`;

  Deck.addSlide({
    id: "mc-sample", section: "mc", steps: 3, secs: 36,
    title: "Monte Carlo pricing: simulate paths, discount payoffs, average them",
    subtitle: "Instead of rolling a die, we simulate a whole year of share prices, 2,000 times",
    lecture: "Lecture 4, slide 15",
    sources: "Arnold (2026), slides 11 and 15; explanation adapted from The Synthetic Mind (2026); own simulation",
    notes: "How do we apply this to an option? In three steps. [→] Step one: sample a random path, a whole year of daily share prices. We do that 2,000 times. [→] Step two: compute each path's payoff and discount it at the risk-free rate. That's how our lecture prices an option: its expected payoff in a risk-neutral world, discounted. [→] Step three: average them all. By the law of large numbers, the average converges to the true price.",
    render(body) {
      const box = (k, icon, txt) => `<div class="box" data-step="${k}"><span class="n">${k}</span><span class="badge">${U.icon(icon)}</span><span class="lb">${txt}</span></div>`;
      body.innerHTML = `
        <div class="mc-sa">
          <div class="mc-flow">${box(1, "dice", "Sample a random path")}<span class="ar" data-step="2">→</span>${box(2, "check", "Compute its discounted payoff")}<span class="ar" data-step="3">→</span>${box(3, "avg", "Average them all")}</div>
          <div class="mc-sa-lo">
            <figure class="mc-sa-chart" data-step="1">
              <p class="mc-sa-h"><span class="n">1</span>Sample random paths</p>
              <canvas></canvas>
              <figcaption>${fmt(FAN.n, 0)} simulated years of one stock (volatility ${fmt(M.sigma * 100, 0)}%, like Apple; risk-free rate ${fmt(M.r * 100, 2)}%): each line is one year</figcaption>
            </figure>
            <div class="mc-sa-r">
              <div class="fbox mc-sa-f" data-step="2"><span class="n">2</span><span class="chip">RISK-NEUTRAL VALUATION OF A PAYOFF</span><div class="mc-sa-fw">${PRICE}</div></div>
              <div class="fbox mc-lln" data-step="3"><span class="n">3</span><span class="chip">LAW OF LARGE NUMBERS</span>${LLN}<p>the average converges to the true value</p></div>
            </div>
          </div>
        </div>`;
      const cv = body.querySelector("canvas"), BOX = [...body.querySelectorAll(".mc-flow .box")];
      let fan = null, tops = null, hist = null, day = 0, grow = 0, a = null, cur = 0, pre = 0;
      // the 2,000 faint years are drawn once into an offscreen layer (per canvas size); a click only uncovers it from
      // left to right, so the animation stays smooth
      const layer = { cv: document.createElement("canvas"), key: "" };
      function paths() {   // generated when first needed, never at page load
        if (!fan) {
          const g = U.normal(U.rng(FAN.seed));
          fan = Array.from({ length: FAN.n }, () => Float64Array.from(U.simPath(g)));
          const order = fan.map((p, j) => j).sort((x, y) => fan[x][NDAY] - fan[y][NDAY]);
          tops = FAN.top.map(q => order[Math.round(q * (FAN.n - 1))]);
          const nb = (HIST.hi - HIST.lo) / HIST.bin, cnt = new Array(nb).fill(0);
          let s = 0;
          fan.forEach(p => { const v = p[NDAY], b = Math.floor((v - HIST.lo) / HIST.bin); s += v; if (b >= 0 && b < nb) cnt[b]++; });
          hist = { cnt, max: Math.max(...cnt), mean: s / FAN.n };
        }
        return fan;
      }
      const frame = (w, h) => ({ x: 104, y: 30, w: w - 104 - HIST.w, h: h - 96 });
      const yOpt = { yMin: 40, yMax: 200, yTicks: [40, 60, 80, 100, 120, 140, 160, 180, 200], yFmt: v => v + "%" };
      function buildLayer(w, h, ax, f) {
        const key = cv.width + "x" + cv.height;
        if (key === layer.key) return;
        const P = paths(), g = layer.cv.getContext("2d"), r = cv.width / w;
        layer.cv.width = cv.width; layer.cv.height = cv.height; layer.key = key;
        g.setTransform(r, 0, 0, r, 0, 0);
        g.save(); g.beginPath(); g.rect(f.x, f.y, f.w, f.h); g.clip(); g.lineJoin = "round";
        // each path's vertices shift by a different fraction of a day, so 2,000 paths do not line up in vertical
        // stripes (the clip hides the small overshoot at day 252)
        g.strokeStyle = css("--green"); g.globalAlpha = .03; g.lineWidth = 1;
        const stepW = ax.X(1) - ax.X(0);
        for (let j = 0; j < P.length; j++) {
          const p = P[j], off = ((j * 0.6180339) % 1) * stepW;
          g.beginPath(); g.moveTo(ax.X(0), ax.Y(p[0])); for (let d = 1; d <= NDAY; d++) g.lineTo(ax.X(d) + off, ax.Y(p[d])); g.stroke();
        }
        g.restore();
      }
      // build: also draw the faint years into their layer when none are shown yet (done before click 1)
      function draw(build) {
        const c = U.canvas(cv); if (!c) return;
        const { ctx, w, h } = c;
        const f = frame(w, h);
        const ax = U.axes(ctx, f, Object.assign({ xLabel: "Month", yLabel: "Share price (% of start)" }, yOpt, MONTHS));
        const green = css("--green"), gInk = css("--green-ink"), muted = css("--term-muted"), ink = css("--ink");
        ctx.save(); ctx.setLineDash([7, 7]); ctx.strokeStyle = muted; ctx.lineWidth = 1.6;
        ctx.beginPath(); ctx.moveTo(f.x, ax.Y(100)); ctx.lineTo(f.x + f.w, ax.Y(100)); ctx.stroke(); ctx.restore();
        ctx.font = "700 19px " + U.F.body; ctx.textBaseline = "top"; ctx.textAlign = "left"; ctx.fillStyle = muted;
        if (build || day > 0) buildLayer(w, h, ax, f);
        if (day > 0) {
          const P = paths();
          // the faint years, uncovered up to today
          ctx.save(); ctx.beginPath(); ctx.rect(f.x, f.y, Math.min(f.w, ax.X(day) - f.x + 2), f.h); ctx.clip();
          ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.drawImage(layer.cv, 0, 0); ctx.restore();
          ctx.save(); ctx.beginPath(); ctx.rect(f.x, f.y, f.w, f.h); ctx.clip(); ctx.lineJoin = "round";
          ctx.strokeStyle = gInk; ctx.lineWidth = 2.4;
          tops.forEach(j => { const p = P[j]; ctx.beginPath(); ctx.moveTo(ax.X(0), ax.Y(p[0])); for (let d = 1; d <= day; d++) ctx.lineTo(ax.X(d), ax.Y(p[d])); ctx.stroke(); });
          ctx.restore();
          // once the year is complete: which three years these are (they end at the 10%, 50% and 90% point)
          if (day >= NDAY) {
            const TL = ["10th percentile", "Median", "90th percentile"];
            ctx.save();
            ctx.font = "700 19px " + U.F.body; ctx.textAlign = "right"; ctx.textBaseline = "bottom"; ctx.lineJoin = "round";
            tops.forEach((j, k) => {
              const x = ax.X(NDAY) - 10, y = ax.Y(P[j][NDAY]) - 10;
              ctx.lineWidth = 6; ctx.strokeStyle = "rgba(255,255,255,.92)"; ctx.strokeText(TL[k], x, y);
              ctx.fillStyle = gInk; ctx.fillText(TL[k], x, y);
            });
            ctx.restore();
          }
        }
        ctx.fillStyle = ink; ctx.beginPath(); ctx.arc(ax.X(0), ax.Y(100), 5, 0, 7); ctx.fill();
        // month 12: where the 2,000 years end (bars), and their average
        if (grow > 0) {
          const hx = f.x + f.w + 16, hw = w - hx - 20;
          ctx.fillStyle = muted; ctx.textAlign = "left"; ctx.globalAlpha = grow; ctx.fillStyle = ink; ctx.fillText("At month 12", hx, 6); ctx.globalAlpha = 1;
          ctx.fillStyle = css("--green-mid"); ctx.globalAlpha = .8;
          hist.cnt.forEach((k, b) => {
            if (!k) return;
            const y0 = ax.Y(HIST.lo + (b + 1) * HIST.bin), y1 = ax.Y(HIST.lo + b * HIST.bin);
            ctx.fillRect(hx, y0 + .6, Math.max(1, hw * k / hist.max * grow), y1 - y0 - 1.2);
          });
          ctx.globalAlpha = grow;
          const ym = Math.round(ax.Y(hist.mean)) + .5;
          ctx.strokeStyle = green; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(f.x + f.w - 14, ym); ctx.lineTo(hx + hw, ym); ctx.stroke();
          // its legend under the bars, on the row of the axis title "MONTH" (the row above holds the month numbers)
          const yl = f.y + f.h + 38;
          ctx.beginPath(); ctx.moveTo(hx, yl + 9.5); ctx.lineTo(hx + 22, yl + 9.5); ctx.stroke();
          ctx.fillStyle = green; ctx.fillText("Average", hx + 30, yl);
          ctx.globalAlpha = 1;
        }
      }
      function step(i, o) {
        if (a) { a.cancel(); a = null; }
        cur = i;
        BOX.forEach((e, k) => e.classList.toggle("act", k === i - 1));   // the step being shown
        if (i === 0) { day = 0; grow = 0; draw(); return; }
        if (i === 1 && fwd(o)) {
          day = 0; grow = 0;
          a = U.anim(FAN.ms, k => {
            day = Math.round(U.ease.inOut(Math.min(1, k / FAN.reveal)) * NDAY);
            grow = U.ease.out(Math.max(0, (k - FAN.reveal) / (1 - FAN.reveal)));
            draw();
          }, { ease: U.ease.lin, done: () => { a = null; day = NDAY; grow = 1; draw(); } });
          return;
        }
        day = NDAY; grow = 1; draw();
      }
      return {
        // the slide is on screen: draw the faint years into their layer shortly after it has faded in, before click 1
        resize() { U.tightenRoots(body); draw(); clearTimeout(pre); pre = setTimeout(() => { pre = 0; draw(true); }, 450); },
        step,
        // a cancelled reveal ends complete (also when it had not drawn its first day yet)
        leave() { clearTimeout(pre); pre = 0; if (a) step(cur, { instant: true }); }
      };
    }
  });

  // =====================================================================================================
  // 3) Monte Carlo escapes the curse of dimensionality
  // =====================================================================================================
  // the drawings share one 320 x 180 box: 1D on a line, 2D in a square, 3D in an oblique cube
  const G1 = { x0: 24, x1: 296, y: 96 }, G2 = { x0: 76, y0: 8, s: 168 }, G3 = { x0: 70, y0: 168, s: 118, dx: 65, dy: 48 };
  const at3 = (u, v, w) => [G3.x0 + u * G3.s + w * G3.dx, G3.y0 - v * G3.s - w * G3.dy];
  const cubeEdges = () => { const c = [[0, 0, 0], [1, 0, 0], [1, 1, 0], [0, 1, 0], [0, 0, 1], [1, 0, 1], [1, 1, 1], [0, 1, 1]].map(p => at3(...p));
    return [[0, 1], [1, 2], [2, 3], [3, 0], [4, 5], [5, 6], [6, 7], [7, 4], [0, 4], [1, 5], [2, 6], [3, 7]].map(([a, b]) => [c[a], c[b]]); };
  function gridSVG(dim) {
    const ink = "var(--green-ink)";
    let s = "";
    if (dim === 1) {
      s += `<line x1="10" y1="${G1.y}" x2="310" y2="${G1.y}" style="stroke:var(--rule);stroke-width:2"/>`;
      for (let i = 0; i < 10; i++) s += `<circle cx="${G1.x0 + i * (G1.x1 - G1.x0) / 9}" cy="${G1.y}" r="8" style="fill:${ink}"/>`;
    } else if (dim === 2) {
      s += `<rect x="${G2.x0 - 8}" y="${G2.y0 - 8 + 4}" width="${G2.s + 16}" height="${G2.s + 16 - 8}" style="fill:none;stroke:var(--rule-light);stroke-width:1.5"/>`;
      const sp = (G2.s - 8) / 9;
      for (let i = 0; i < 10; i++) for (let j = 0; j < 10; j++) s += `<circle cx="${G2.x0 + i * (G2.s / 9)}" cy="${G2.y0 + 4 + j * sp}" r="4.6" style="fill:${ink}"/>`;
    } else {
      cubeEdges().forEach(([a, b]) => { s += `<line x1="${a[0]}" y1="${a[1]}" x2="${b[0]}" y2="${b[1]}" style="stroke:var(--rule-light);stroke-width:1.5"/>`; });
      // all 1,000 points, back layers first: the three faces we see are solid, the points inside and behind faint
      for (let k = 9; k >= 0; k--) for (let i = 0; i < 10; i++) for (let j = 0; j < 10; j++) {
        const [x, y] = at3(i / 9, j / 9, k / 9), face = k === 0 || j === 9 || i === 9;
        s += `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${face ? 2.7 : 1.7}" style="fill:${ink};opacity:${face ? 1 : .22}"/>`;
      }
    }
    return `<svg viewBox="0 0 320 180" aria-hidden="true">${s}</svg>`;
  }
  const CLOUD_N = 100, CLOUD_SEED = 9;
  const ERR = `<math><mtext>error</mtext><mo>∝</mo><mfrac><mn>1</mn><msqrt><mi>n</mi></msqrt></mfrac></math>`;

  Deck.addSlide({
    id: "mc-grid", section: "mc", steps: 2, secs: 19,
    title: "Monte Carlo escapes the curse of dimensionality",
    subtitle: "A grid’s points explode with every dimension. Random points don’t.",
    sources: "adapted from The Synthetic Mind (2026); own illustration",
    notes: "A grid won't work: a year of our three stocks takes 756 random numbers, so 756 dimensions. [→] Ten values for each would already need ten to the power of 756 evaluations. [→] Monte Carlo's error shrinks at the same speed, however many dimensions there are.",
    render(body) {
      body.closest(".slide").classList.add("mc-tw");
      const cell = (dim, n, d) => `<div class="mc-gc" style="--d:${d}"><p class="mc-gh">${dim} dimension${dim > 1 ? "s" : ""}</p>${gridSVG(dim)}<div class="mc-gn"><b>${fmt(n, 0)}</b><span>points</span></div></div>`;
      const cl = (k, d) => `<div class="cl"><canvas data-k="${k}"></canvas><p>${CLOUD_N} RANDOM POINTS</p></div>`;
      body.innerHTML = `
        <div class="mc-gr">
          <p class="mc-gr-s">One random number is one dimension. A simulated year of three stocks needs ${fmt(DIMS, 0)} of them, so it is <b class="g">a single point in ${fmt(DIMS, 0)}-dimensional space</b>.</p>
          <section class="panel"><h3 class="panel-title">A grid: the points multiply with every dimension</h3>
            <div class="mc-gcells">
              ${cell(1, 10, 0)}<div class="mc-gx mc-gc" style="--d:1">× 10 →</div>${cell(2, 100, 1)}<div class="mc-gx mc-gc" style="--d:2">× 10 →</div>${cell(3, 1000, 2)}<div class="mc-gx mc-gc" style="--d:3">…</div>
              <div class="mc-gc" style="--d:3"><p class="mc-gh">${fmt(DIMS, 0)} dimensions</p>
                <div class="mc-g756"><span class="d">…</span><span class="s">${NSTOCK} stocks × ${NDAY} days</span><span class="t" data-step="1">ten values for each</span></div>
                <div class="mc-gn"><b class="mc-gxn q">?</b><span>points</span></div></div>
            </div></section>
          ${U.term({ cls: "mc-term mc-gt", fn: "MCSIM", title: "RANDOM POINTS · THE SAME n IN ANY DIMENSION",
            body: `${cl(1)}<div></div>${cl(2)}<div></div>${cl(3)}<div></div><div class="cl f"><span>${fmt(DIMS, 0)} dimensions:<br>still ${CLOUD_N} points</span><div class="mc-gmc"><span>Monte Carlo:</span>${ERR}</div><span>in any dimension</span></div>` }).replace('class="term ', 'data-step="2" class="term ')}
        </div>`;
      const wrap = body.querySelector(".mc-gr"), cnt = body.querySelector(".mc-gxn"), cvs = [...body.querySelectorAll(".mc-gt canvas")];
      // the clouds: seeded uniform points, the same stream every time
      const rnd = U.rng(CLOUD_SEED), pts = Array.from({ length: CLOUD_N }, () => [rnd(), rnd(), rnd()]);
      const p3 = pts.map((p, i) => ({ p, i })).sort((a, b) => b.p[2] - a.p[2]);   // 3D: far points first
      let shown = 0, a = null, xa = null, cur = 0;
      function setCount(e) {   // e: the exponent shown, or null for "?"
        cnt.classList.toggle("q", e === null); cnt.classList.toggle("x", e !== null);
        cnt.innerHTML = e === null ? "?" : `10<sup>${e}</sup>`;
      }
      function drawClouds() {
        const text = css("--term-text"), line = css("--term-line"), muted = css("--term-muted");
        cvs.forEach(cv => {
          const c = U.canvas(cv); if (!c) return;
          const { ctx, w, h } = c, k = +cv.dataset.k, s = Math.min(w / 320, h / 180);
          ctx.save(); ctx.translate((w - 320 * s) / 2, (h - 180 * s) / 2); ctx.scale(s, s);
          ctx.fillStyle = text; ctx.strokeStyle = text;
          if (k === 1) {
            ctx.strokeStyle = muted; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(10, G1.y); ctx.lineTo(310, G1.y); ctx.stroke();
            ctx.strokeStyle = text; ctx.lineWidth = 2; ctx.globalAlpha = .8;
            for (let i = 0; i < shown; i++) { const x = G1.x0 + pts[i][0] * (G1.x1 - G1.x0); ctx.beginPath(); ctx.moveTo(x, G1.y - 13); ctx.lineTo(x, G1.y + 13); ctx.stroke(); }
          } else if (k === 2) {
            ctx.strokeStyle = line; ctx.lineWidth = 1.5; ctx.strokeRect(G2.x0 - 8, G2.y0 - 4, G2.s + 16, G2.s + 8);
            ctx.globalAlpha = .9;
            for (let i = 0; i < shown; i++) { ctx.beginPath(); ctx.arc(G2.x0 + pts[i][0] * G2.s, G2.y0 + pts[i][1] * G2.s, 3.8, 0, 7); ctx.fill(); }
          } else {
            ctx.strokeStyle = line; ctx.lineWidth = 1.5;
            cubeEdges().forEach(([a, b]) => { ctx.beginPath(); ctx.moveTo(a[0], a[1]); ctx.lineTo(b[0], b[1]); ctx.stroke(); });
            p3.forEach(({ p, i }) => { if (i >= shown) return; const [x, y] = at3(p[0], p[1], p[2]); ctx.globalAlpha = 1 - p[2] * .5; ctx.beginPath(); ctx.arc(x, y, 3.4 - p[2] * .9, 0, 7); ctx.fill(); });
          }
          ctx.restore();
        });
      }
      function step(i, o) {
        if (a) { a.cancel(); a = null; }
        if (xa) { xa.cancel(); xa = null; }
        cur = i;
        // step 0: the four grids come in one after another when the slide comes in forwards
        if (i === 0 && fwd(o)) { wrap.classList.remove("in"); void wrap.offsetWidth; }
        wrap.classList.add("in");
        // click 1: the count of the 756-dimensional grid jumps to 10^756
        if (i < 1) setCount(null);
        else if (i === 1 && fwd(o)) xa = U.anim(1300, k => setCount(Math.round(3 + (DIMS - 3) * k)), { ease: U.ease.inOut, done: () => { xa = null; } });
        else setCount(DIMS);
        // click 2: the random points
        if (i < 2) { shown = 0; drawClouds(); return; }
        if (i === 2 && fwd(o)) { shown = 0; a = U.anim(1500, k => { shown = Math.round(CLOUD_N * k); drawClouds(); }, { ease: U.ease.lin, done: () => { a = null; } }); return; }
        shown = CLOUD_N; drawClouds();
      }
      return {
        resize() { U.tightenRoots(body); drawClouds(); },
        step,
        // a cancelled count or cloud ends complete
        leave() { if (a || xa) step(cur, { instant: true }); }
      };
    }
  });

  // =====================================================================================================
  // 4) How precise is Monte Carlo? π with darts
  // =====================================================================================================
  // Seed 2434 (searched offline with Deck.util.rng): the first 5 darts land 3 inside the circle, and the first 10,000
  // (which include those 5) land 7,875 inside. One dart = two draws, x then y, each uniform on [−1, 1].
  const DART = { seed: 2434, few: 5, n: 10000, flyMs: 260, gapMs: 330, firstMs: 250, ringMs: 450, fillMs: 2000 };
  const darts = (() => {
    const r = U.rng(DART.seed), x = new Float32Array(DART.n), y = new Float32Array(DART.n), inside = new Uint8Array(DART.n), cum = new Int32Array(DART.n + 1);
    for (let i = 0; i < DART.n; i++) { x[i] = 2 * r() - 1; y[i] = 2 * r() - 1; inside[i] = x[i] * x[i] + y[i] * y[i] <= 1 ? 1 : 0; cum[i + 1] = cum[i] + inside[i]; }
    return { x, y, inside, cum };
  })();
  const FEW_IN = darts.cum[DART.few], ALL_IN = darts.cum[DART.n];
  if (FEW_IN !== 3 || ALL_IN !== 7875) console.error("mc-pi: the seeded darts no longer give 3 of 5 and 7,875 of 10,000 (the script's numbers)");
  const PI_FEW = 4 * FEW_IN / DART.few, PI_ALL = 4 * ALL_IN / DART.n;
  const P_IN = ALL_IN / DART.n, SE = 4 * Math.sqrt(P_IN * (1 - P_IN) / DART.n), CI = [PI_ALL - 1.96 * SE, PI_ALL + 1.96 * SE];
  const landAt = i => DART.firstMs + i * DART.gapMs;   // when dart i of the first five lands (ms after the click)
  const FLY_MS = landAt(DART.few - 1) + DART.ringMs;
  const piTxt = n => n ? fmt(4 * darts.cum[n] / n, n <= DART.few ? 2 : 3) : "–";

  Deck.addSlide({
    id: "mc-pi", section: "mc", steps: 2, secs: 33,
    title: "How precise is Monte Carlo?",
    subtitle: "Because π is already known, we can measure the error exactly.",
    sources: "own simulation; adapted from The Synthetic Mind (2026), 3:00–5:12",
    notes: "Take pi. A circle of radius one inside a square of side two covers pi over four of its area. So throw random darts: four times the share inside estimates pi. [→] Five darts, three inside: 2.4. [→] Ten thousand: 3.15, with a ninety-five percent confidence interval from 3.12 to 3.18. The error falls with one over the square root of n, so halving it takes four times the darts. That's why our price comes with an interval, too.",
    render(body) {
      body.innerHTML = `
        <div class="mc-pi">
          ${U.term({ cls: "mc-term", fn: "MCSIM", title: "RANDOM DARTS ON THE SQUARE", meta: `<span class="t-green">● INSIDE</span> &nbsp;<span class="t-red">● OUTSIDE</span>`, body: "<canvas></canvas>",
            stats: `<div><div class="k">Darts</div><div class="v mc-v0">0</div></div><div><div class="k">Inside</div><div class="v mc-v1">0</div></div><div><div class="k"><span style="text-transform:none">π</span> ≈ 4 × inside / darts</div><div class="v mc-v2">–</div></div><div><div class="k">95% interval</div><div class="v mc-v3">–</div></div>` })}
          <div class="mc-pi-r">
            <div class="fbox mc-pi-f"><span class="chip">SHARE OF THE AREA</span>
              <math display="block"><mtext>share inside</mtext><mo>=</mo><mfrac><mrow><mi>π</mi><mo>·</mo><msup><mn>1</mn><mn>2</mn></msup></mrow><mrow><mn>2</mn><mo>·</mo><mn>2</mn></mrow></mfrac><mo>=</mo><mfrac><mi>π</mi><mn>4</mn></mfrac></math>
              <math display="block"><mi>π</mi><mo>≈</mo><mn>4</mn><mo>×</mo><mfrac><mtext>darts inside</mtext><mtext>darts thrown</mtext></mfrac></math></div>
            <div class="mc-pr" data-step="1"><b>${fmt(DART.few, 0)} darts</b><span>${fmt(FEW_IN, 0)} inside</span><span class="v">4 × ${FEW_IN}/${DART.few} = ${fmt(PI_FEW, 2)}</span></div>
            <div class="mc-pr last" data-step="2"><b>${fmt(DART.n, 0)} darts</b><span>${fmt(ALL_IN, 0)} inside</span><span class="v">4 × ${fmt(ALL_IN, 0)}/${fmt(DART.n, 0)} = ${fmt(PI_ALL, 3)}</span></div>
            <div class="fbox mc-pi-ci" data-step="2" style="--d:2"><span class="chip">95% CONFIDENCE INTERVAL</span>
              <math display="block"><mn>${fmt(PI_ALL, 3)}</mn><mo>±</mo><mn>1.96</mn><mo>×</mo><mn>${fmt(SE, 4)}</mn><mo>=</mo><mn>${fmt(CI[0], 2)}</mn><mtext>&nbsp;to&nbsp;</mtext><mn>${fmt(CI[1], 2)}</mn></math>
              <p class="mc-cap">standard error <math><mn>4</mn><msqrt><mi>p</mi><mo stretchy="false">(</mo><mn>1</mn><mo>−</mo><mi>p</mi><mo stretchy="false">)</mo><mo>/</mo><mi>n</mi></msqrt><mo>=</mo><mn>${fmt(SE, 4)}</mn></math> with <math><mi>p</mi><mo>=</mo><mn>${fmt(ALL_IN, 0)}</mn><mo>/</mo><mn>${fmt(DART.n, 0)}</mn></math></p></div>
            <div class="mc-key" data-step="2" style="--d:4"><span class="hl"><math><mtext>error</mtext><mo>∝</mo><mn>1</mn><mo>/</mo><msqrt><mi>n</mi></msqrt></math>:</span> half the error takes 4× the darts. That's why our price comes with an interval, too.</div>
          </div>
        </div>`;
      const cv = body.querySelector("canvas"), vs = [0, 1, 2, 3].map(i => body.querySelector(".mc-v" + i));
      // st.n: darts on the board; st.t: ms into the flight of the first five (Infinity: all landed)
      let st = { n: 0, t: Infinity }, a = null, cur = 0;
      function landed() { if (st.t === Infinity) return st.n; let k = 0; while (k < DART.few && landAt(k) <= st.t) k++; return k; }
      function draw() {
        const n = landed();
        vs[0].textContent = fmt(n, 0); vs[1].textContent = fmt(darts.cum[n], 0); vs[2].textContent = piTxt(n);
        vs[3].textContent = n === DART.n ? fmt(CI[0], 2) + "–" + fmt(CI[1], 2) : "–";
        const c = U.canvas(cv); if (!c) return;
        const { ctx, w, h } = c;
        const S = Math.min(w - 140, h - 92), cx = w / 2, cy = h / 2 - 10;
        const X = x => cx + x * S / 2, Y = y => cy - y * S / 2;
        // inside: HSG green; outside: black; the circle in dark green, the square in grey, on the white panel
        const green = css("--green"), out = css("--ink"), gInk = css("--green-ink"), text = css("--term-text"), muted = css("--term-muted");
        ctx.fillStyle = "rgba(0,128,47,.05)"; ctx.beginPath(); ctx.arc(cx, cy, S / 2, 0, 7); ctx.fill();
        // the darts: the many as small squares, the first five as big dots on top
        for (let i = DART.few; i < n; i++) { const isIn = darts.inside[i]; ctx.fillStyle = isIn ? green : out; ctx.globalAlpha = isIn ? .8 : .62; ctx.fillRect(X(darts.x[i]) - 1.3, Y(darts.y[i]) - 1.3, 2.6, 2.6); }
        ctx.globalAlpha = 1;
        ctx.strokeStyle = muted; ctx.lineWidth = 2; ctx.strokeRect(X(-1), Y(1), S, S);
        ctx.strokeStyle = gInk; ctx.lineWidth = 2.6; ctx.beginPath(); ctx.arc(cx, cy, S / 2, 0, 7); ctx.stroke();
        for (let i = 0; i < Math.min(DART.few, st.t === Infinity ? n : DART.few); i++) {
          const x = X(darts.x[i]), y = Y(darts.y[i]), col = darts.inside[i] ? green : out, since = st.t === Infinity ? Infinity : st.t - landAt(i);
          if (since < -DART.flyMs) continue;
          if (since < 0) {   // on its way: comes towards the board, big and faint, then small and solid
            const k = 1 + since / DART.flyMs, r = 30 - 21 * k;
            ctx.globalAlpha = .25 + .75 * k; ctx.fillStyle = col; ctx.beginPath(); ctx.arc(x, y, r, 0, 7); ctx.fill(); ctx.globalAlpha = 1;
            continue;
          }
          if (since < DART.ringMs) {   // the impact ring
            const k = since / DART.ringMs; ctx.strokeStyle = col; ctx.globalAlpha = 1 - k; ctx.lineWidth = 3;
            ctx.beginPath(); ctx.arc(x, y, 9 + 26 * k, 0, 7); ctx.stroke(); ctx.globalAlpha = 1;
          }
          ctx.fillStyle = col; ctx.beginPath(); ctx.arc(x, y, 9, 0, 7); ctx.fill();
          ctx.strokeStyle = "#fff"; ctx.lineWidth = 2.5; ctx.stroke();   // a white ring sets the five apart from the many
        }
        // labels on white boxes: side 2 under the square, radius 1 from the centre
        ctx.font = "700 20px " + U.F.mono; ctx.textBaseline = "middle"; ctx.textAlign = "center";
        const yb = Y(-1) + 26;
        ctx.strokeStyle = text; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(X(-1), yb); ctx.lineTo(X(1), yb); ctx.moveTo(X(-1), yb - 7); ctx.lineTo(X(-1), yb + 7); ctx.moveTo(X(1), yb - 7); ctx.lineTo(X(1), yb + 7); ctx.stroke();
        const lab = (t, x, y) => { const tw = ctx.measureText(t).width; ctx.fillStyle = "#fff"; ctx.fillRect(x - tw / 2 - 10, y - 14, tw + 20, 28); ctx.fillStyle = text; ctx.fillText(t, x, y); };
        lab("SIDE 2", cx, yb);
        const ang = -Math.PI / 5, ex = cx + Math.cos(ang) * S / 2, ey = cy + Math.sin(ang) * S / 2;
        ctx.strokeStyle = gInk; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(ex, ey); ctx.stroke();
        ctx.fillStyle = gInk; ctx.beginPath(); ctx.arc(cx, cy, 4.5, 0, 7); ctx.fill();
        lab("RADIUS 1", cx + Math.cos(ang) * S / 4, cy + Math.sin(ang) * S / 4 - 26);
      }
      function step(i, o) {
        if (a) { a.cancel(); a = null; }
        cur = i;
        if (i === 0) { st = { n: 0, t: Infinity }; draw(); return; }
        if (i === 1) {
          if (fwd(o)) { st = { n: 0, t: 0 }; a = U.anim(FLY_MS, k => { st.t = k * FLY_MS; draw(); }, { ease: U.ease.lin, done: () => { a = null; st = { n: DART.few, t: Infinity }; draw(); } }); return; }
          st = { n: DART.few, t: Infinity }; draw(); return;
        }
        if (fwd(o)) { st = { n: DART.few, t: Infinity }; a = U.anim(DART.fillMs, k => { st.n = DART.few + Math.round((DART.n - DART.few) * k); draw(); }, { ease: U.ease.inOut, done: () => { a = null; } }); return; }
        st = { n: DART.n, t: Infinity }; draw();
      }
      return {
        resize() { U.tightenRoots(body); draw(); },
        step,
        // cancelled darts end as the step's full board (also when the 10,000 had not started to fill in)
        leave() { if (a) step(cur, { instant: true }); }
      };
    }
  });

  // =====================================================================================================
  // 5) Geometric Brownian motion: building one simulated year
  // =====================================================================================================
  // one simulated year = the three stocks together (Deck.util.simBRC with our Excel's inputs: vols, dividends,
  // correlations, r), as % of the starting level. Seed 73: path 1 stays between 75% and 125% for all three stocks.
  const PA = { seed: 73, ten: 10, many: 500, dayMs: 2200, tenMs: 1400, manyMs: 2200 };
  const STOCK_VARS = ["--c-adbe", "--c-aapl", "--c-msft"], STOCK_TEXT = ["--c-adbe-light", "--c-aapl-light", "--c-msft-light"];
  const CLOUD_A = [.07, .075, .13];   // the hundreds: Microsoft's light green needs a little more to show on white
  const GBM = `<math display="block"><mi>d</mi><msub><mi>S</mi><mi>t</mi></msub><mo>=</mo><mo stretchy="false">(</mo><mi>r</mi><mo>−</mo><mi>q</mi><mo stretchy="false">)</mo><mo>·</mo><msub><mi>S</mi><mi>t</mi></msub><mi>d</mi><mi>t</mi><mo>+</mo><mi>σ</mi><mo>·</mo><msub><mi>S</mi><mi>t</mi></msub><mi>d</mi><msub><mi>W</mi><mi>t</mi></msub></math>`;

  Deck.addSlide({
    id: "mc-paths", section: "mc", steps: 2, secs: 18,
    title: "Geometric Brownian motion: building one simulated year",
    subtitle: `${NDAY} daily moves on each of three stocks, ${fmt(DIMS, 0)} random numbers per path`,
    lecture: "Lecture 4, slide 15",
    sources: "Boyle (1977); Arnold (2026), slide 15; own simulation",
    notes: "In 1977, Phelim Boyle brought Monte Carlo to option pricing. For us, each dart becomes a whole year: 252 random daily moves, on three stocks at once. [→] The lecture calls this geometric Brownian motion. [→] Now, let's build it in Excel.",
    render(body) {
      twoLines(body);
      body.innerHTML = `
        <div class="mc-pa">
          <div class="mc-pa-t">
            <div class="mc-pa-y"><b>1977</b><p>Phelim Boyle brings Monte Carlo to option pricing</p></div>
            <div class="card mc-pa-m"><p>Each dart becomes a whole year:</p><b>1 path = ${NDAY} random daily moves<br><span class="x">×</span> ${NSTOCK} stocks</b></div>
            <div class="fbox mc-pa-g" data-step="1"><span class="chip">GEOMETRIC BROWNIAN MO<span class="mc-kern">TION</span></span>${GBM}<p class="mc-cap">the lecture's model for a stock price</p>${lectureNote(`<math>${RF}</math> and <math><mi>δ</mi></math>`)}</div>
          </div>
          ${U.term({ cls: "mc-term", fn: "GBM", title: "THREE STOCKS AT ONCE · DAILY STEPS · % OF START", meta: `<span class="mc-tag">OUR EXCEL'S INPUTS</span>`, body: "<canvas></canvas>",
            stats: `<div><div class="k">Paths (simulated years)</div><div class="v mc-v0">1</div></div><div><div class="k">Random numbers per path <em>· ${NDAY} days × ${NSTOCK} stocks</em></div><div class="v">${fmt(DIMS, 0)}</div></div><div><div class="k">Random numbers drawn</div><div class="v mc-v1">0</div></div>` })}
        </div>`;
      const cv = body.querySelector("canvas"), vs = [0, 1].map(i => body.querySelector(".mc-v" + i));
      const XP = Object.assign({}, B, XL.model);
      let sims = null, gen = null;
      function scen(k) {   // seeded scenarios, generated as far as needed (never at page load)
        if (!gen) { gen = U.normal(U.rng(PA.seed)); sims = []; }
        while (sims.length < k) sims.push(U.simBRC(gen, XP).paths);
        return sims;
      }
      // st.day: how far path 1 is drawn; st.ten: how far paths 2–10 are drawn (days); st.n: paths in all (full ones)
      let st = { day: 0, ten: 0, n: 1 }, a = null, cur = 0;
      const layer = { cv: document.createElement("canvas"), key: "", n: PA.ten };   // the hundreds, drawn once into a layer
      const top = { cv: document.createElement("canvas"), key: "" };   // the 100% lines, the ten and path 1: drawn again only when they change
      function frames(w, h) { const cw = w / 3; return [0, 1, 2].map(k => ({ x: Math.round(k * cw + 86), y: 52, w: Math.round(cw - 112), h: h - 52 - 60 })); }
      const yOpt = { yMin: 0, yMax: 250, yTicks: [0, 50, 100, 150, 200, 250], yFmt: v => v + "%" };
      // off: shifts the vertices by a fraction of a day, so hundreds of paths do not line up in vertical stripes
      function line(ctx, ax, p, upto, off) { const o = off || 0; ctx.beginPath(); ctx.moveTo(ax.X(0), ax.Y(p[0] * 100)); for (let d = 1; d <= upto; d++) ctx.lineTo(ax.X(d) + o, ax.Y(p[d] * 100)); ctx.stroke(); }
      function draw() {
        const paths = st.n > 1 ? st.n : st.ten ? PA.ten : 1;
        vs[0].textContent = fmt(paths, 0);
        vs[1].textContent = fmt(st.n > PA.ten ? st.n * DIMS : st.ten ? DIMS + (PA.ten - 1) * st.ten * NSTOCK : st.day * NSTOCK, 0);
        const c = U.canvas(cv); if (!c) return;
        const { ctx, w, h } = c, F = frames(w, h), cols = STOCK_VARS.map(v => css(v)), txt = STOCK_TEXT.map(v => css(v)), muted = css("--term-muted");
        const S = scen(Math.max(st.n, st.ten ? PA.ten : 1));
        const axs = F.map((f, k) => U.axes(ctx, f, Object.assign({}, yOpt, MONTHS, k === 1 ? { xLabel: "MONTH" } : {})));
        // the hundreds: added to the layer as they come, then copied in one go
        const key = cv.width + "x" + cv.height;
        if (key !== layer.key || layer.n > st.n) { layer.cv.width = cv.width; layer.cv.height = cv.height; layer.key = key; layer.n = PA.ten; }
        if (st.n > layer.n) {
          const g = layer.cv.getContext("2d"), r = cv.width / w;
          g.setTransform(r, 0, 0, r, 0, 0); g.lineJoin = "round"; g.lineWidth = 1;
          F.forEach((f, k) => {
            g.save(); g.beginPath(); g.rect(f.x, f.y, f.w, f.h); g.clip(); g.strokeStyle = cols[k]; g.globalAlpha = CLOUD_A[k];
            const stepW = axs[k].X(1) - axs[k].X(0);
            for (let j = layer.n; j < st.n; j++) line(g, axs[k], S[j][k], NDAY, ((j * 0.6180339) % 1) * stepW);
            g.restore();
          });
          layer.n = st.n;
        }
        if (st.n > PA.ten) { ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.drawImage(layer.cv, 0, 0); ctx.restore(); }
        const tkey = key + "|" + st.day + "|" + st.ten;
        if (tkey !== top.key) {   // while the hundreds come in (click 2) this part stays the same
          top.cv.width = cv.width; top.cv.height = cv.height; top.key = tkey;
          const g = top.cv.getContext("2d"), r = cv.width / w;
          g.setTransform(r, 0, 0, r, 0, 0);
          F.forEach((f, k) => {
            const ax = axs[k];
            g.save(); g.setLineDash([7, 7]); g.strokeStyle = muted; g.lineWidth = 1.4;
            g.beginPath(); g.moveTo(f.x, ax.Y(100)); g.lineTo(f.x + f.w, ax.Y(100)); g.stroke(); g.restore();
            g.save(); g.beginPath(); g.rect(f.x, f.y, f.w, f.h); g.clip(); g.lineJoin = "round"; g.strokeStyle = cols[k];
            if (st.ten) { g.globalAlpha = .5; g.lineWidth = 1.4; for (let j = 1; j < PA.ten; j++) line(g, ax, S[j][k], st.ten); }
            g.globalAlpha = 1; g.lineWidth = 2.8; g.strokeStyle = txt[k]; if (st.day) line(g, ax, S[0][k], st.day);
            g.restore();
          });
        }
        ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.drawImage(top.cv, 0, 0); ctx.restore();
        F.forEach((f, k) => {
          const ax = axs[k];
          ctx.fillStyle = css("--ink"); ctx.beginPath(); ctx.arc(ax.X(0), ax.Y(100), 4.5, 0, 7); ctx.fill();
          ctx.font = "700 19px " + U.F.mono; ctx.textAlign = "left"; ctx.textBaseline = "middle"; ctx.fillStyle = txt[k];
          ctx.fillText(`${B.names[k].toUpperCase()} (${B.tickers[k]}) · σ ${fmt(XP.sigma[k] * 100, 0)}%`, f.x, 22);
        });
      }
      function step(i, o) {
        if (a) { a.cancel(); a = null; }
        cur = i;
        if (i === 0) {
          if (fwd(o)) { st = { day: 0, ten: 0, n: 1 }; a = U.anim(PA.dayMs, k => { st.day = Math.round(k * NDAY); draw(); }, { ease: U.ease.lin, done: () => { a = null; } }); return; }
          st = { day: NDAY, ten: 0, n: 1 }; draw(); return;
        }
        if (i === 1) {
          if (fwd(o)) { st = { day: NDAY, ten: 0, n: 1 }; a = U.anim(PA.tenMs, k => { st.ten = Math.round(k * NDAY); draw(); }, { ease: U.ease.inOut, done: () => { a = null; } }); return; }
          st = { day: NDAY, ten: NDAY, n: 1 }; draw(); return;
        }
        if (fwd(o)) { st = { day: NDAY, ten: NDAY, n: PA.ten }; a = U.anim(PA.manyMs, k => { st.n = PA.ten + Math.round((PA.many - PA.ten) * k); draw(); }, { ease: U.ease.inOut, done: () => { a = null; } }); return; }
        st = { day: NDAY, ten: NDAY, n: PA.many }; draw();
      }
      return {
        resize() { U.tightenRoots(body); draw(); },
        step,
        // a cancelled run ends as the step's finished picture
        leave() { if (a) step(cur, { instant: true }); }
      };
    }
  });
})();
