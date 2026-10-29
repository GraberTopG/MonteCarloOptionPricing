/* Recap of the lecture's Black-Scholes formula (Lecture 4, slide 7, redrawn) and what it assumes; it opens the
   "why Monte Carlo" part of the video (brc-why-mc in 02-product.js follows it through after:).
   Owner: script + web-app team. Classes are prefixed .lec- */
(function () {
  const U = Deck.util;

  Deck.addStyle(`
    .slide[data-id="bs-recap"] .s-title,.slide[data-id="bt-recap"] .s-title{font-size:50px;white-space:nowrap}   /* the long title on one line */
    .lec{display:grid;grid-template-columns:1fr 600px;gap:56px;height:100%}
    .lec-l{display:flex;flex-direction:column;min-width:0}
    .lec-l .label{margin-bottom:22px}
    .lec .fbox{padding:24px 24px 20px}
    .lec .fbox math{font-size:40px}
    .lec-cp{display:grid;gap:34px}
    .lec-d{display:grid;grid-template-columns:1fr 1fr;gap:28px;margin-top:28px}
    .lec-d .fbox{padding:14px 18px;display:grid;place-items:center}
    .lec-d .fbox math{font-size:36px}
    .lec-in{margin-top:28px}
    .lec-in .minor{margin-bottom:12px}
    .lec-vars{display:grid;grid-template-columns:auto 1fr;gap:6px 48px}   /* the left column as wide as its longest line */
    .lec-vars .vars{grid-template-columns:96px 1fr;font-size:26px;gap:0 14px}
    .lec-vars .vars math{font-size:28px}
    .lec-r{display:flex;flex-direction:column;justify-content:space-between;gap:30px;height:100%;padding-bottom:4px}
    .lec-intp{margin-top:16px;padding:40px 30px 20px;border-color:var(--rule)}
    .lec-intp .panel-title{color:var(--ink)}
    .lec-intp p{margin:0 0 12px;font:22px/1.35 var(--f-body);color:var(--ink)}
    .lec-intp p:last-child{margin:0}
    .lec-intp b{display:block;font:700 italic 26px/1.2 var(--f-math);color:var(--green-ink)}
    .lec-panel{padding:44px 30px 22px}
    .lec-smile{margin-top:14px;background:#fff;border-radius:10px}
    .lec-smile svg{display:block;width:100%;height:auto}
    .lec-smile .ax{fill:none;stroke:var(--rule);stroke-width:2}
    .lec-smile .mkt{fill:none;stroke:var(--ink);stroke-width:4;stroke-linecap:round}
    .lec-smile .bs{fill:none;stroke:var(--green);stroke-width:4;stroke-dasharray:10 7}
    .lec-smile text{font:700 18px var(--f-body)} .lec-smile .tm{fill:var(--ink)} .lec-smile .tb{fill:var(--green)} .lec-smile .ta{fill:var(--muted);font-weight:400;font-size:16px}
    .lec-int{margin:8px 0 0;font:20px/1.3 var(--f-body);color:var(--ink);text-align:left}
    .lec-int b{font-family:var(--f-math);font-style:italic}
    .lec-why{margin:22px 0 0;font:24px/1.35 var(--f-body);color:var(--ink)} .lec-why b{color:var(--green)}
    /* v2: formulas left, all variables right, the reasons in one wide box underneath */
    .lec.v2{grid-template-columns:1fr 560px;grid-template-rows:auto 1fr;gap:28px 40px}
    .lec.v2 .lec-l .label{margin-bottom:16px}
    .lec.v2 .lec-cp{gap:34px} .lec.v2 .fbox{padding:22px 24px 18px} .lec.v2 .fbox math{font-size:40px}
    .lec.v2 .lec-d{margin-top:28px} .lec.v2 .lec-d .fbox{padding:14px 18px} .lec.v2 .lec-d .fbox math{font-size:36px}
    .lec.v2 .lec-intp{margin-top:16px;padding:34px 26px 16px;align-self:start}
    .lec-vars1 .vars{display:grid;grid-template-columns:100px 1fr;gap:0 12px;font:22px/1.3 var(--f-body);margin:0 0 9px;align-items:center}
    .lec-vars1 .vars math{font-size:24px}
    .lec-bot{grid-column:1/3;align-self:start;margin-top:30px;padding:36px 30px 18px}
    .lec-bot ul{grid-template-columns:1fr 1fr;gap:24px}
    .lec-bot .icard{font:22px/1.3 var(--f-body);padding:12px 20px 12px 16px}
    .lec-bot .icard b{font-size:27px}
    .lec-why2{display:flex;align-items:center;justify-content:space-between;gap:16px;margin-top:18px;padding:0 4px;font:25px/1.3 var(--f-body);color:var(--ink)}
    .lec-why2 b{color:var(--green)}
    .lec-why2 .ar{flex:1;min-width:60px;height:3px;background:var(--ink);position:relative;margin:0 4px}
    .lec-why2 .ar::after{content:"";position:absolute;right:-2px;top:-7px;border:8.5px solid transparent;border-left:13px solid var(--ink);border-right:0}
    .lec-why2 .no{flex:none;display:flex;align-items:center;gap:12px;color:var(--ink);font:700 27px/1 var(--f-head)}
    .lec-why2 .x{width:40px;height:40px;border-radius:50%;background:var(--red-ink);color:#fff;display:grid;place-items:center;font:800 22px/1 var(--f-body)}
    .lec-panel ul{list-style:none;margin:0;padding:0;display:grid;gap:18px}
    .lec-panel .icard .num{width:46px;height:46px;font-size:22px}
    .lec-panel .icard{font:24px/1.3 var(--f-body);padding:16px 22px 16px 16px}
    .lec-panel .icard b{display:block;font:700 30px/1.2 var(--f-head);color:var(--ink)}
  `);

  // Lecture 4, slide 7 (redrawn): call, put, d1 and d2 exactly as the lecture writes them (no dividend yield)
  const C0 = `<math display="block"><msub><mi>C</mi><mn>0</mn></msub><mo>=</mo><msub><mi>S</mi><mn>0</mn></msub><mi>N</mi><mo stretchy="false">(</mo><msub><mi>d</mi><mn>1</mn></msub><mo stretchy="false">)</mo><mo>−</mo><mi>K</mi><msup><mi>e</mi><mrow><mo>−</mo><mi>r</mi><mi>T</mi></mrow></msup><mi>N</mi><mo stretchy="false">(</mo><msub><mi>d</mi><mn>2</mn></msub><mo stretchy="false">)</mo></math>`;
  const P0 = `<math display="block"><msub><mi>P</mi><mn>0</mn></msub><mo>=</mo><mi>K</mi><msup><mi>e</mi><mrow><mo>−</mo><mi>r</mi><mi>T</mi></mrow></msup><mrow><mo>(</mo><mn>1</mn><mo>−</mo><mi>N</mi><mo stretchy="false">(</mo><msub><mi>d</mi><mn>2</mn></msub><mo stretchy="false">)</mo><mo>)</mo></mrow><mo>−</mo><msub><mi>S</mi><mn>0</mn></msub><mrow><mo>(</mo><mn>1</mn><mo>−</mo><mi>N</mi><mo stretchy="false">(</mo><msub><mi>d</mi><mn>1</mn></msub><mo stretchy="false">)</mo><mo>)</mo></mrow></math>`;
  const D1 = `<math display="block"><msub><mi>d</mi><mn>1</mn></msub><mo>=</mo><mfrac><mrow><mi>ln</mi><mrow><mo>(</mo><mfrac><msub><mi>S</mi><mn>0</mn></msub><mi>K</mi></mfrac><mo>)</mo></mrow><mo>+</mo><mrow><mo>(</mo><mi>r</mi><mo>+</mo><mfrac><msup><mi>σ</mi><mn>2</mn></msup><mn>2</mn></mfrac><mo>)</mo></mrow><mi>T</mi></mrow><mrow><mi>σ</mi><msqrt><mi>T</mi></msqrt></mrow></mfrac></math>`;
  const D2 = `<math display="block"><msub><mi>d</mi><mn>2</mn></msub><mo>=</mo><msub><mi>d</mi><mn>1</mn></msub><mo>−</mo><mi>σ</mi><msqrt><mi>T</mi></msqrt></math>`;
  const v = (sym, txt) => `<div class="vars"><span><math>${sym}</math></span><span>${txt}</span></div>`;

  Deck.addSlide({
    id: "bs-recap", section: "why", steps: 1, secs: 10,
    title: "Recap: Black-Scholes and why it can't price a Multi-BRC",
    subtitle: "An exact formula for vanilla options, but only for one underlying and path-<u>in</u>dependent options",
    lecture: "Lecture 4, slide 7",
    sources: "Arnold (2026); Black & Scholes (1973); Merton (1973)",
    notes: `So why not just use Black-Scholes? [→] It's a great formula, but it only works for one stock, and only when the final price matters.`,
    render(body) {
      body.innerHTML = `
        <div class="lec v2">
          <div class="lec-l">
            <p class="label">Black-Scholes-Merton formula for European options</p>
            <div class="lec-cp">
              <div class="fbox"><span class="chip">CALL</span>${C0}</div>
              <div class="fbox"><span class="chip">PUT</span>${P0}</div>
            </div>
            <div class="lec-d"><div class="fbox gray">${D1}</div><div class="fbox gray">${D2}</div></div>
          </div>
          <section class="panel lec-intp">
            <h3 class="panel-title">Where</h3>
            <div class="lec-vars1">
              ${v("<msub><mi>C</mi><mn>0</mn></msub><mo>,</mo><msub><mi>P</mi><mn>0</mn></msub>", "call / put value today")}
              ${v("<msub><mi>S</mi><mn>0</mn></msub>", "share price today")}
              ${v("<mi>K</mi>", "strike price")}
              ${v("<mi>r</mi>", "risk-free rate (continuous)")}
              ${v("<mi>T</mi>", "time to maturity in years")}
              ${v("<mi>σ</mi>", "volatility per year")}
              ${v("<mi>N</mi><mo stretchy='false'>(</mo><mo>·</mo><mo stretchy='false'>)</mo>", "cumulative standard normal")}
              ${v("<mi>N</mi><mo stretchy='false'>(</mo><msub><mi>d</mi><mn>1</mn></msub><mo stretchy='false'>)</mo>", "the call's delta")}
              ${v("<mi>N</mi><mo stretchy='false'>(</mo><msub><mi>d</mi><mn>2</mn></msub><mo stretchy='false'>)</mo>", "risk-neutral probability that the call ends in the money")}
            </div>
          </section>
          <section class="panel lec-panel lec-bot" data-step="1">
            <h3 class="panel-title">Why it doesn't fit a Multi-BRC</h3>
            <ul>
              <li class="icard" data-step="1" style="--d:1"><span class="num">1</span><span><b>One stock</b>the formula prices an option on a single underlying</span></li>
              <li class="icard" data-step="1" style="--d:3"><span class="num">2</span><span><b>Only the final price matters</b>European payoff: the path along the way is ignored</span></li>
            </ul>
            <div class="lec-why2" data-step="1" style="--d:6"><span>Our Multi-BRC breaks both: <b>three stocks</b> and a <b>barrier</b> that watches the whole path</span><span class="ar" aria-hidden="true"></span><span class="no"><span class="x">✕</span>Black-Scholes can't be applied</span></div>
          </section>
        </div>`;
      return { resize() { U.tightenRoots(body); } };
    }
  });

  // ================= bt-recap: the lecture's binomial tree (Lecture 4, slide 10), same layout as bs-recap =================
  // Cox-Ross-Rubinstein as in the lecture/Hull: u = e^(σ√Δt), d = 1/u, p = (e^(rΔt) − d)/(u − d), backward induction.
  // Size: a recombining tree for one stock has k + 1 nodes after k steps; for three stocks (k + 1)^3 (as on brc-why-mc).
  const BT = U.BRC, BT_N = BT.steps, BT_DIM = BT.tickers.length;
  const btNodes = (days, dim) => { let s = 0; for (let k = 0; k <= days; k++) s += Math.pow(k + 1, dim); return s; };
  const BT_BN = btNodes(BT_N, BT_DIM) / 1e9, BT_ONE = btNodes(BT_N, 1);
  const MU = `<math display="block"><mi>u</mi><mo>=</mo><msup><mi>e</mi><mrow><mi>σ</mi><msqrt><mrow><mi>Δ</mi><mi>t</mi></mrow></msqrt></mrow></msup><mo>,</mo><mspace width="0.6em"/><mi>d</mi><mo>=</mo><mfrac><mn>1</mn><mi>u</mi></mfrac></math>`;
  const MP = `<math display="block"><mi>p</mi><mo>=</mo><mfrac><mrow><msup><mi>e</mi><mrow><mi>r</mi><mi>Δ</mi><mi>t</mi></mrow></msup><mo>−</mo><mi>d</mi></mrow><mrow><mi>u</mi><mo>−</mo><mi>d</mi></mrow></mfrac></math>`;
  const MF = `<math display="block"><mi>f</mi><mo>=</mo><msup><mi>e</mi><mrow><mo>−</mo><mi>r</mi><mi>Δ</mi><mi>t</mi></mrow></msup><mrow><mo>[</mo><mi>p</mi><msub><mi>f</mi><mi>u</mi></msub><mo>+</mo><mo stretchy="false">(</mo><mn>1</mn><mo>−</mo><mi>p</mi><mo stretchy="false">)</mo><msub><mi>f</mi><mi>d</mi></msub><mo>]</mo></mrow></math>`;
  const MN = `<math display="block"><mi>Δ</mi><mi>t</mi><mo>=</mo><mfrac><mi>T</mi><mi>n</mi></mfrac></math>`;
  Deck.addSlide({
    id: "bt-recap", section: "why", after: "bs-recap", steps: 1, secs: 14,
    title: "Recap: Binomial tree and why it's impractical for a Multi-BRC",
    subtitle: `The curse of dimensionality: 1 stock needs ${U.fmt(BT_ONE, 0)} nodes, 3 stocks need ${U.fmt(BT_BN, 1)} billion`,
    lecture: "Lecture 4, slide 10",
    sources: "Arnold (2026); Cox, Ross & Rubinstein (1979)",
    notes: `What about the binomial tree from the lecture? It moves the stock up or down each step and works backwards to today, and it handles any payoff, even early exercise. [→] In theory, it could price our product too. But with three stocks, the tree grows in three dimensions, and with 252 trading days it reaches about ${U.fmt(BT_BN, 1)} billion nodes. Far too big to compute, let alone in Excel.`,
    render(body) {
      body.innerHTML = `
        <div class="lec v2 bt">
          <div class="lec-l">
            <p class="label">Binomial tree (Cox-Ross-Rubinstein) for one underlying</p>
            <div class="lec-cp">
              <div class="fbox"><span class="chip">UP AND DOWN</span>${MU}</div>
              <div class="fbox"><span class="chip">BACKWARD INDUCTION</span>${MF}</div>
            </div>
            <div class="lec-d"><div class="fbox gray">${MP}</div><div class="fbox gray">${MN}</div></div>
          </div>
          <section class="panel lec-intp">
            <h3 class="panel-title">Where</h3>
            <div class="lec-vars1">
              ${v("<mi>u</mi><mo>,</mo><mi>d</mi>", "up and down factor per step")}
              ${v("<mi>p</mi>", "risk-neutral probability of an up move")}
              ${v("<mi>f</mi>", "option value at a node")}
              ${v("<msub><mi>f</mi><mi>u</mi></msub><mo>,</mo><msub><mi>f</mi><mi>d</mi></msub>", "value after an up / down move")}
              ${v("<mi>Δ</mi><mi>t</mi>", "length of one step")}
              ${v("<mi>n</mi>", "number of steps")}
              ${v("<mi>T</mi>", "time to maturity in years")}
              ${v("<mi>σ</mi>", "volatility per year")}
              ${v("<mi>r</mi>", "risk-free rate (continuous)")}
            </div>
          </section>
          <section class="panel lec-panel lec-bot" data-step="1">
            <h3 class="panel-title">Why it's impractical for a Multi-BRC</h3>
            <ul>
              <li class="icard" data-step="1" style="--d:1"><span class="num">1</span><span><b>Three correlated stocks</b>each node branches into 2³ = 8 moves, with the correlations built in</span></li>
              <li class="icard" data-step="1" style="--d:3"><span class="num">2</span><span><b>Daily barrier</b>one step per trading day, or it misses touches in between</span></li>
            </ul>
            <div class="lec-why2" data-step="1" style="--d:6"><span>Our Multi-BRC: <b>three stocks</b> × <b>${BT_N} days</b> ≈ <b>${U.fmt(BT_BN, 1)} billion nodes</b></span><span class="ar" aria-hidden="true"></span><span class="no"><span class="x">✕</span>Works in theory, but too big to compute</span></div>
          </section>
        </div>`;
      return { resize() { U.tightenRoots(body); } };
    }
  });
})();
