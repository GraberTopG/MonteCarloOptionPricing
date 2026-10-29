/* Recap of the lecture's Black-Scholes formula (Lecture 4, slide 7, redrawn) and what it assumes; it opens the
   "why Monte Carlo" part of the video (brc-why-mc in 02-product.js follows it through after:).
   Owner: script + web-app team. Classes are prefixed .lec- */
(function () {
  const U = Deck.util;

  Deck.addStyle(`
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
    .lec-panel{align-self:start;margin-top:16px;padding:48px 30px 20px}
    .lec-smile{margin-top:14px;background:#fff;border-radius:10px}
    .lec-smile svg{display:block;width:100%;height:auto}
    .lec-smile .ax{fill:none;stroke:var(--rule);stroke-width:2}
    .lec-smile .mkt{fill:none;stroke:var(--ink);stroke-width:4;stroke-linecap:round}
    .lec-smile .bs{fill:none;stroke:var(--green);stroke-width:4;stroke-dasharray:10 7}
    .lec-smile text{font:700 18px var(--f-body)} .lec-smile .tm{fill:var(--ink)} .lec-smile .tb{fill:var(--green)} .lec-smile .ta{fill:var(--muted);font-weight:400;font-size:16px}
    .lec-int{margin:8px 0 0;font:20px/1.3 var(--f-body);color:var(--ink);text-align:left}
    .lec-int b{font-family:var(--f-math);font-style:italic}
    .lec-why{margin:22px 0 0;font:24px/1.35 var(--f-body);color:var(--ink)} .lec-why b{color:var(--green)}
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
    title: "Recap: Where Black-Scholes can be applied",
    subtitle: "For a vanilla call or put on one stock, there is an exact formula",
    lecture: "Lecture 4, slide 7",
    sources: "Arnold (2026); Black & Scholes (1973); Merton (1973)",
    notes: `So why not just use Black-Scholes? [→] It's a great formula, but it only works for one stock, and only when the final price matters.`,
    render(body) {
      body.innerHTML = `
        <div class="lec">
          <div class="lec-l">
            <p class="label">Black-Scholes-Merton formula for European options</p>
            <div class="lec-cp">
              <div class="fbox"><span class="chip">CALL</span>${C0}</div>
              <div class="fbox orange"><span class="chip orange">PUT</span>${P0}</div>
            </div>
            <div class="lec-d"><div class="fbox gray">${D1}<p class="lec-int"><b>N(d<sub>1</sub>)</b> = the call's delta: shares held to hedge it</p></div>
              <div class="fbox gray">${D2}<p class="lec-int"><b>N(d<sub>2</sub>)</b> = risk-neutral probability that the call ends in the money (is exercised)</p></div></div>
            <div class="lec-in">
              <p class="minor">Where</p>
              <div class="lec-vars">
                <div>
                  ${v("<msub><mi>C</mi><mn>0</mn></msub><mo>,</mo><msub><mi>P</mi><mn>0</mn></msub>", "call / put value today")}
                  ${v("<msub><mi>S</mi><mn>0</mn></msub>", "share price today")}
                  ${v("<mi>K</mi>", "strike price")}
                  ${v("<mi>N</mi><mo stretchy='false'>(</mo><mo>·</mo><mo stretchy='false'>)</mo>", "cumulative standard normal distribution")}
                </div>
                <div>
                  ${v("<mi>r</mi>", "risk-free rate (continuous)")}
                  ${v("<mi>T</mi>", "time to maturity in years")}
                  ${v("<mi>σ</mi>", "volatility per year")}
                </div>
              </div>
            </div>
          </div>
          <section class="panel lec-panel" data-step="1">
            <h3 class="panel-title">Why it doesn't fit our product</h3>
            <ul>
              <li class="icard" data-step="1" style="--d:1"><span class="num">1</span><span><b>One stock</b>the formula prices an option on a single underlying</span></li>
              <li class="icard" data-step="1" style="--d:3"><span class="num">2</span><span><b>Only the final price matters</b>European payoff: the path along the way is ignored</span></li>
            </ul>
            <p class="lec-why" data-step="1" style="--d:6">Our Multi-BRC breaks both: <b>three stocks</b> and a <b>barrier</b> that watches the whole path</p>
          </section>
        </div>`;
      return { resize() { U.tightenRoots(body); } };
    }
  });
})();
