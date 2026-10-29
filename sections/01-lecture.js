/* Recap of the lecture's Black-Scholes formula (Lecture 4, slide 7, redrawn) and what it assumes; it opens the
   "why Monte Carlo" part of the video (brc-why-mc in 02-product.js follows it through after:).
   Owner: script + web-app team. Classes are prefixed .lec- */
(function () {
  const U = Deck.util;

  Deck.addStyle(`
    .slide[data-id="bs-recap"] .s-title{font-size:50px;white-space:nowrap}   /* the long title on one line */
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
    .lec-why2{display:flex;align-items:center;justify-content:space-between;gap:24px;margin-top:18px;padding:0 4px;font:25px/1.3 var(--f-body);color:var(--ink)}
    .lec-why2 b{color:var(--green)}
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
            <div class="lec-why2" data-step="1" style="--d:6"><span>Our Multi-BRC breaks both: <b>three stocks</b> and a <b>barrier</b> that watches the whole path</span><span class="no"><span class="x">✕</span>Black-Scholes can't be applied</span></div>
          </section>
        </div>`;
      return { resize() { U.tightenRoots(body); } };
    }
  });
})();
