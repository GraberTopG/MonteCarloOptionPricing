/* The Multi-BRC (multi barrier reverse convertible), video script sections 3 and 4: its product family, the payoff in three
   steps, what you get at maturity, when it suits you, bond minus put (tab "product"), and why it has no simple formula
   (tab "why": brc-why-mc follows bs-recap from 01-lecture.js through after:).
   Owner: product/Excel lead + animation person. Classes are prefixed .prd- */
(function () {
  const U = Deck.util, B = U.BRC, XL = U.XL;
  const f0 = v => U.fmt(v, 0);
  // the product's numbers, from the Excel (XL: coupon 15%, two coupon dates) and the shared terms (BRC = XL.model)
  const NOM = B.nominal, N_CPN = XL.model.cpnT.length;                       // 1,000 · two coupons
  const CPN = Math.round(XL.coupon * NOM), HALF = f0(CPN / N_CPN);            // 150 · 75
  const CPN_PCT = f0(XL.coupon * 100) + "%", KI = f0(B.kickIn * 100) + "%";  // 15% · 65%
  const MONTHS = XL.model.cpnT.map(t => Math.round(t * 12));                 // coupon dates (sheet 1 G38:G39): 6 and 12 months
  // the worked example of the script (brc-tree) and of the payoff chart (brc-payoff): the worst stock ends 20% down
  const EX_WORST = 0.80, EX_SHARES = Math.round(NOM * EX_WORST);             // shares worth 800
  // the risk-free rate of our Excel (sheet 2, continuously compounded) and what it pays in a year, e^r − 1 (as on hook-product)
  const R_TXT = U.fmt(XL.model.r * 100, 2), R_YEAR = U.fmt((Math.exp(XL.model.r) - 1) * 100, 1);   // 4.43 · 4.5
  // colours (group feedback, 27 Oct 2026): kick-in and loss black (--red-ink), the put grey, cash and emphasis HSG green

  Deck.addStyle(`
    /* ---------- brc-family: the SSPA map (smaller since 27 Oct 2026), then the product's key terms (the texts of hook-product) ---------- */
    .prd-fam{display:grid;grid-template-columns:236px 680px 236px 236px 260px;grid-template-rows:32px 1fr auto;gap:10px 24px;height:100%}
    .prd-fam-g{grid-row:1;align-self:end;font:700 24px/1 var(--f-head);color:var(--green-ink);border-bottom:3px solid var(--green-ink);padding-bottom:7px;white-space:nowrap;transition:opacity .5s}
    .prd-fam-g.g1{grid-column:1/5} .prd-fam-g.g2{grid-column:5/6}
    .prd-fc{grid-row:2;background:var(--card);border-radius:10px;padding:12px 16px 14px;display:flex;flex-direction:column;min-height:0;transition:opacity .5s,background .5s,box-shadow .5s}
    .prd-fc-c{font:800 36px/1 var(--f-head);color:var(--green-ink);font-variant-numeric:lining-nums;transition:color .5s}
    .prd-fc-n{font:21px/1.18 var(--f-body);color:var(--ink);margin-top:6px}
    .prd-fc-k{margin-top:auto;display:grid;gap:5px}
    .prd-fc-k i{font:700 19px/29px var(--f-mono);font-style:normal;color:var(--muted);background:#fff;border-radius:6px;text-align:center}
    .prd-fc.y .prd-fc-h{display:flex;align-items:baseline;gap:16px}
    .prd-fc.y .prd-fc-n{font:700 28px/1 var(--f-head);margin:0}
    .prd-fc-t{margin:8px 0 0;font:700 24px/1.2 var(--f-body);color:var(--green)}
    .prd-cats{margin-top:auto;display:grid;gap:4px}
    .prd-cat{display:grid;grid-template-columns:70px 1fr;align-items:baseline;background:#fff;border-radius:6px;padding:4px 14px;font:22px/1.2 var(--f-body);transition:opacity .5s,background .5s,box-shadow .5s}
    .prd-cat b{font:700 20px var(--f-mono);color:var(--green-ink)}
    .prd-fam.s1 .prd-fc:not(.y),.prd-fam.s1 .prd-fam-g.g2{opacity:.35}
    .prd-fam.s1 .prd-fc.y{background:var(--green-light);box-shadow:inset 0 0 0 3px var(--green)}
    .prd-fam.s1 .prd-fc.y .prd-fc-c{color:var(--green)}
    .prd-fam.s2 .prd-cat:not(.me){opacity:.45}
    .prd-fam.s2 .prd-cat.me{background:var(--orange-light);box-shadow:inset 0 0 0 3px var(--orange);font-weight:700}
    .prd-fam.s2 .prd-cat.me b{color:var(--orange-ink)}
    /* the key terms: five tiles and the coupon band, as on hook-product, but compact */
    .prd-key{grid-column:1/-1;grid-row:3;border:2px solid var(--green);border-radius:12px;padding:12px 18px 14px;display:flex;flex-direction:column;gap:10px}
    .prd-key-h{margin:0;font:700 30px/1.15 var(--f-head);color:var(--green-ink)}
    .prd-key-t{display:grid;grid-template-columns:repeat(5,1fr);gap:14px}
    .prd-kt{display:flex;flex-direction:column;background:var(--card);border-radius:10px;padding:10px 18px 12px;min-width:0}
    .prd-kt .k,.prd-key-c .k{display:block;font:700 18px/1.2 var(--f-body);letter-spacing:.05em;color:var(--green-ink)}
    .prd-kt .v{font:700 40px/1.1 var(--f-head);color:var(--ink);margin:4px 0;white-space:nowrap;font-variant-numeric:lining-nums}
    .prd-kt .s{font:21px/1.22 var(--f-body);color:var(--muted)}
    .prd-kt .s i{display:block;font-style:normal;white-space:nowrap}
    .prd-dot{display:inline-block;width:14px;height:14px;border-radius:50%;margin-right:8px;vertical-align:1px}
    /* the coupon band on the tiles' grid: the coupon lines up with MATURITY, the rate with KICK-IN BARRIER */
    .prd-key-c{display:grid;grid-template-columns:repeat(5,1fr);column-gap:14px;align-items:center;background:var(--card);box-shadow:inset 8px 0 0 var(--green);border-radius:10px;padding:8px 0}
    .prd-key-c>div{padding-left:18px}
    .prd-key-c .big{padding-left:28px;font:800 58px/1 var(--f-head);color:var(--green);white-space:nowrap;font-variant-numeric:lining-nums}
    .prd-key-c .t{display:block;margin-top:2px;font:24px/40px var(--f-body);color:var(--ink);white-space:nowrap}   /* one line height for both, so the two labels line up */
    .prd-key-c .rf{grid-column:3/6}
    .prd-key-c .rf .t{color:var(--muted)}
    .prd-key-c .rf b{font:700 34px/1 var(--f-head);color:var(--green-ink);margin-right:6px;font-variant-numeric:lining-nums}

    /* ---------- brc-payoff ---------- */
    .prd-po{display:grid;grid-template-columns:1fr 470px;gap:32px;height:calc(100% + 30px);margin-top:-30px}
    .prd-po-l{display:flex;flex-direction:column;min-width:0}
    .prd-po-h{font:700 26px/1.2 var(--f-body);margin:0 0 4px;color:var(--ink)}
    .prd-po-h span{font-weight:400;color:var(--muted)}
    .prd-po-h .sc i.g{background:var(--green)} .prd-po-h .sc i.k{background:var(--red-ink)}
    .prd-po-hd{position:relative;height:96px;flex:none}
    .prd-po-hd .prd-po-h{position:absolute;left:0;top:0;right:0;transition:opacity .45s}
    .prd-po-h.br{display:grid;grid-template-columns:auto 1fr;column-gap:14px;row-gap:4px;font-size:21px;opacity:0}
    .prd-po-h.br b{grid-row:1/4;font-size:26px;line-height:1.2;white-space:nowrap} .prd-po-h.br .sc{white-space:nowrap}
    .prd-po-h.br .sc{margin-left:0}
    .prd-po-h.br .sc i{width:38px;border-radius:15px}
    .prd-po.barrier .prd-po-h.rc{opacity:0} .prd-po.barrier .prd-po-h.br{opacity:1}
    .prd-po-h .wo,.prd-po-h .one{color:inherit} .prd-po-h .wo{display:none} .prd-po.worst .prd-po-h .wo{display:inline} .prd-po.worst .prd-po-h .one{display:none}
    .prd-po-h .sc{margin-left:22px;color:var(--ink);font-weight:400;white-space:nowrap}
    .prd-po-h .sc i{display:inline-grid;place-items:center;width:30px;height:30px;border-radius:50%;background:var(--green-ink);color:#fff;font:700 18px/1 var(--f-body);font-style:normal;margin-right:8px;vertical-align:2px}
    .prd-po-l canvas{flex:1;width:100%;min-height:0;display:block}
    .prd-po-r{position:relative;display:grid;grid-template-rows:repeat(3,1fr);gap:24px}
    .prd-po-c{position:relative;display:flex;gap:20px;align-items:center;background:var(--card);border-radius:10px;padding:20px 24px 20px 18px;border-left:8px solid transparent;transition:border-color .4s,background .4s}
    /* step 0 ("Let's build it in three steps"): three numbered dashed places that the cards fill one per click */
    .prd-po-slots{position:absolute;inset:0;display:grid;grid-template-rows:repeat(3,1fr);gap:24px}
    .prd-po-slot{display:flex;align-items:center;padding-left:23px;border:3px dashed #BCC3C0;border-radius:10px}
    .prd-po-slot .num{background:#BCC3C0}
    .slide .prd-po-c[data-step]{transform:none}   /* fades in exactly over its slot (no slide-up, so no slot edge or number peeks out) */
    .prd-po-c.cur{background:var(--green-light);border-color:var(--green)}
    .prd-po-c h4{margin:0 0 8px;font:700 30px/1.15 var(--f-head);color:var(--ink);font-variant-numeric:lining-nums}
    .prd-po-c p{margin:0;font:24px/1.3 var(--f-body);color:var(--muted)}
    .prd-po-c p b{color:var(--ink)}

    /* ---------- brc-tree ---------- */
    .prd-tr{position:relative;height:100%}
    .prd-tr>svg{position:absolute;inset:0;width:100%;height:100%;overflow:visible}
    .slide .prd-tr svg [data-step]{transform:none}
    .prd-tr svg path{fill:none;stroke:var(--rule);stroke-width:3}
    .prd-tr svg path.dash{stroke:var(--orange);stroke-dasharray:9 7}
    .prd-tr svg .pill rect{stroke:none}
    .prd-tr svg .pill text{font:700 26px var(--f-body);fill:#fff;text-anchor:middle;dominant-baseline:central}
    .prd-tr svg .pill.ok rect{fill:var(--green)} .prd-tr svg .pill.ko rect{fill:var(--red-ink)}
    .prd-tb{position:absolute;border-radius:12px;display:flex;flex-direction:column;justify-content:center;padding:16px 26px;font:26px/1.3 var(--f-body)}
    .prd-tb.cp{left:0;top:20px;width:360px;height:700px;background:var(--green-light);align-items:center;text-align:center;justify-content:center}
    .prd-tb.cp .v{font:800 120px/1 var(--f-head);color:var(--green-ink);font-variant-numeric:lining-nums}
    .prd-tb.cp .eq{font:700 36px/1.2 var(--f-body);color:var(--green-ink);margin-top:6px}
    .prd-tb.cp .unit{font-size:26px;color:var(--muted);margin-top:4px}
    .prd-tl{list-style:none;margin:44px 0 0;padding:0 0 0 34px;text-align:left;display:grid;gap:30px}
    .prd-tl li{position:relative;font-size:26px;line-height:1.25}
    .prd-tl li::before{content:"";position:absolute;left:-46px;top:5px;width:18px;height:18px;border-radius:50%;background:var(--green)}
    .prd-tl li:not(:last-child)::after{content:"";position:absolute;left:-38.5px;top:14px;width:3px;height:calc(100% + 30px);background:var(--green-mid)}
    .prd-tl b{display:block;font:700 34px var(--f-body);color:var(--green-ink)}
    .prd-tb.cp .ok{margin-top:48px;font:700 30px/1.2 var(--f-body);color:var(--green)}
    .prd-tb.q{background:#fff;box-shadow:inset 0 0 0 3px var(--green-ink);flex-direction:row;align-items:center;gap:20px;font:700 28px/1.25 var(--f-body);color:var(--ink)}
    .prd-tb.q .num{width:52px;height:52px}
    /* the three outcomes, numbered 1-3 (the deck's round number badges) */
    .prd-tb.cash,.prd-tb.shr{flex-direction:row;align-items:center;justify-content:flex-start;gap:24px}
    .prd-tb.cash{background:var(--green-light);border-left:8px solid var(--green);border-radius:4px 12px 12px 4px}
    .prd-tb.cash b{display:block;font:700 30px/1.1 var(--f-body);color:var(--green)}
    .prd-tb .num.g{background:var(--green)} .prd-tb .num.k{background:var(--red-ink)} .prd-tb .num.g,.prd-tb .num.k{font-size:24px}
    /* the coupons in every outcome: a chip in the colour of the coupon card on the left */
    .prd-tb .cpn{display:inline-block;margin-top:8px;padding:4px 12px;border-radius:6px;background:#3B8A5A;color:#fff;font:700 24px/1.2 var(--f-body)}
    .prd-tb .tt{display:inline-block;margin-left:12px;font:700 26px/1.2 var(--f-body);color:var(--green-ink)}
    .prd-tb.shr .sm{display:block;font-size:20px;line-height:1.3;color:var(--muted);margin-top:10px}
    .prd-tb.shr .exl{margin:12px 0 0;padding-top:10px;border-top:2px dashed var(--rule);font:21px/1.35 var(--f-body);color:var(--ink)}
    .prd-tb.shr .exl .eh{margin:0 0 2px;font-weight:700}
    .prd-tb.shr .exl .ec{margin:0 0 2px;color:var(--ink)}
    /* tree layout */
    .prd-tr.tree .prd-tb.q{padding:0 24px;font-size:27px}
    .prd-tr.tree .prd-tb.q .num{width:44px;height:44px;font-size:24px}
    .prd-tr.tree .prd-tb.cash,.prd-tr.tree .prd-tb.shr{flex-direction:column;align-items:stretch;justify-content:flex-start;padding:18px 30px 16px;border-left:none;border-radius:12px}
    .prd-tr.tree .prd-tb.cash{box-shadow:inset 0 6px 0 var(--green)} .prd-tr.tree .prd-tb.shr{box-shadow:inset 0 6px 0 var(--red-ink)}
    .prd-tr.tree .prd-tb>div{flex:none}
    .prd-tr.tree .prd-tb .hd{display:flex;align-items:center;gap:18px;margin-bottom:6px}
    .prd-tr.tree .prd-tb .hd b{font:700 32px/1.1 var(--f-body)}
    .prd-tr.tree .prd-tb.cash .eg.cash{font-size:24px;line-height:1.45;margin-top:auto;padding-top:10px;border-top:2px dashed #B9D3C1}
    .prd-tr.tree .prd-tb .sm{display:block;margin:0;font-size:22px;line-height:1.35;color:var(--ink)}
    .prd-tr.tree .prd-tb.shr .exl{font-size:24px;line-height:1.4;margin-top:auto;padding-top:8px}
    .prd-tr.tree .prd-tb.shr .exl .eh{font-weight:700;margin:0 0 2px}
    .prd-tr.tree .prd-tb.shr .exl .eg>span:nth-child(-n+2){color:var(--muted)}
    .prd-when{position:absolute;left:1510px;top:0;width:244px;height:0}
    .prd-when .ax{position:absolute;left:0;top:-6px;height:226px;width:3px;background:var(--rule)}
    .prd-when .ax::after{content:"";position:absolute;left:-7px;bottom:-4px;border:8.5px solid transparent;border-top:12px solid var(--rule);border-bottom:0}
    .prd-when>div:not(.ax){position:absolute;left:18px;right:0;display:flex;flex-direction:column;justify-content:center;font:18px/1.25 var(--f-body);color:var(--muted)}
    .prd-when>div:not(.ax)::before{content:"";position:absolute;left:-24px;top:50%;width:15px;height:15px;margin-top:-7.5px;border-radius:50%;background:var(--green-ink)}
    .prd-when b{font:700 20px/1.2 var(--f-body);color:var(--ink)}
    .slide .prd-when [data-step]{transform:none}
    .prd-cpl{position:absolute;background:#3B8A5A;border-radius:12px;color:#fff;display:flex;align-items:center;justify-content:center;gap:22px;font:700 26px/1 var(--f-body)}
    .prd-cpl .k{text-transform:uppercase;letter-spacing:.06em;font-size:22px;background:#fff;color:#2F7A4C;padding:6px 12px;border-radius:6px}
    .prd-cpl .v{font-size:30px} .prd-cpl .s{font-weight:400;font-size:24px;opacity:.95}
    .prd-cpl .up{position:absolute;top:-17px;font-size:14px!important;margin-left:-10px;color:#3B8A5A;font-size:20px;line-height:1}
    .prd-tb .eg{display:grid;grid-template-columns:1fr auto;column-gap:16px}
    .prd-tb .eg .r{text-align:right;font-variant-numeric:tabular-nums}
    .prd-tb .eg .t{font-weight:700;border-top:1.5px solid var(--ink);margin-top:2px}
    .prd-tb .eg .c{color:#2F7A4C;font-weight:700}   /* the coupons, in every outcome */
    .prd-tb .eg.cash{margin-top:6px;font:21px/1.35 var(--f-body);color:var(--ink);width:100%}
    .prd-tb.cash>div,.prd-tb.shr>div{flex:1}
    .slide .prd-tb .exl[data-step]{transform:none}
    .prd-tb.shr{background:var(--red-soft);border-left:8px solid var(--red-ink);border-radius:4px 12px 12px 4px}
    .prd-tb.shr b{display:block;font:700 30px/1.1 var(--f-body);color:var(--red-ink)}
    .prd-tb.shr{align-items:flex-start;padding-top:22px} .prd-tb.shr>.num{margin-top:2px}

    .prd-tb.ex{background:var(--orange-light);justify-content:flex-start;padding:16px 26px}
    .prd-tb.ex h4{margin:0 0 8px;font:700 28px/1.2 var(--f-body);color:var(--ink)}
    .prd-calc{display:grid;grid-template-columns:1fr auto;gap:2px 16px;font-size:26px;line-height:1.35}
    .prd-calc .r{text-align:right;font-weight:700;font-variant-numeric:tabular-nums}
    .prd-calc .tot{border-top:2px solid var(--ink);padding-top:4px;margin-top:4px;font-weight:700}
    .prd-calc .tot.r{font-size:38px;line-height:1.1;color:var(--orange-ink)}

    /* ---------- brc-suits: advantages (green icons) and risks (black icons), four each ---------- */
    .prd-su{display:grid;grid-template-columns:1fr 1fr;gap:40px;height:722px;margin-top:18px}
    .prd-su .panel{height:100%;padding:46px 26px 24px;display:flex;flex-direction:column}
    .prd-su .panel>.panel-title{text-transform:none;font-size:30px}   /* "Advantages" / "Risks" as the group wrote them */
    .prd-su-ok>.panel-title{color:var(--green)}
    .prd-su ul{flex:1;min-height:0;list-style:none;margin:0;padding:0;display:grid;grid-template-rows:repeat(4,1fr);gap:14px}
    .prd-su li.icard{padding:12px 22px 12px 14px;gap:18px}
    .prd-su .badge{width:60px;height:60px}
    .prd-su-ok .badge{background:var(--green)}
    .prd-su-risk{border-color:var(--red-ink)}
    .prd-su-risk>.panel-title{color:var(--red-ink)}
    .prd-su-risk .badge{background:var(--red-ink)}
    .prd-su h4{margin:0;font:700 28px/1.18 var(--f-head);color:var(--ink);font-variant-numeric:lining-nums;text-wrap:balance}
    .prd-su p{margin:5px 0 0;font:23px/1.3 var(--f-body);color:var(--muted);text-wrap:pretty}

    /* ---------- brc-decompose ---------- */
    .prd-dec{display:grid;grid-template-columns:1fr 70px 1fr 70px 1fr;grid-template-rows:auto auto auto;row-gap:46px;height:100%;padding-top:34px;align-content:start}
    .prd-op{display:grid;place-items:center;font:300 84px/1 var(--f-head);color:var(--green-ink)}
    .prd-box{position:relative;border-radius:10px;padding:40px 28px 22px;display:flex;flex-direction:column;font:28px/1.32 var(--f-body)}
    .prd-box.gray{background:var(--card)} .prd-box.green{background:var(--green-light)} .prd-box.put{background:var(--orange-light)}
    .prd-box .chip{white-space:nowrap;font-size:20px}
    .prd-box .chip.ink{background:var(--green-ink)}
    .prd-box .chip.put{background:var(--red-ink)}   /* the put: black chip on a grey card, not green like the bond */
    .prd-box h4{font:700 36px/1.15 var(--f-head);margin:0 0 12px;color:var(--ink)}
    .prd-box p{margin:0 0 26px}
    .prd-f{margin-top:auto;background:rgba(255,255,255,.7);border-radius:8px;padding:14px 10px 12px;text-align:center}
    .prd-f math{font-size:36px}
    .prd-f small{display:block;font:24px/1.25 var(--f-body);color:var(--muted);margin-top:6px}
    .prd-same{grid-column:1;grid-row:2;align-self:stretch;display:flex;align-items:center;gap:22px;font:28px/1.3 var(--f-body)}
    .prd-same b{display:block;font:700 32px/1.2 var(--f-body)}
    .prd-vd{grid-row:2;align-self:stretch;border-radius:10px;padding:32px 28px;display:flex;gap:24px;align-items:center}
    .prd-vd.easy{grid-column:3;background:var(--green-light);border-left:8px solid var(--green)}
    .prd-vd.hard{grid-column:5;background:var(--orange-light);border-left:8px solid var(--red-ink)}
    .prd-vd .badge{width:68px;height:68px}
    .prd-vd.easy .badge{background:var(--green)} .prd-vd.hard .badge{background:var(--red-ink)}
    .prd-vd h4{margin:0;font:700 34px/1.15 var(--f-head);color:var(--ink);white-space:nowrap}
    .prd-vd p{margin:6px 0 0;font:30px/1.3 var(--f-body);color:var(--ink)}
    .prd-mcgo{grid-column:3/6;grid-row:3;margin:0;text-align:center;font:800 50px/1.1 var(--f-head);color:var(--green);letter-spacing:.01em}

    /* ---------- brc-why-mc ---------- */
    /* the title runs over two lines (balanced, never broken inside "Multi-BRC"): the panel starts lower, under the subtitle */
    .slide[data-id="brc-why-mc"] .s-title{text-wrap:balance}
    .prd-mc{position:relative;height:100%}
    .prd-mc>.term{position:absolute;left:0;right:0;top:36px;height:704px;transition:opacity .45s ease,transform .45s ease}
    .prd-mc .term-stats{gap:40px}
    .prd-mc .term-stats .k{font-size:16px}
    .prd-mc .term-stats .v{font-size:28px}
    .prd-mc .term-stats .v.ki{color:var(--term-muted)}
    .prd-mc .term-stats .v.ki.hit{color:var(--term-red)}   /* black only once a stock has touched */
    /* fixed column widths, so the bar does not jitter while the numbers change during the animation */
    .prd-mc .term-stats>div{flex:none;white-space:nowrap}
    .prd-mc .term-stats>div:nth-child(1){width:150px}
    .prd-mc .term-stats>div:nth-child(2),.prd-mc .term-stats>div:nth-child(3),.prd-mc .term-stats>div:nth-child(4){width:120px}
    .prd-mc .term-stats>div:nth-child(5){width:250px}
    /* the reasons appear on the chart, next to what they explain (one per step); positions come from place() */
    .prd-co{position:absolute;inset:0;pointer-events:none}
    /* white boxes with a coloured edge: --cc the edge and connector (the stock's line colour), --ct the heading and badge */
    .prd-call{position:absolute;left:0;top:0;width:max-content;max-width:640px;background:#fff;border:2px solid var(--cc);border-radius:8px;padding:12px 20px 14px;box-shadow:0 4px 18px rgba(26,29,27,.16)}
    .prd-call .h{display:flex;align-items:center;gap:12px;font:700 24px/1.2 var(--f-mono);letter-spacing:.04em;color:var(--ct)}
    .prd-call .n{width:32px;height:32px;border-radius:50%;background:var(--ct);color:#fff;display:grid;place-items:center;font:800 19px var(--f-mono);flex:none}
    .prd-call .t{margin:8px 0 0 44px;font:24px/1.3 var(--f-body);color:var(--ink)}
    .prd-call .t b{color:var(--ct)}
    .prd-call .t+.t{margin-top:8px}
    .prd-call.c1{max-width:560px}
    .prd-call.c2{max-width:640px}
    /* step 6: the simulated year makes way for reason 3, the binomial tree, on a card of its own (never over the chart) */
    .prd-mc.verdict>.term{opacity:0;transform:scale(.985)}
    .prd-tree{position:absolute;left:0;right:0;top:78px;height:620px;background:#fff;border:2px solid var(--green);border-radius:12px;padding:24px 44px 30px;display:flex;flex-direction:column}
    .prd-tree-h{display:flex;align-items:center;gap:18px;margin:0}
    .prd-tree-h .num{background:var(--green)}
    .prd-tree-h h3{margin:0;font:700 34px/1.2 var(--f-head);color:var(--green-ink);font-variant-numeric:lining-nums}
    .prd-tree-b{flex:1;min-height:0;display:grid;grid-template-columns:704px 1fr;gap:60px;align-items:center}
    .prd-tree-g{position:relative;width:704px;height:360px}
    .prd-tree-g svg{position:absolute;inset:0;width:100%;height:100%;overflow:visible}
    .prd-tree-g path{fill:none;stroke:var(--rule);stroke-width:2.5;stroke-linecap:round}
    .prd-tree-n{position:absolute;width:104px;height:46px;margin:-23px 0 0 -52px;border-radius:23px;background:var(--green-light);box-shadow:inset 0 0 0 2px var(--green-mid);display:grid;place-items:center}
    .prd-tree-n math{font-size:26px}
    .prd-tree-cap{margin:18px 0 0;text-align:center;font:24px var(--f-body);color:var(--muted)}
    .prd-tree-r{border-left:2px solid var(--rule-light);padding:6px 0 6px 56px}
    .prd-tree-r p{margin:0}
    .prd-tree-r .k{font:700 30px/1.2 var(--f-head);color:var(--ink);font-variant-numeric:lining-nums}
    .prd-tree-r .big{margin:8px 0 4px;font:800 62px/1.1 var(--f-head);color:var(--green);white-space:nowrap;font-variant-numeric:lining-nums tabular-nums}
    .prd-tree-r .eq math{font-size:32px}
    .prd-tree-r .t{margin-top:16px;font:28px/1.3 var(--f-body);color:var(--ink)}
    .prd-tree-r .t b{color:var(--green)}
    .prd-tree-r .mc{margin-top:28px;font:800 44px/1.1 var(--f-head);color:var(--green)}
    .prd-co>svg{position:absolute;inset:0;width:100%;height:100%;overflow:visible}
    .slide .prd-co>svg line{stroke:var(--cc);stroke-width:2.5;stroke-dasharray:1;stroke-dashoffset:1;transform:none}
    .slide .prd-co>svg line.on{stroke-dashoffset:0;transition:stroke-dashoffset .6s ease .25s}
    .slide .prd-co>svg circle{fill:none;stroke:var(--cc);stroke-width:3;transform:none}
    /* callout 2's anchor: a bracket across the three stocks' levels on the kick-in day, dots on the other two paths */
    .slide .prd-co>svg path{fill:none;stroke:var(--cc);stroke-width:3;stroke-linecap:round;stroke-linejoin:round;transform:none}
    .slide .prd-co>svg g.dots{transform:none}
    .slide .prd-co>svg g.dots circle{fill:var(--dc);stroke:var(--term-bg);stroke-width:2}
  `);


  // ================= brc-payoff: the payoff diagram gains one feature per click =================
  // step 3's example (own illustration): Microsoft touches 65% during the year and ends at 95%; Adobe never touches but
  // ends worst at 80%, so the investor gets Adobe shares worth 800 (the same 20% fall as on brc-tree)
  const PO_EX = [{ k: 0, low: 0.72, fin: EX_WORST }, { k: 2, low: B.kickIn, fin: 0.95 }, { k: 1, low: 0.90, fin: 1.20 }];
  Deck.addSlide({
    id: "brc-payoff", section: "product", after: "brc-tree", steps: 3, secs: 60,   // after the scenario tree: concrete first, then the option view
    title: "The Payoff of the Multi-BRC",
    subtitle: "Based on three elements: reverse convertible + a barrier + three underlyings with a worst-of principle",
    sources: "Own illustration, inspired by Vontobel (2026), Swissquote (2026)",
    notes: `Here are the same scenarios as a payoff diagram, the way the lecture draws options. Let's build it in three steps. [→] Step one: a reverse convertible on one stock. The catch: if the stock ends below its starting price, you're paid back in shares, not cash. In option terms, you own a bond and have sold a put; the part of the coupon above normal interest is what the bank pays you for it. Including the coupons, you only lose money if the stock ends below 85 percent. [→] Step two: the barrier. Now the put only kicks in if the stock touches 65 percent of its starting price. It becomes a down-and-in put. If the stock never gets there, you get your thousand back. The barrier gives you a 35 percent safety buffer. [→] Step three: three stocks, and the worst-of principle. One touch by any of them is enough, and you get shares of the worst one, which isn't always the one that touched. So three stocks don't make it safer. They give you three chances to hit a barrier.`,
    render(body) {
      const card = (k, h, p) => `<div class="prd-po-c" data-step="${k}"><span class="num">${k}</span><div><h4>${h}</h4><p>${p}</p></div></div>`;
      body.innerHTML = `
        <div class="prd-po">
          <div class="prd-po-l">
            <div class="prd-po-hd">
              <p class="prd-po-h rc">At maturity: <span class="sc"><i class="g">1</i>Above strike → USD 1,000 + coupons</span><span class="sc"><i class="k">2</i>Below strike → shares + coupons</span></p>
              <div class="prd-po-h br"><b>At maturity:</b>
                <span class="sc"><i class="g">1</i>Barrier never touched → USD 1,000 + coupons</span>
                <span class="sc"><i class="g">2a</i>Barrier touched but above strike → USD 1,000 + coupons</span>
                <span class="sc"><i class="k">2b</i>Barrier touched and below strike → <span class="one">shares</span><span class="wo">shares of the underlying with the worst performance</span> + coupons</span></div>
            </div>
            <canvas></canvas>
          </div>
          <div class="prd-po-r">
            <div class="prd-po-slots">${[1, 2, 3].map(k => `<div class="prd-po-slot"><span class="num">${k}</span></div>`).join("")}</div>
            ${card(1, "Reverse convertible", `<b>= bond + sold put</b><br>Strike decides if you receive the nominal or shares at maturity`)}
            ${card(2, `+ Barrier at ${KI}`, `<b>= down-and-in put</b><br>Touch of the barrier turns the product into a reverse convertible`)}
            ${card(3, "+ Worst-of principle", `underlying asset with the worst performance counts`)}
          </div>
        </div>`;
      const cv = body.querySelector("canvas"), cards = [...body.querySelectorAll(".prd-po-c")];
      const S = { k1: 0, k2: 0, k3: 0 };
      const lerp = (t, a0, a1) => Math.max(0, Math.min(1, (t - a0) / (a1 - a0)));
      let a = null;
      function draw() {
        const c = U.canvas(cv); if (!c) return;
        const { ctx, w, h } = c;
        ctx.lineCap = "butt";   // the payoff line below sets round caps; the next frame's axes must not inherit them
        const green = U.css("--green"), muted = U.css("--muted"), oink = U.css("--orange-ink"), orange = U.css("--orange");
        const loss = U.css("--red-ink"), ink = U.css("--ink"), grey = U.css("--rule");   // kick-in and shares black, the put grey
        const f = { x: 100, y: 40, w: w - 100 - 34, h: h - 40 - 172 };   // room under the x axis for the two payout bars
        const { X, Y: Ya } = U.axes(ctx, f, {
          theme: "light", xMin: 0, xMax: 150, yMin: 0, yMax: 1400,
          xTicks: [0, 25, 50, 75, 100, 125, 150], yTicks: [0, 250, 500, 750, 1000, 1250], xFmt: v => v + "%", yFmt: v => f0(v)
        });
        const Y = Ya, Yp = v => Ya(v + CPN);   // the payoff is drawn as the total received: repayment + USD 150 coupons
        ctx.strokeStyle = U.css("--rule"); ctx.lineWidth = 1.5;
        ctx.beginPath(); ctx.moveTo(f.x, f.y); ctx.lineTo(f.x, f.y + f.h); ctx.lineTo(f.x + f.w, f.y + f.h); ctx.stroke();
        // step 3's example year is not on the USD scale: it gets its own box over the gridlines, from just under the payoff
        // line down to the x axis (only its % positions count); the barrier and the bars are drawn on top of it
        if (S.k1 > 0) {   // the strike at 100%: above it USD 1,000 in cash, below it shares (under the example box of step 3)
          ctx.save(); ctx.globalAlpha = lerp(S.k1, .3, .8); ctx.setLineDash([8, 6]); ctx.strokeStyle = U.css("--green-ink"); ctx.lineWidth = 2.5;
          ctx.beginPath(); ctx.moveTo(X(100), f.y + f.h); ctx.lineTo(X(100), Y(1395)); ctx.stroke(); ctx.restore();
        }
        if (S.k1 > 0) {   // what you paid: USD 1,000; below it you lose money. With the coupons, that only happens below 85%
          const ra = lerp(S.k1, .5, 1), be = (NOM - CPN) / NOM * 100;
          ctx.save(); ctx.globalAlpha = ra; ctx.setLineDash([3, 5]); ctx.strokeStyle = U.css("--muted"); ctx.lineWidth = 2;
          ctx.beginPath(); ctx.moveTo(X(0), Y(NOM)); ctx.lineTo(X(150), Y(NOM)); ctx.stroke(); ctx.restore();
          ctx.save(); ctx.globalAlpha = ra * (1 - S.k3); ctx.fillStyle = U.css("--ink");
          ctx.beginPath(); ctx.arc(X(be), Y(NOM), 7, 0, 7); ctx.fill(); ctx.restore();
        }
        const exL = Math.min(...PO_EX.map(e => e.low)) * 100 - 5;
        const ex = { x: X(exL), y: Yp(exL * 10) + 24, r: f.x + f.w - 2, b: Y(0) - 10 };
        const rowY = j => ex.y + 44 + (ex.b - ex.y - 44) * (2 * j + 1) / 6;
        if (S.k3 > 0) {
          ctx.save(); ctx.globalAlpha = lerp(S.k3, 0, .35); ctx.fillStyle = U.css("--card");
          ctx.beginPath(); ctx.roundRect(ex.x, ex.y, ex.r - ex.x, ex.b - ex.y, 10); ctx.fill(); ctx.restore();
        }
        const text = (s, x, y, o) => {
          ctx.save(); ctx.globalAlpha = o.a == null ? 1 : o.a; ctx.fillStyle = o.c || muted; ctx.font = (o.b ? "700 " : "") + (o.s || 22) + "px " + U.F.body;
          ctx.textAlign = o.al || "left"; ctx.textBaseline = o.bl || "middle";
          if (o.rot) { ctx.translate(x, y); ctx.rotate(o.rot); x = 0; y = 0; }
          if (o.halo) {   // a solid background behind the text, so lines under it do not run through the letters
            const m = ctx.measureText(s), wd = m.width, x0 = ctx.textAlign === "right" ? x - wd : ctx.textAlign === "center" ? x - wd / 2 : x;
            ctx.fillStyle = o.halo; ctx.fillRect(x0 - 6, y - m.actualBoundingBoxAscent - 4, wd + 12, m.actualBoundingBoxAscent + m.actualBoundingBoxDescent + 8);
            ctx.fillStyle = o.c || muted;
          }
          ctx.fillText(s, x, y); ctx.restore();
        };
        // axis titles: from step 3 on, the x axis is the worst of the three stocks
        const xt = f.y + f.h + 48, xc = f.x + f.w / 2;
        // under the axis: what you are paid back, by where the (worst) stock ends; and the coupons, paid in every case
        if (S.k1 > 0) {
          const by = f.y + f.h + 74, bh = 34, gap = 5, bkx = B.kickIn * 100;
          const seg = (x0, x1, fill, txt, col, al) => {
            ctx.save(); ctx.globalAlpha = al; ctx.fillStyle = fill;
            ctx.beginPath(); ctx.roundRect(X(x0) + (x0 ? gap / 2 : 0), by, X(x1) - X(x0) - (x0 ? gap / 2 : 0) - (x1 < 150 ? gap / 2 : 0), bh, 6); ctx.fill();
            ctx.fillStyle = col; ctx.font = "700 " + (X(x1) - X(x0) < 260 ? 17 : 19) + "px " + U.F.body; ctx.textAlign = "center"; ctx.textBaseline = "middle";
            ctx.fillText(txt, (X(x0) + X(x1)) / 2, by + bh / 2 + 1); ctx.restore();
          };
          const a1 = lerp(S.k1, .4, .9);
          seg(0, 100, ink, "Shares", "#fff", a1 * (1 - S.k2));
          seg(0, bkx, ink, "Shares", "#fff", a1 * S.k2);
          seg(bkx, 100, U.css("--green-light"), "USD 1,000 if untouched", U.css("--green-ink"), a1 * S.k2);
          seg(100, 150, green, "USD 1,000", "#fff", a1);
          ctx.save(); ctx.globalAlpha = a1; ctx.fillStyle = "#3B8A5A";   // a darker green, so the white text reads clearly
          ctx.beginPath(); ctx.roundRect(X(0), by + bh + gap, X(150) - X(0), bh, 6); ctx.fill();
          ctx.fillStyle = "#fff"; ctx.font = "700 20px " + U.F.body; ctx.textAlign = "center"; ctx.textBaseline = "middle";
          ctx.fillText("+ 2 coupons: USD " + CPN + " (2 × " + HALF + ")", xc, by + bh + gap + bh / 2 + 1); ctx.restore();
        }
        text("Stock at maturity (% of its starting level)", xc, xt, { al: "center", a: 1 - S.k3 });
        text("Worst stock at maturity (% of its starting level)", xc, xt, { al: "center", a: S.k3, c: oink, b: true });
        text("Total received, USD per 1,000", f.x - 76, f.y + f.h / 2, { al: "center", rot: -Math.PI / 2 });
        if (S.k1 > 0) {
          text("your investment: USD 1,000", X(150), Y(NOM) - 18, { c: muted, al: "right", a: lerp(S.k1, .5, 1), s: 19 });
          text("break-even " + f0((NOM - CPN) / NOM * 100) + "%", X((NOM - CPN) / NOM * 100) + 6, Y(NOM) + 26, { b: true, c: ink, halo: "#fff", a: lerp(S.k1, .5, 1) * (1 - S.k3), s: 19 });
        }
        if (S.k1 > 0) text("strike 100%", X(100) + 10, Y(1395), { b: true, c: U.css("--green-ink"), bl: "top", a: lerp(S.k1, .3, .8) });
        const poly = pts => { ctx.beginPath(); pts.forEach(([x, y], j) => j ? ctx.lineTo(X(x), Yp(y)) : ctx.moveTo(X(x), Yp(y))); ctx.closePath(); };
        const bk = B.kickIn * 100, slope = Math.atan2(Y(1000) - Y(0), X(100) - X(0));
        if (S.k1 > 0) {
          // the sold put: what the investor loses below 100%; from step 2 on, the part above the barrier only after a touch (hatched).
          // One fill for the whole area, then the part left of the barrier over it (two fills side by side leave a light seam)
          const aR = S.k1 * (1 - .7 * S.k2), aL = aR < 1 ? (S.k1 - aR) / (1 - aR) : 0;
          ctx.save(); ctx.fillStyle = U.css("--orange-light");
          ctx.globalAlpha = aR; poly([[0, 0], [0, 1000], [100, 1000]]); ctx.fill();
          if (aL > 0) { ctx.globalAlpha = aL; poly([[0, 0], [0, 1000], [bk, 1000], [bk, bk * 10]]); ctx.fill(); }
          if (S.k2 > 0) {
            ctx.globalAlpha = S.k2; poly([[bk, bk * 10], [bk, 1000], [100, 1000]]); ctx.clip();
            ctx.strokeStyle = grey; ctx.lineWidth = 2;
            for (let x = X(bk) - 400; x < X(100); x += 14) { ctx.beginPath(); ctx.moveTo(x, Yp(bk * 10)); ctx.lineTo(x + (Yp(bk * 10) - Yp(1000)), Yp(1000)); ctx.stroke(); }
          }
          ctx.restore();
          text("sold put", X(4), Yp(880), { b: true, c: ink, a: S.k1 * (1 - S.k2) });
          text("down-and-in put", X(4), Yp(880), { b: true, c: ink, a: S.k2 });
          text("safety buffer", (X(bk) + X(100)) / 2, Yp(470), { b: true, c: U.css("--green-ink"), al: "center", a: S.k2 * (1 - S.k3), s: 20 });
          text("← 35% →", (X(bk) + X(100)) / 2, Yp(470) + 28, { b: true, c: U.css("--green-ink"), al: "center", a: S.k2 * (1 - S.k3), s: 20 });
          // the payoff: shares below 100% (black), 1,000 in cash above (green); drawn left to right
          const xe = 150 * S.k1;
          ctx.lineCap = "round"; ctx.strokeStyle = loss; ctx.lineWidth = 5;
          ctx.beginPath(); ctx.moveTo(X(0), Yp(0)); ctx.lineTo(X(Math.min(xe, 100)), Yp(Math.min(xe, 100) * 10)); ctx.stroke();
          if (xe > 100) { ctx.strokeStyle = green; ctx.lineWidth = 7; ctx.beginPath(); ctx.moveTo(X(100), Yp(1000)); ctx.lineTo(X(xe), Yp(1000)); ctx.stroke(); }
          const la = lerp(S.k1, .55, 1);
          text("USD " + f0(NOM + CPN), X(150), Yp(1000) - 22, { b: true, c: green, al: "right", a: la });
          const lx = X(20), ly = Yp(200);
          text("Shares + USD " + CPN, lx + 12, ly + 14, { b: true, c: loss, al: "center", bl: "top", rot: slope, a: la * (1 - S.k2) });
          text("Shares + USD " + CPN, lx + 12, ly + 14, { b: true, c: loss, al: "center", bl: "top", rot: slope, a: la * S.k2 });
        }
        if (S.k2 > 0) {
          // the barrier at 65%: between 65% and 100% two branches, never touched (1,000 in cash) or touched (shares)
          ctx.save(); ctx.globalAlpha = S.k2; ctx.setLineDash([8, 6]); ctx.strokeStyle = loss; ctx.lineWidth = 2.5;
          ctx.beginPath(); ctx.moveTo(X(bk), f.y + f.h); ctx.lineTo(X(bk), Y(1395)); ctx.stroke(); ctx.restore();
          text("kick-in " + KI, X(bk) - 10, Y(1395), { b: true, c: loss, al: "right", bl: "top", a: S.k2 });
          ctx.strokeStyle = green; ctx.lineWidth = 7; ctx.lineCap = "round";
          ctx.beginPath(); ctx.moveTo(X(100), Yp(1000)); ctx.lineTo(X(100 - (100 - bk) * S.k2), Yp(1000)); ctx.stroke();
          
        }
        if (S.k3 > 0) {
          // three stocks: lowest → final level of each this year; any touch counts, but the worst one is paid out
          PO_EX.forEach((e, j) => {
            const col = U.css("--c-" + B.tickers[e.k].toLowerCase() + "-light"), y = rowY(j), t = lerp(S.k3, j * .12, .5 + j * .12);
            if (t <= 0) return;
            const lo = e.low * 100, fi = e.fin * 100, xr = lo + (fi - lo) * t;
            ctx.save(); ctx.globalAlpha = Math.min(1, t * 2); ctx.strokeStyle = col; ctx.lineWidth = 8; ctx.lineCap = "round";
            ctx.beginPath(); ctx.moveTo(X(lo), y); ctx.lineTo(X(xr), y); ctx.stroke();
            ctx.fillStyle = col; ctx.beginPath(); ctx.arc(X(lo), y, 7, 0, 7); ctx.fill();
            ctx.beginPath(); ctx.arc(X(xr), y, 11, 0, 7); ctx.fill();
            if (lo <= bk) { ctx.strokeStyle = loss; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(X(lo), y, 14, 0, 7); ctx.stroke(); }
            ctx.restore();
            const ta = lerp(t, .8, 1), worst = e.fin === EX_WORST;
            text(B.tickers[e.k] + " " + f0(fi) + "%" + (worst ? " · worst" : ""), X(fi) + 20, y, { b: true, c: col, a: ta });
            if (lo <= bk) text("touched " + KI, X(lo) + 16, y + 30, { b: true, c: loss, a: ta });   // under the bar, clear of the barrier line
          });
          // the box's title, with the bars' key (small dot = lowest level this year, big dot = final level); it starts right
          // of the dashed line from the worst stock up to the payoff
          const lg = lerp(S.k3, .3, .7);
          if (lg > 0) {
            const gx = Math.max(ex.x + 24, X(EX_WORST * 100) + 30), gy = ex.y + 26;
            ctx.save(); ctx.globalAlpha = lg; ctx.strokeStyle = muted; ctx.fillStyle = muted; ctx.lineWidth = 6; ctx.lineCap = "round";
            ctx.beginPath(); ctx.moveTo(gx, gy); ctx.lineTo(gx + 40, gy); ctx.stroke();
            ctx.beginPath(); ctx.arc(gx, gy, 6, 0, 7); ctx.fill(); ctx.beginPath(); ctx.arc(gx + 40, gy, 10, 0, 7); ctx.fill(); ctx.restore();
            text("Example year: lowest → final level", gx + 62, gy, { b: true, c: U.css("--ink"), a: lg });
          }
          // the worst stock's final level decides: shares worth 1,000 × 80% = 800
          const t = lerp(S.k3, .7, 1);
          if (t > 0) {
            const wx = X(EX_WORST * 100), wy = Yp(EX_SHARES), y0 = rowY(0);
            ctx.save(); ctx.globalAlpha = t; ctx.setLineDash([6, 6]); ctx.strokeStyle = orange; ctx.lineWidth = 2.5;
            ctx.beginPath(); ctx.moveTo(wx, y0 - 12); ctx.lineTo(wx, y0 - 12 + (wy - y0 + 12) * t); ctx.stroke(); ctx.setLineDash([]);
            ctx.fillStyle = orange; ctx.beginPath(); ctx.arc(wx, wy, 11, 0, 7); ctx.fill(); ctx.restore();
            text("shares " + f0(EX_SHARES) + " + coupons " + CPN + " = USD " + f0(EX_SHARES + CPN), wx + 24, wy + 3, { b: true, c: oink, a: t, halo: "#fff" });   // level with its dot (not on the 750 gridline), under the payoff line
          }
        }
      }
      return {
        resize: draw,
        step(i) {
          if (a) a.cancel();
          S.k1 = i >= 1 ? 1 : 0; S.k2 = i >= 2 ? 1 : 0; S.k3 = i >= 3 ? 1 : 0;
          cards.forEach((el, j) => el.classList.toggle("cur", j + 1 === i));
          body.querySelector(".prd-po").classList.toggle("barrier", i >= 2);
          body.querySelector(".prd-po").classList.toggle("worst", i >= 3);   // the maturity scenarios with the barrier
          const key = ["", "k1", "k2", "k3"][i];
          if (key) a = U.anim(i === 1 ? 1500 : 1100, t => { S[key] = t; draw(); }, { ease: i === 1 ? U.ease.inOut : U.ease.out });
          else draw();
        },
        leave() { if (a) a.cancel(); }
      };
    }
  });

  // ================= brc-tree: what you get at maturity, one branch per click; the three outcomes numbered 1-3 =================
  Deck.addSlide({
    id: "brc-tree", section: "product", steps: 4, secs: 34,
    title: "Payoff scenarios per USD 1,000 invested",   // outcomes 1, 2a, 2b as on the payoff slide
    subtitle: "You always get the coupons, then either your USD 1,000 back or shares of the worst stock",
    sources: "Own illustration",
    notes: `So what happens to your thousand dollars at maturity? You always get both coupons, ${CPN} dollars. [→] At the end, your thousand comes back in cash if no stock touched its barrier. [→] If one did, that's called the kick-in. Then the final prices decide. If every stock ends at or above its starting price, you still get cash. [→] If even one ends below, you get shares of the worst stock, with fractions paid in cash. [→] Say Adobe is the worst and ends ${f0((1 - EX_WORST) * 100)} percent down. The conversion ratio gives you 4.1959 shares: four Adobe shares are delivered, the rest is paid in cash. Together they're worth ${f0(EX_SHARES)} dollars, plus the coupons, ${f0(EX_SHARES + CPN)}.`,
    render(body) {
      // a tree from top to bottom (the body is 1744 × 740): question 1, then question 2 over its two answers; the three
      // outcomes side by side; under them one layer for the coupons, paid in all three
      const W3 = 560, WB = 560, G3 = 32, OY = 268, OH = 414;   // three boxes of the same width
      const A1 = [0, OY, W3, OH], B1 = [W3 + G3, OY, W3, OH], C1 = [2 * (W3 + G3), OY, WB, OH];
      const cxs = r => r[0] + r[2] / 2;
      const Q2c = (cxs(B1) + cxs(C1)) / 2, Q1c = (cxs(A1) + Q2c) / 2;
      const Q1 = [Q1c - 330, 0, 660, 70], Q2 = [Q2c - 305, 128, 610, 70];
      const CP = [0, OY + OH + 16, 1744, 740 - (OY + OH + 16)];
      // the example: the worst stock (Adobe) ends 20% down; the note delivers its conversion ratio in shares, whole shares
      // in kind and the fraction in cash
      const S0w = XL.S0[0], ST = S0w * EX_WORST, RATIO_W = NOM / S0w, WHOLE = Math.floor(RATIO_W), FRAC = RATIO_W - WHOLE;
      const fx = v => U.fmt(v, 2);
      const pos = r => `left:${r[0]}px;top:${r[1]}px;width:${r[2]}px;height:${r[3]}px`;
      const pill = (x, y, t, ok) => `<g class="pill ${ok ? "ok" : "ko"}" transform="translate(${x} ${y})"><rect x="-38" y="-21" width="76" height="42" rx="21"/><text>${t}</text></g>`;
      // a branch: down from a box to a level, across, then down into the target
      const branch = (from, x2, y2, lvl) => `<path d="M${cxs(from)} ${from[1] + from[3]}V${lvl}H${x2}V${y2 - 6}" marker-end="url(#prd-arr)"/>`;
      const L1 = Q1[3] + 29, L2 = Q2[1] + Q2[3] + 35;
      const cashBox = (r, n) => `<div class="prd-tb cash" style="${pos(r)};--d:2" data-step="${n === "1" ? 1 : 2}"><div class="hd"><span class="num g">${n}</span><b>Max return</b></div>
            <span class="sm">${n === "1" ? "No barrier breached: USD 1,000 back in cash" : "Barrier breached, but all end at or above the strike: USD 1,000 back in cash"}</span>
            <div class="eg cash"><span>Nominal</span><span class="r">${fx(NOM)}</span><span class="c">Coupons 2 × ${HALF}</span><span class="r c">+ ${fx(CPN)}</span><span class="t">Total value</span><span class="r t">USD ${fx(NOM + CPN)}</span></div></div>`;
      body.innerHTML = `
        <div class="prd-tr tree">
          <svg aria-hidden="true">
            <defs><marker id="prd-arr" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse"><path d="M0 0L10 5L0 10z" style="fill:var(--rule);stroke:none"/></marker></defs>
            <g data-step="1"><path d="M${cxs(Q1)} ${Q1[3]}V${L1}H${cxs(A1)}V${A1[1] - 6}" marker-end="url(#prd-arr)"/>${pill((cxs(A1) + cxs(Q1)) / 2, L1, "No", true)}</g>
            <g data-step="2"><path d="M${cxs(Q1)} ${L1}H${Q2c}V${Q2[1] - 6}" marker-end="url(#prd-arr)"/>${pill((cxs(Q1) + Q2c) / 2, L1, "Yes", false)}
              <path d="M${Q2c} ${Q2[1] + Q2[3]}V${L2}H${cxs(B1)}V${B1[1] - 6}" marker-end="url(#prd-arr)"/>${pill((Q2c + cxs(B1)) / 2, L2, "Yes", true)}</g>
            <g data-step="3"><path d="M${Q2c} ${L2}H${cxs(C1)}V${C1[1] - 6}" marker-end="url(#prd-arr)"/>${pill((Q2c + cxs(C1)) / 2, L2, "No", false)}</g>
          </svg>
          <div class="prd-when">
            <div class="ax"></div>
            <div class="w1" style="top:${Q1[1]}px;height:${Q1[3]}px" data-step="1"><b>During the whole term</b><span>barrier watched every day</span><span>(American-style)</span></div>
            <div class="w2" style="top:${Q2[1]}px;height:${Q2[3]}px" data-step="2"><b>Only at maturity</b><span>strike checked once</span><span>(European-style)</span></div>
          </div>
          <div class="prd-tb q" style="${pos(Q1)}" data-step="1"><span class="num">?</span><span>Kick-in: did any stock touch ${KI}?</span></div>
          <div class="prd-tb q" style="${pos(Q2)}" data-step="2"><span class="num">?</span><span>Is every stock at or above its strike?</span></div>
          ${cashBox(A1, "1")}
          ${cashBox(B1, "2a")}
          <div class="prd-tb shr" style="${pos(C1)}" data-step="3"><div class="hd"><span class="num k">2b</span><b>Shares of the worst stock</b></div>
            <span class="sm">Barrier breached, at least one ends below the strike: whole shares delivered, fraction paid in cash</span>
            <div class="exl" data-step="4"><p class="eh">Scenario: Adobe at USD ${fx(ST)} (−${f0((1 - EX_WORST) * 100)}%)</p>
              <div class="eg"><span>Conversion ratio (nominal / start)</span><span class="r">${U.fmt(RATIO_W, 4)}</span>
              <span>${WHOLE} Adobe shares delivered</span><span class="r">${fx(WHOLE * ST)}</span>
              <span>${U.fmt(FRAC, 4)} share paid in cash</span><span class="r">+ ${fx(FRAC * ST)}</span>
              <span class="c">Coupons 2 × ${HALF}</span><span class="r c">+ ${fx(CPN)}</span>
              <span class="t">Total value</span><span class="r t">USD ${fx(RATIO_W * ST + CPN)}</span></div></div></div>
          <div class="prd-cpl" style="${pos(CP)}">
            ${[A1, B1, C1].map(r => `<span class="up" style="left:${cxs(r)}px">▲</span>`).join("")}
            <span class="k">Coupons</span><span class="v">USD ${CPN} = ${N_CPN} × ${HALF}</span><span class="s">paid after ${MONTHS.join(" and ")} months, in 1, 2a and 2b</span>
          </div>
        </div>`;
      return {};
    }
  });

  // ================= brc-suits: the advantages and the risks, four each (the group's terms and lines, 27 Oct 2026) =================
  const ICON = {
    // advantages (green): a fixed coupon, paid without conditions, protection through the barrier, a cushion against losses
    pct: '<circle cx="12" cy="12" r="9"/><path d="M15.5 8.5l-7 7"/><circle cx="9" cy="9" r="1.1"/><circle cx="15" cy="15" r="1.1"/>',
    cal: '<rect x="4" y="5" width="16" height="15" rx="2"/><path d="M4 10h16M8 3v4M16 3v4"/><path d="M9 15l2 2 4-4"/>',
    shield: '<path d="M12 3l7 3v5c0 4.6-3 8.3-7 10-4-1.7-7-5.4-7-10V6z"/><path d="M8.5 12l2.5 2.5 4.5-5"/>',
    cushion: '<path d="M12 3v10"/><path d="M8 9l4 4 4-4"/><rect x="4" y="16" width="16" height="4" rx="2"/>',
    // risks (black)
    loss: '<path d="M3 6l6 6 4-4 8 8"/><path d="M21 11v5h-5"/>',
    cap: '<path d="M4 4h16"/><path d="M12 20V8"/><path d="M7.5 12.5L12 8l4.5 4.5"/>',
    div: '<ellipse cx="12" cy="7" rx="7" ry="3"/><path d="M5 7v5c0 1.7 3.1 3 7 3s7-1.3 7-3V7"/><path d="M5 12v5c0 1.7 3.1 3 7 3s7-1.3 7-3v-5"/><path d="M3 21L21 3"/>',
    bank: '<path d="M3 10l9-6 9 6"/><path d="M5 10v8M9.5 10v8M14.5 10v8M19 10v8"/><path d="M3 20h18"/>'
  };
  Deck.addSlide({
    id: "brc-suits", section: "product", steps: 1, secs: 17,
    title: "When it suits you, and the risks",
    subtitle: "Best in a sideways or slightly-down year",
    sources: "Own illustration",
    notes: `It suits stocks that go sideways or fall a little. [→] The risks: after a kick-in you lose like a shareholder, your gain is capped at ${f0(XL.coupon * 100)} percent, you get no dividends, and if UBS goes bankrupt, your money is at risk.`,
    render(body) {
      // one item: the term in bold, the line under it; the risks build in at step 1
      const item = (ic, h, p, d) => `<li class="icard"${d ? ` data-step="1" style="--d:${d}"` : ""}><span class="badge"><svg viewBox="0 0 24 24" aria-hidden="true">${ICON[ic]}</svg></span><div><h4>${h}</h4><p>${p}</p></div></li>`;
      body.innerHTML = `
        <div class="prd-su">
          <section class="panel prd-su-ok">
            <h3 class="panel-title">Advantages</h3>
            <ul>
              ${item("pct", "Fixed coupon, generally above the market interest rate", "You get a fixed coupon, generally above the market interest rate.")}
              ${item("cal", "Coupon paid without conditions", "Coupon independent of underlying’s performance")}
              ${item("shield", "Conditional capital protection through the barrier", "As long as no stock touches it, you get the full denomination back, even if the stocks have fallen")}
              ${item("cushion", "Lower risk of loss than a direct investment", "Coupon cushion provides a fixed payment you don’t have when buying the underlyings")}
            </ul>
          </section>
          <section class="panel prd-su-risk" data-step="1">
            <h3 class="panel-title">Risks</h3>
            <ul>
              ${item("loss", "Loss possible after a barrier event", "after a kick-in you take the worst stock’s loss", 1)}
              ${item("cap", `Limited earnings potential (max. ${CPN_PCT})`, `You can not earn more than USD ${f0(NOM + CPN)}, whatever the stocks do`, 2)}
              ${item("div", "No entitlement to dividends", "Dividends are only paid to shareholders", 3)}
              ${item("bank", "Issuer risk (UBS)", "If the issuer, which is UBS in this case, goes bankrupt, you could lose your money.", 4)}
            </ul>
          </section>
        </div>`;
      return {};
    }
  });

  // ================= brc-decompose: a bond minus a put =================
  // payoffs per 1,000 (coupons included where they are paid), so that product = bond − put holds term by term
  const M_BRC = `<math><mn>${N_CPN}</mn><mo>×</mo><mn>${HALF}</mn><mo>+</mo><mn>1,000</mn><mo>×</mo><mi>min</mi><mo stretchy="false">(</mo><mn>1</mn><mo>,</mo><mi>W</mi><mo stretchy="false">)</mo></math>`;
  const M_BOND = `<math><mn>${N_CPN}</mn><mo>×</mo><mn>${HALF}</mn><mo>+</mo><mn>1,000</mn></math>`;
  // the put's payoff to its owner (the bank); the "−" in front of the box means the investor sold it
  const M_PUT = `<math><mn>1,000</mn><mo>×</mo><mi>max</mi><mo stretchy="false">(</mo><mn>0</mn><mo>,</mo><mn>1</mn><mo>−</mo><mi>W</mi><mo stretchy="false">)</mo></math>`;
  Deck.addSlide({
    id: "brc-decompose", section: "product", steps: 3, secs: 18,
    title: "The Multi-BRC is a bond minus a put",
    subtitle: "You lend the issuer USD 1,000 and sell them a down-and-in put on the worst of three. The coupon is what they pay you for it.",
    sources: "Arnold (2026), slide 14 (same payoffs, same price); own illustration",
    notes: `To price it, we split it in two: [→] a UBS bond that pays the coupons and the thousand, [→] minus the put you sold. [→] The bond is easy. The put is the hard part, and that's where Monte Carlo comes in.`,
    render(body) {
      body.innerHTML = `
        <div class="prd-dec">
          <div class="prd-box gray">
            <span class="chip ink">THE PRODUCT</span>
            <h4>Multi-BRC</h4>
            <p>Pay USD 1,000 today. Get USD ${CPN} in coupons, then USD 1,000 or shares of the worst stock (final level W).</p>
            <div class="prd-f">${M_BRC}<small>after a kick-in (else USD ${f0(NOM + CPN)})</small></div>
          </div>
          <div class="prd-op" data-step="1">=</div>
          <div class="prd-box green" data-step="1">
            <span class="chip">BOND</span>
            <h4>UBS bond</h4>
            <p>Pays the coupons and the USD 1,000, whatever the stocks do.</p>
            <div class="prd-f">${M_BOND}<small>in every scenario</small></div>
          </div>
          <div class="prd-op" data-step="2">−</div>
          <div class="prd-box put" data-step="2">
            <span class="chip put">SOLD PUT</span>
            <h4>Down-and-in put on the worst of three</h4>
            <p>You sold it: after a kick-in, you bear the loss.</p>
            <div class="prd-f">${M_PUT}<small>only after a kick-in</small></div>
          </div>
          <div class="card prd-same" data-step="2" style="--d:3"><span class="badge">${U.icon("book")}</span><div><b>The law of one price</b>Same payoffs, same price</div></div>
          <div class="prd-vd easy" data-step="3"><span class="badge">${U.icon("check")}</span><div><h4>Bond: Easy to price</h4><p>just discount it</p></div></div>
          <div class="prd-vd hard" data-step="3" style="--d:3"><span class="badge">${U.icon("warn")}</span><div><h4>Put: Hard to price</h4><p>barrier + three stocks</p></div></div>
          <p class="prd-mcgo" data-step="3" style="--d:6">→ that's where Monte Carlo comes in</p>
        </div>`;
      return {};
    }
  });

  // ================= brc-why-mc: why the Multi-BRC has no simple formula =================
  // The example year: the first seed from 1681 on with a kick-in AND a loss at maturity, so the story always works,
  // also after the inputs change. With the final Excel's inputs that is 1918: Microsoft touches 65% on day 47, Adobe ends
  // weakest at 87.9% (Apple 114.8%), redemption 879 + 150 coupons.
  let SEED = 1681, SC = U.simBRC(U.normal(U.rng(SEED)));
  // also: the worst stock ends above the kick-in level (so the touch alone cut the payout), every path stays inside the
  // chart's 40-130% axis, and none runs through the "STRIKE 100%" label in the first 25 days
  const inChart = sc => sc.paths.every(p => p.every((v, t) => v > 0.42 && v < 1.27 && (t > 25 || v < 1.004 || v > 1.07)));
  while (!(SC.ki && SC.worst < B.strike && SC.worst > B.kickIn + 0.03 && inChart(SC)) && SEED < 9681) SC = U.simBRC(U.normal(U.rng(++SEED)));
  // the binomial tree of the lecture (slide 10) for three stocks: a recombining tree in three dimensions has (k + 1)^3 nodes
  // after k days, so over 252 trading days Σ (k + 1)^3 = (253 · 254 / 2)^2 = 1,032,401,161 nodes; one stock over 3 steps: 10
  const DIM = B.tickers.length, treeNodes = (days, dim) => { let s = 0; for (let k = 0; k <= days; k++) s += Math.pow(k + 1, dim); return s; };
  const NODES = treeNodes(B.steps, DIM), NODES_BN = NODES / 1e9;
  Deck.addSlide({
    id: "brc-why-mc", section: "why", after: "bs-recap", steps: 6, secs: 54,
    title: "Why Monte Carlo is used for the Multi-BRC",
    subtitle: "A barrier alone has a formula. Three stocks alone have a formula. Both together do not.",
    sources: "Arnold (2026), slides 9–10; Rubinstein & Reiner (1991); Stulz (1982); Johnson (1987); own simulation",
    notes: `(Clicks 1–3: one simulated year, no narration.) [→] [→] [→] Our product breaks both. [→] First, the barrier: one touch at any moment changes everything, so the whole path matters. [→] Second, three stocks: the less they move together, the more likely one of them falls through its barrier on its own. There are formulas for a barrier on one stock, and for the worst of two stocks, but none for our product. [→] And the binomial tree from the lecture? With three stocks and ${B.steps} trading days, it grows to about a billion nodes. Far too big for Excel: that's the curse of dimensionality. Monte Carlo avoids it. So what is Monte Carlo?`,
    render(body) {
      const sc = SC;
      const n = B.steps, red1000 = Math.round(sc.redemption * NOM);
      const stat = (k, cls, style) => `<div><div class="k">${k}</div><div class="v ${cls || ""}" style="${style || ""}">–</div></div>`;
      // the reasons, written from this scenario's numbers (they follow the inputs if the Excel team changes them)
      // callout 2 points at the day of the touch: the stock that fell through on its own (with our inputs MSFT, day 47) next to
      // the other two, well above it (a year without a touch: the worst stock's lowest day)
      const lowDay = (() => { const p = sc.paths[sc.worstAsset]; let t0 = 0; for (let t = 1; t <= n; t++) if (p[t] < p[t0]) t0 = t; return t0; })();
      const kDay = sc.ki ? sc.kiDay : lowDay, kAsset = sc.ki ? sc.kiAsset : sc.worstAsset;
      const kt = B.tickers[kAsset].toLowerCase(), KCOL = `var(--c-${kt})`, KTXT = `var(--c-${kt}-light)`;   // line colour · text colour
      const why1 = sc.ki
        ? `One touch on <b>day ${sc.kiDay}</b> cut the payout from USD ${f0(NOM + CPN)} to USD ${f0(red1000 + CPN)}: the <b>whole path</b> matters.`
        : `The ${KI} barrier is watched every day: the <b>whole path</b> matters.`;
      const why2 = `<div class="t">The less they move together, the more likely one falls through its barrier <b>on its own</b>.</div>
        <div class="t">Formulas exist for a barrier on one stock (Rubinstein &amp; Reiner, 1991) and the worst of two (Stulz, 1982): <b>none for ours</b>.</div>`;
      const call = (k, cc, ct, head, inner) => `<div class="prd-call c${k}" data-step="${k + 3}" style="--cc:${cc};--ct:${ct}"><div class="h"><span class="n">${k}</span>${head}</div>${inner}</div>`;
      // reason 3 (step 6): the lecture's binomial tree (slide 10), redrawn for one stock and three steps (10 nodes), next to its
      // size for ours; on a card of its own while the chart fades out. Node (c, s): after c steps, s = downs − ups
      const TX = c => 52 + c * 200, TY = s => 180 + s * 52;
      const pw = (v, k) => k === 0 ? "" : k === 1 ? `<mi>${v}</mi>` : `<msup><mi>${v}</mi><mn>${k}</mn></msup>`;
      let edges = "", nodes = "";
      for (let c = 0; c <= 3; c++) for (let s = -c; s <= c; s += 2) {
        nodes += `<div class="prd-tree-n" style="left:${TX(c)}px;top:${TY(s)}px"><math>${pw("u", (c - s) / 2)}${pw("d", (c + s) / 2)}<msub><mi>S</mi><mn>0</mn></msub></math></div>`;
        if (c < 3) [-1, 1].forEach(ds => { edges += `M${TX(c) + 52} ${TY(s)}L${TX(c + 1) - 52} ${TY(s + ds)}`; });
      }
      const sum = `<math displaystyle="true"><munderover><mo>∑</mo><mrow><mi>k</mi><mo>=</mo><mn>0</mn></mrow><mn>${n}</mn></munderover><msup><mrow><mo stretchy="false">(</mo><mi>k</mi><mo>+</mo><mn>1</mn><mo stretchy="false">)</mo></mrow><mn>${DIM}</mn></msup><mo>=</mo><mn>${U.fmt(NODES, 0)}</mn></math>`;
      const tree = `<section class="prd-tree" data-step="6" style="--d:5">
          <div class="prd-tree-h"><span class="num">3</span><h3>The binomial tree</h3></div>
          <div class="prd-tree-b">
            <div>
              <div class="prd-tree-g"><svg aria-hidden="true"><path d="${edges}"/></svg>${nodes}</div>
              <p class="prd-tree-cap">1 stock, 3 steps: ${treeNodes(3, 1)} nodes</p>
            </div>
            <div class="prd-tree-r">
              <p class="k">${DIM} stocks × ${n} trading days</p>
              <p class="big">≈ ${U.fmt(NODES_BN, 2)} billion nodes</p>
              <div class="eq">${sum}</div>
              <p class="t">Far too big for Excel: the <b>curse of dimensionality</b>.</p>
              <p class="mc">→ So we simulate: Monte Carlo</p>
            </div>
          </div>
        </section>`;
      const callouts = `<div class="prd-co">
          <svg aria-hidden="true">
            <line class="l1" data-step="4" pathLength="1" style="--cc:var(--term-red)"/><circle class="r1" data-step="4" r="15" style="--cc:var(--term-red)"/>
            <line class="l2" data-step="5" pathLength="1" style="--cc:${KCOL}"/><path class="b2" data-step="5" style="--cc:${KCOL}"/>
            <g class="dots" data-step="5">${B.tickers.map((t, k) => k === kAsset ? "" : `<circle class="d${k}" r="7" style="--dc:var(--c-${t.toLowerCase()})"/>`).join("")}</g>
          </svg>
          ${call(1, "var(--term-red)", "var(--term-red)", "THE BARRIER", `<div class="t">${why1}</div>`)}
          ${call(2, KCOL, KTXT, "THREE STOCKS", why2)}
        </div>`;
      body.innerHTML = `
        <div class="prd-mc">
          ${U.term({
            fn: "SCEN", title: "ONE POSSIBLE YEAR · WORST OF ADBE / AAPL / MSFT",
            meta: `VOL ${B.sigma.map(v => Math.round(v * 100)).join("/")}% · CORR ${U.fmt(Math.min(B.rho[0][1], B.rho[0][2], B.rho[1][2]), 2)}–${U.fmt(Math.max(B.rho[0][1], B.rho[0][2], B.rho[1][2]), 2)} · OUR EXCEL'S INPUTS`,
            body: `<canvas></canvas>${callouts}`,
            stats: stat("Trading day", "d") + B.tickers.map((t, k) => stat(t, "s" + k, `color:var(--c-${t.toLowerCase()}-light)`)).join("") + stat("Kick-in", "ki") + stat("Payout per USD 1,000", "pay")
          })}
          ${tree}
        </div>`;
      const wrap = body.querySelector(".prd-mc"), cv = body.querySelector("canvas"), big = body.querySelector(".prd-tree .big");
      const el = s => body.querySelector(".term-stats .v." + s);
      const vD = el("d"), vS = [0, 1, 2].map(k => el("s" + k)), vKI = el("ki"), vPay = el("pay");
      const S = { upto: 0, ki: false, flash: false, mat: 0, lab: true, two: 0 };
      let anims = [], raf = 0, active = false, pulse = 0;
      const pct = v => U.fmt(v * 100, 1) + "%";

      const CO = body.querySelector(".prd-co"), CALL = [1, 2].map(k => CO.querySelector(".c" + k));
      // the chart's frame and scales: draw() draws them with U.axes, place() also needs them before the first draw
      const AX = { xMin: 0, xMax: n, yMin: 0.4, yMax: 1.3 };
      const frame = (w, h) => {
        const f = { x: 96, y: 26, w: w - 96 - 214, h: h - 26 - 72 };
        return { f, X: v => f.x + (v - AX.xMin) / (AX.xMax - AX.xMin) * f.w, Y: v => f.y + f.h - (v - AX.yMin) / (AX.yMax - AX.yMin) * f.h };
      };
      // places callouts 1-2 where they hide the least; computed once per canvas and box size (ahead of time, see warm() below)
      let placedFor = "";
      function place(f, X, Y) {
        const key = [f.w, f.h, ...CALL.map(e => e.offsetWidth + "x" + e.offsetHeight)].join("|");   // re-place when the size or the fonts change
        if (key === placedFor || !CALL[0].offsetWidth) return;
        placedFor = key;
        const ctx = cv.getContext("2d");
        const PAD = 12, clamp = (v, a, b) => Math.max(a, Math.min(b, v));
        const segs = [], rects = [];
        sc.paths.forEach(p => { for (let t = 1; t <= n; t++) segs.push([X(t - 1), Y(p[t - 1]), X(t), Y(p[t])]); });
        const dashed = [B.strike, B.kickIn].map(v => [f.x, Y(v), f.x + f.w, Y(v)]);           // the dashed lines
        rects.push({ x: f.x, y: Y(B.strike) - 34, w: 150, h: 30 }, { x: f.x, y: Y(B.kickIn) - 34, w: 150, h: 30 }); // their labels
        ctx.font = "700 20px " + U.F.mono;
        if (sc.ki) {
          rects.push({ x: X(sc.kiDay) - 4, y: Y(B.kickIn), w: 8, h: f.y + f.h - Y(B.kickIn) });   // its dotted drop line (its label is hidden once the boxes show)
        }
        const tw2 = ctx.measureText("WORST −00.0%").width;                                    // the maturity bracket and its label
        rects.push({ x: X(n) - 46 - tw2, y: (Y(B.strike) + Y(sc.worst)) / 2 - 16, w: tw2 + 46, h: Math.abs(Y(sc.worst) - Y(B.strike)) / 2 + 20 });
        // callout 2's anchor: on the day of the touch, a bracket from the stock at the barrier up to the highest of the three,
        // a tick at each stock's level, and a dot on the other two paths
        const lv = sc.paths.map((p, k) => k === kAsset && sc.ki ? B.kickIn : p[kDay]);
        const kx = X(kDay), bkx = kx + 28, ys = lv.map(Y), yT = Math.min(...ys), yB = Math.max(...ys);
        CO.querySelector(".b2").setAttribute("d", `M${bkx - 10} ${yT}H${bkx}V${yB}H${bkx - 10}` + ys.filter(y => y !== yT && y !== yB).map(y => `M${bkx - 10} ${y}H${bkx}`).join(""));
        rects.push({ x: bkx - 12, y: yT - 4, w: 16, h: yB - yT + 2 });   // ends just above the barrier line, so box 1 fits under it
        lv.forEach((v, k) => {
          const d = CO.querySelector(".dots .d" + k); if (!d) return;
          d.setAttribute("cx", kx); d.setAttribute("cy", Y(v));
          rects.push({ x: kx - 9, y: Y(v) - 9, w: 18, h: 18 });
        });
        // the stock lines and the dashed lines as a grid of 2 px cells with a summed-area table: "does this box touch a line?"
        // is one lookup per position tried (the scan below tries tens of thousands); connectors drawn later go in extra
        const C = 2, GW = Math.ceil((f.x + f.w) / C) + 2, GH = Math.ceil((f.y + f.h) / C) + 2, R = GW + 1;
        const occ = new Uint8Array(GW * GH), sat = new Int32Array(R * (GH + 1));
        const gx = v => clamp(Math.floor(v / C), 0, GW - 1), gy = v => clamp(Math.floor(v / C), 0, GH - 1);
        segs.concat(dashed).forEach(g => {
          const x0 = gx(Math.min(g[0], g[2])), x1 = gx(Math.max(g[0], g[2]));
          for (let y = gy(Math.min(g[1], g[3])), y1 = gy(Math.max(g[1], g[3])); y <= y1; y++) occ.fill(1, y * GW + x0, y * GW + x1 + 1);
        });
        for (let y = 0; y < GH; y++) for (let x = 0, row = 0; x < GW; x++) { row += occ[y * GW + x]; sat[(y + 1) * R + x + 1] = sat[y * R + x + 1] + row; }
        const lines = (x0, y0, x1, y1) => { const a = gx(x0), b = gx(x1), c = gy(y0), d = gy(y1); return sat[(d + 1) * R + b + 1] - sat[c * R + b + 1] - sat[(d + 1) * R + a] + sat[c * R + a] > 0; };
        const extra = [];
        const near = (g, r) => Math.max(g[0], g[2]) >= r.x - PAD && Math.min(g[0], g[2]) <= r.x + r.w + PAD && Math.max(g[1], g[3]) >= r.y - PAD && Math.min(g[1], g[3]) <= r.y + r.h + PAD;
        const over = (q, r) => q.x < r.x + r.w + PAD && q.x + q.w > r.x - PAD && q.y < r.y + r.h + PAD && q.y + q.h > r.y - PAD;
        const onPath = r => lines(r.x - PAD, r.y - PAD, r.x + r.w + PAD, r.y + r.h + PAD) || extra.some(g => near(g, r));
        const onHard = r => dashed.some(g => g[1] >= r.y - PAD && g[1] <= r.y + r.h + PAD) || rects.some(q => over(q, r));
        // does the segment cross rectangle q (grown by 6 px)? Liang-Barsky clipping
        const crosses = (x0, y0, x1, y1, q) => {
          let t0 = 0, t1 = 1;
          const p = [x0 - x1, x1 - x0, y0 - y1, y1 - y0], d = [x0 - q.x + 6, q.x + q.w + 6 - x0, y0 - q.y + 6, q.y + q.h + 6 - y0];
          for (let i = 0; i < 4; i++) {
            if (p[i] === 0) { if (d[i] < 0) return false; continue; }
            const t = d[i] / p[i];
            if (p[i] < 0) { if (t > t1) return false; t0 = Math.max(t0, t); } else { if (t < t0) return false; t1 = Math.min(t1, t); }
          }
          return true;
        };
        const ends = (r, ax, ay, rad) => {                                                    // connector: from the box edge to just before the point
          const cx = clamp(ax, r.x, r.x + r.w), cy = clamp(ay, r.y, r.y + r.h), d = Math.hypot(ax - cx, ay - cy) || 1;
          return [cx, cy, ax - (ax - cx) / d * rad, ay - (ay - cy) / d * rad];
        };
        const spot = (el, tx, ty, ax, ay, rad) => {
          const bw = el.offsetWidth, bh = el.offsetHeight;
          const scan = bad => {
            let best = null, bd = Infinity;
            for (let y = f.y + 4; y + bh <= f.y + f.h - 2; y += 4) for (let x = f.x + 6; x + bw <= f.x + f.w - 6; x += 6) {
              const d = Math.hypot(x + bw / 2 - tx, y + bh / 2 - ty);
              if (d >= bd) continue;
              const r = { x, y, w: bw, h: bh };
              if (bad(r)) continue;
              const e = ends(r, ax, ay, rad);
              // labels right at the point it explains (drop line, bracket) may touch the connector's end
              if (rects.some(q => !(ax > q.x - 16 && ax < q.x + q.w + 16 && ay > q.y - 16 && ay < q.y + q.h + 16) && crosses(e[0], e[1], e[2], e[3], q))) continue;
              bd = d; best = r;
            }
            return best;
          };
          // 1st: free of lines and labels; 2nd: may cover a stock line (the box is opaque); 3rd: may also cross a dashed line;
          // never a label or the other box. Only if all fail: clamp into the frame
          const best = scan(r => onPath(r) || onHard(r)) || scan(onHard) || scan(r => rects.some(q => over(q, r)))
            || { x: clamp(tx - bw / 2, f.x + 6, f.x + f.w - 6 - bw), y: clamp(ty - bh / 2, f.y + 4, f.y + f.h - 2 - bh), w: bw, h: bh };
          el.style.left = best.x + "px"; el.style.top = best.y + "px";
          rects.push(best);
          return best;
        };
        const link = (k, r, ax, ay, rad) => {
          const e = ends(r, ax, ay, rad), l = CO.querySelector(".l" + k), c = CO.querySelector(".r" + k);
          l.setAttribute("x1", e[0]); l.setAttribute("y1", e[1]); l.setAttribute("x2", e[2]); l.setAttribute("y2", e[3]);
          if (c) { c.setAttribute("cx", ax); c.setAttribute("cy", ay); }
          extra.push(e);                                                                       // the next box keeps clear of this connector
        };
        const a1 = sc.ki ? [kx, Y(B.kickIn)] : [kx, Y(lv[kAsset])];
        const a2 = [bkx, (yT + yB) / 2];
        // both boxes right of that day: 1 under the touch, 2 next to the bracket
        link(1, spot(CALL[0], a1[0] + 24 + CALL[0].offsetWidth / 2, a1[1] + 14 + CALL[0].offsetHeight / 2, a1[0], a1[1], 15), a1[0], a1[1], 15);
        link(2, spot(CALL[1], a2[0] + 36 + CALL[1].offsetWidth / 2, a2[1], a2[0], a2[1], 0), a2[0], a2[1], 0);   // the nib meets the bracket's spine
      }
      function stats() {
        vD.textContent = String(S.upto);
        vS.forEach((e, k) => e.textContent = pct(sc.paths[k][S.upto]));
        vKI.textContent = S.ki ? "DAY " + sc.kiDay + " · " + B.tickers[sc.kiAsset] : "–";
        vKI.classList.toggle("hit", !!S.ki);
        vPay.textContent = S.mat > 0 ? `${red1000} + ${CPN} = USD ${f0(red1000 + CPN)}` : "–";
      }
      function draw() {
        stats();
        const c = U.canvas(cv); if (!c) return;
        const { ctx, w, h } = c;
        const amber = U.css("--amber"), tred = U.css("--term-red"), text = U.css("--term-text"), grey = U.css("--muted");
        const cols = B.tickers.map(t => U.css("--c-" + t.toLowerCase())), tcols = B.tickers.map(t => U.css("--c-" + t.toLowerCase() + "-light"));   // lines · labels
        const { f } = frame(w, h);
        const { X, Y } = U.axes(ctx, f, Object.assign({
          xTicks: [0, 63, 126, 189, 252], yTicks: [0.6, 0.8, 1, 1.2],
          yFmt: v => Math.round(v * 100) + "%", xLabel: "TRADING DAY", yLabel: "% OF INITIAL LEVEL"
        }, AX));
        place(f, X, Y);
        const hline = (v, col, lab, below) => {
          ctx.setLineDash([9, 7]); ctx.strokeStyle = col; ctx.lineWidth = 2;
          ctx.beginPath(); ctx.moveTo(f.x, Y(v)); ctx.lineTo(f.x + f.w, Y(v)); ctx.stroke(); ctx.setLineDash([]);
          ctx.fillStyle = col; ctx.font = "700 18px " + U.F.mono; ctx.textAlign = "left"; ctx.textBaseline = below ? "top" : "bottom";
          ctx.fillText(lab, f.x + 10, Y(v) + (below ? 8 : -8));
        };
        hline(B.strike, grey, "STRIKE " + Math.round(B.strike * 100) + "%");   // grey: the three greens are the stocks, black the kick-in
        hline(B.kickIn, tred, "KICK-IN " + KI); // label above the line, clear of the 60% axis label
        // paths: the worst one on top; dim the others at maturity, except the stock that touched while reason 2 is about it
        // (on the white panel the dimmed lines keep 45%, their labels 67%, so the light greens stay readable)
        const dim = k => k === sc.worstAsset ? 1 : 1 - .55 * S.mat * (k === kAsset ? 1 - S.two : 1), dimT = k => 1 - (1 - dim(k)) * .6;
        const order = [0, 1, 2].filter(k => k !== sc.worstAsset).concat([sc.worstAsset]);
        order.forEach(k => {
          const isW = k === sc.worstAsset;
          ctx.globalAlpha = dim(k);
          ctx.strokeStyle = cols[k]; ctx.lineWidth = isW ? 2.6 + 2 * S.mat : 2.6; ctx.lineJoin = "round";
          ctx.beginPath(); ctx.moveTo(X(0), Y(1));
          for (let t = 1; t <= S.upto; t++) ctx.lineTo(X(t), Y(sc.paths[k][t]));
          ctx.stroke();
        });
        ctx.globalAlpha = 1;
        // heads + labels (pushed apart so they never overlap)
        const heads = [0, 1, 2].map(k => ({ k, y: Y(sc.paths[k][S.upto]) })).sort((p, q) => p.y - q.y);
        for (let j = 1; j < 3; j++) if (heads[j].y - heads[j - 1].y < 28) heads[j].y = heads[j - 1].y + 28;
        let wy = 0;
        heads.forEach(hd => {
          const v = sc.paths[hd.k][S.upto], x = X(S.upto), y = Y(v), isW = hd.k === sc.worstAsset;
          if (isW) wy = hd.y;
          if (S.upto === 0) return; // day 0: the stats bar shows 100% for all three
          ctx.globalAlpha = dim(hd.k);
          ctx.fillStyle = cols[hd.k]; ctx.beginPath(); ctx.arc(x, y, 5, 0, 7); ctx.fill();
          ctx.globalAlpha = dimT(hd.k); ctx.fillStyle = tcols[hd.k];
          ctx.font = "700 19px " + U.F.mono; ctx.textAlign = "left"; ctx.textBaseline = "middle";
          ctx.fillText(B.tickers[hd.k] + " " + pct(v), x + 22, hd.y);
        });
        ctx.globalAlpha = 1;
        // kick-in marker (flashes while the slide is shown)
        if (S.ki) {
          const x = X(sc.kiDay), y = Y(B.kickIn), ph = U.reduced || !S.flash ? 0 : pulse;
          if (!U.reduced && S.flash) { ctx.strokeStyle = tred; ctx.lineWidth = 3; ctx.globalAlpha = 1 - ph; ctx.beginPath(); ctx.arc(x, y, 9 + 26 * ph, 0, 7); ctx.stroke(); ctx.globalAlpha = 1; }
          ctx.fillStyle = tred; ctx.beginPath(); ctx.arc(x, y, 8, 0, 7); ctx.fill();
          ctx.setLineDash([3, 5]); ctx.strokeStyle = tred; ctx.lineWidth = 1.5;
          ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x, f.y + f.h); ctx.stroke(); ctx.setLineDash([]);
          const lab = "KICK-IN · DAY " + sc.kiDay + " · " + B.tickers[sc.kiAsset];
          if (S.lab) {
            ctx.font = "700 20px " + U.F.mono; const tw = ctx.measureText(lab).width;
            // right of the dot, clear of the axis labels (left of it only if it would leave the plot)
            let bx = x + 18; if (bx + tw + 20 > f.x + f.w - 4) bx = Math.max(f.x + 4, x - 18 - (tw + 20));
            const by = y + 14, on = U.reduced || !S.flash || ph < .6;
            ctx.fillStyle = on ? tred : U.css("--term-bg"); ctx.fillRect(bx, by, tw + 20, 32);
            ctx.strokeStyle = tred; ctx.lineWidth = 2; ctx.strokeRect(bx, by, tw + 20, 32);
            ctx.fillStyle = on ? "#fff" : tred; ctx.textAlign = "left"; ctx.textBaseline = "middle"; ctx.fillText(lab, bx + 10, by + 17);   // white on the black label, black on white
          }
        }
        // maturity: worst stock vs strike, redemption per 1,000
        if (S.mat > 0) {
          ctx.globalAlpha = S.mat;
          const x = X(n), y1 = Y(B.strike), y2 = Y(sc.worst), bx = x - 26;
          ctx.strokeStyle = tred; ctx.lineWidth = 3;
          ctx.beginPath(); ctx.moveTo(bx + 8, y1); ctx.lineTo(bx, y1); ctx.lineTo(bx, y2); ctx.lineTo(bx + 8, y2); ctx.stroke();
          ctx.fillStyle = tred; ctx.font = "700 20px " + U.F.mono; ctx.textAlign = "right"; ctx.textBaseline = "middle";
          const wl = "WORST −" + U.fmt((1 - sc.worst) * 100, 1) + "%", wtw = ctx.measureText(wl).width, wyy = (y1 + y2) / 2;
          // readable over a path without cutting a gap into the worst stock's line: a see-through white box (the line runs on,
          // paler, under the label) and a white halo round the letters
          ctx.fillStyle = "rgba(255,255,255,.78)"; ctx.fillRect(bx - 10 - wtw - 6, wyy - 15, wtw + 12, 30);
          ctx.lineJoin = "round"; ctx.lineWidth = 6; ctx.strokeStyle = "rgba(255,255,255,.92)"; ctx.strokeText(wl, bx - 10, wyy);
          ctx.fillStyle = tred; ctx.fillText(wl, bx - 10, wyy);
          ctx.fillStyle = amber; ctx.font = "700 19px " + U.F.mono; ctx.textAlign = "left"; ctx.textBaseline = "middle";
          const ls = [`PAYS ${red1000} + ${CPN}`, `= USD ${f0(red1000 + CPN)}`, "PER USD 1,000"];
          const lx = Math.min(x + 22, w - 20 - Math.max(...ls.map(l => ctx.measureText(l).width)));   // inside the panel, clear of its edge
          ls.forEach((l, j) => ctx.fillText(l, lx, wy + 28 + 24 * j));
          ctx.globalAlpha = 1;
        }
        ctx.fillStyle = text; ctx.beginPath(); ctx.arc(X(0), Y(1), 5, 0, 7); ctx.fill();
      }
      // place the callouts ahead of time (fonts loaded, in an idle moment), so entering the slide does not wait for the scan
      const warm = () => { try { const w = cv.clientWidth, h = cv.clientHeight; if (w && h) { const g = frame(w, h); place(g.f, g.X, g.Y); } } catch (e) { console.error(e); } };
      (document.fonts ? document.fonts.ready : Promise.resolve()).then(() => window.requestIdleCallback ? requestIdleCallback(warm, { timeout: 3000 }) : setTimeout(warm, 500));
      function loop(t) { pulse = (t % 1100) / 1100; draw(); raf = requestAnimationFrame(loop); }
      function startLoop() { if (!raf && active && !U.reduced && S.flash) raf = requestAnimationFrame(loop); }
      function stopLoop() { cancelAnimationFrame(raf); raf = 0; }
      function cancelAll() { anims.forEach(x => x.cancel()); anims = []; }
      return {
        resize: draw,
        enter() { active = true; startLoop(); },
        leave() { active = false; stopLoop(); cancelAll(); },
        step(i) {
          cancelAll();
          // final state for step i, then animate only the change that step i introduces
          S.upto = i >= 1 ? n : 0; S.ki = i >= 2 && sc.ki; S.flash = i === 2 || i === 3; S.mat = i >= 3 ? 1 : 0;
          S.lab = i < 4; S.two = i >= 5 ? 1 : 0;
          wrap.classList.toggle("verdict", i >= 6);
          if (!S.flash) stopLoop();
          draw();
          if (i === 1) anims.push(U.anim(5200, t => { S.upto = Math.round(n * t); draw(); }, { ease: U.ease.lin }));
          if (i === 3) anims.push(U.anim(900, t => { S.mat = Math.max(.001, t); draw(); }));
          if (i === 5) anims.push(U.anim(500, t => { S.two = t; draw(); }));   // the stock reason 2 is about comes back to full strength
          // the tree's size counts up once its card has faded in (the card waits 0.45 s for the chart to fade out)
          if (i >= 6) anims.push(U.anim(1850, k => { big.textContent = "≈ " + U.fmt(NODES_BN * U.ease.out(Math.max(0, (k * 1850 - 450) / 1400)), 2) + " billion nodes"; }, { ease: U.ease.lin }));
          else big.textContent = "≈ " + U.fmt(NODES_BN, 2) + " billion nodes";
          startLoop();
        }
      };
    }
  });
})();
