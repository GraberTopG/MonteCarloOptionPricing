/* The Multi-BRC (multi barrier reverse convertible), video script sections 3 and 4: its product family, the payoff in three
   steps, what you get at maturity, when it suits you, bond minus put (tab "product"). The slide on why it has no simple
   formula (brc-why-mc) was removed on 1 Nov 2026 (the group).
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
    .prd-tr.tree .prd-tb.cash .eg.cash{font-size:24px;line-height:1.35;margin-top:auto;padding-top:10px;border-top:2px dashed #B9D3C1}
    .prd-tr.tree .prd-tb .sm{display:block;margin:0;font-size:22px;line-height:1.35;color:var(--ink)}
    .prd-tr.tree .prd-tb.shr .exl{font-size:24px;line-height:1.35;margin-top:auto;padding-top:8px}   /* the same row height as the cash boxes, so the three totals line up at the bottom */
    .prd-tr.tree .prd-tb.shr .exl .eh{font-weight:700;margin:0 0 2px}
    .prd-tr.tree .prd-tb.shr .exl .eg>span:nth-child(-n+2){color:var(--muted)}
    .prd-when{position:absolute;left:1510px;top:0;width:244px;height:0}
    .prd-when .ax{position:absolute;left:0;top:-6px;width:3px;background:var(--rule)}
    .prd-when .ax.a2::after{content:"";position:absolute;left:-7px;bottom:-4px;border:8.5px solid transparent;border-top:12px solid var(--rule);border-bottom:0}
    .prd-when>div:not(.ax){position:absolute;left:18px;right:0;display:flex;flex-direction:column;justify-content:center;font:18px/1.25 var(--f-body);color:var(--muted)}
    .prd-when>div:not(.ax)::before{content:"";position:absolute;left:-24px;top:50%;width:15px;height:15px;margin-top:-7.5px;border-radius:50%;background:var(--green-ink)}
    .prd-when b{font:700 20px/1.2 var(--f-body);color:var(--ink)}
    .slide .prd-when [data-step]{transform:none}
    .slide .prd-cpl[data-step]{transform:none}
    .prd-cpl{position:absolute;background:var(--green);border-radius:12px;color:#fff;display:flex;align-items:center;justify-content:center;gap:22px;font:700 26px/1 var(--f-body)}
    .prd-cpl .k{text-transform:uppercase;letter-spacing:.06em;font-size:22px;background:#fff;color:var(--green);padding:6px 12px;border-radius:6px}
    .prd-cpl .v{font-size:30px} .prd-cpl .s{font-weight:400;font-size:24px;opacity:.95}
    .prd-cpl .up{position:absolute;top:-17px;font-size:14px!important;margin-left:-10px;color:var(--green);font-size:20px;line-height:1}
    .prd-tb .eg{display:grid;grid-template-columns:1fr auto;column-gap:16px}
    .prd-tb .eg .r{text-align:right;font-variant-numeric:tabular-nums}
    .prd-tb .eg .t{font-weight:700;border-top:1.5px solid var(--ink);margin-top:2px}
    .prd-tb .eg .c{color:var(--green);font-weight:700}   /* the coupons, in every outcome */
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

    /* ---------- brc-paths: the three simulated years, the outcome cards under the chart ---------- */
    .pa-chart{position:absolute;left:0;right:0;top:0;height:500px}
    .pa-cards{position:absolute;left:0;right:0;top:516px;bottom:0;display:grid;grid-template-columns:repeat(3,1fr);gap:32px}
    .pa-card{border-radius:12px;padding:16px 28px 14px;display:flex;flex-direction:column}
    .slide .pa-card[data-step]{transform:none}
    .pa-card.g{background:var(--green-light);box-shadow:inset 0 6px 0 var(--green)} .pa-card.k{background:var(--red-soft);box-shadow:inset 0 6px 0 var(--red-ink)}
    .pa-card .hd{display:flex;align-items:center;gap:16px;margin-bottom:8px}
    .pa-card .hd b{font:700 28px/1.1 var(--f-body)} .pa-card.g .hd b{color:var(--green)} .pa-card.k .hd b{color:var(--red-ink)}
    .pa-card .num{width:48px;height:48px;font-size:22px} .pa-card .num.g{background:var(--green)} .pa-card .num.k{background:var(--red-ink)}
    .pa-card .eg{display:grid;grid-template-columns:1fr auto;column-gap:16px;font:24px/1.45 var(--f-body);color:var(--ink);margin-top:auto}
    .pa-card .eg .r{text-align:right;font-variant-numeric:tabular-nums}
    .pa-card .eg .c{color:var(--green);font-weight:700}
    .pa-card .eg .t{font-weight:700;border-top:1.5px solid var(--ink);margin-top:2px}
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
    .prd-op.mi{font-size:0;display:flex;align-items:center;justify-content:center} .prd-op.mi::before{content:"";width:40px;height:9px;border-radius:2px;background:var(--green-ink)}   /* a minus as heavy as the "=" */
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
    .prd-same{font-size:22px} .prd-same .eq{display:block;white-space:nowrap}
    .prd-same .badge svg{fill:none;stroke:currentColor;stroke-width:2;stroke-linecap:round;stroke-linejoin:round}
    .prd-dec{position:relative} .prd-wdef{position:absolute;left:0;top:640px;width:560px;margin:0;font:italic 22px/1.3 var(--f-body);color:var(--muted)}   /* outside the grid */
    .prd-vd{grid-row:2;align-self:stretch;border-radius:10px;padding:32px 28px;display:flex;gap:24px;align-items:center}
    .prd-vd.easy{grid-column:3;background:var(--green-light);border-left:8px solid var(--green)}
    .prd-vd.hard{grid-column:5;background:var(--orange-light);border-left:8px solid var(--red-ink)}
    .prd-vd .badge{width:68px;height:68px}
    .prd-vd.easy .badge{background:var(--green)} .prd-vd.hard .badge{background:var(--red-ink)}
    .prd-vd h4{margin:0;font:700 34px/1.15 var(--f-head);color:var(--ink);white-space:nowrap}
    .prd-vd p{margin:6px 0 0;font:30px/1.3 var(--f-body);color:var(--ink)}
    .prd-mcgo{grid-column:5/6;grid-row:3;margin:-30px 0 0;text-align:center;font:700 34px/1.2 var(--f-head);color:var(--ink);white-space:nowrap}
    .prd-mcgo b{color:var(--green);font-weight:800}
    .prd-mcgo .ar{display:block;font:800 40px/1 var(--f-body);color:var(--green);margin-bottom:2px}
    .prd-box.put,.prd-vd.hard{position:relative}
    .prd-box.put .chip{z-index:2}
    .prd-mcring{position:absolute;inset:-6px;border:4px solid var(--green);border-radius:14px;pointer-events:none}
    .slide .prd-mcring[data-step]{transform:none}
  `);


  // ================= brc-payoff: the payoff diagram gains one feature per click =================
  // step 3's example: the same 2b year as on brc-paths and the title (seed 7, U.simYears in 00-title.js): one stock (with
  // our inputs Adobe) breaks through the 65% barrier and then recovers to 80%, the worst final level, so the investor gets
  // its shares worth 800 (the same 20% fall as on brc-tree); the two others never touch. One row per stock, the worst on top
  const poEx = () => {
    const y = U.simYears(7).bad, ks = [0, 1, 2].sort((p, q) => y.fins[p] - y.fins[q]);
    return ks.map(k => ({ k, low: y.los[k], fin: y.fins[k] }));
  };
  Deck.addSlide({
    id: "brc-payoff", section: "product", after: "brc-paths", steps: 3, secs: 60,   // after the tree and the simulated years: concrete first, then the option view
    title: "The Payoff Chart of the Multi-BRC",
    subtitle: "Built in three steps: reverse convertible, barrier, worst-of principle",
    sources: "Own illustration, inspired by Vontobel Markets (2023), Zoller (2026); option view: Allet (2025); barrier touch: Swiss Structured Products Association (2026)",
    notes: "",
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
      let a = null, PO_EX = null;
      function draw() {
        const c = U.canvas(cv); if (!c) return;
        const { ctx, w, h } = c;
        if (!PO_EX) PO_EX = poEx();
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
            const ta = lerp(t, .8, 1), worst = j === 0;
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
    id: "brc-tree", section: "product", steps: 3, secs: 34,
    title: "Payoff scenarios per USD 1,000 invested",   // outcomes 1, 2a, 2b as on the payoff slide
    subtitle: "You always get the coupons, then either your USD 1,000 back or shares of the worst stock",
    sources: "Own illustration",
    notes: "",
    render(body) {
      // a tree from top to bottom (the body is 1744 × 740): question 1, then question 2 over its two answers; the three
      // outcomes side by side; under them one layer for the coupons, paid in all three
      const W3 = 560, WB = 560, G3 = 32, OY = 290, OH = 414, BH = 764;   // the tree starts 24 px higher (BH: its height)   // three boxes of the same width
      const A1 = [0, OY, W3, OH], B1 = [W3 + G3, OY, W3, OH], C1 = [2 * (W3 + G3), OY, WB, OH];
      const cxs = r => r[0] + r[2] / 2;
      const Q2c = (cxs(B1) + cxs(C1)) / 2, Q1c = (cxs(A1) + Q2c) / 2;
      const Q1 = [Q1c - 330, 0, 660, 62], Q2 = [Q2c - 305, 154, 610, 62];
      const CP = [0, OY + OH + 16, 1744, BH - (OY + OH + 16)];
      // the example: the worst stock (Adobe) ends 20% down; the note delivers its conversion ratio in shares, whole shares
      // in kind and the fraction in cash
      const S0w = XL.S0[0], ST = S0w * EX_WORST, RATIO_W = NOM / S0w, WHOLE = Math.floor(RATIO_W), FRAC = RATIO_W - WHOLE;
      const fx = v => U.fmt(v, 2);
      const pos = r => `left:${r[0]}px;top:${r[1]}px;width:${r[2]}px;height:${r[3]}px`;
      const pill = (x, y, t, ok) => `<g class="pill ${ok ? "ok" : "ko"}" transform="translate(${x} ${y})"><rect x="-38" y="-21" width="76" height="42" rx="21"/><text>${t}</text></g>`;
      // a branch: down from a box to a level, across, then down into the target
      const branch = (from, x2, y2, lvl) => `<path d="M${cxs(from)} ${from[1] + from[3]}V${lvl}H${x2}V${y2 - 6}" marker-end="url(#prd-arr)"/>`;
      const L1 = Q1[3] + 36, L2 = Q2[1] + Q2[3] + 36;
      const cashBox = (r, n) => `<div class="prd-tb cash" style="${pos(r)};--d:2" data-step="${n === "1" ? 1 : 2}"><div class="hd"><span class="num g">${n}</span><b>Max return</b></div>
            <span class="sm">${n === "1" ? "No barrier breached: USD 1,000 back in cash" : "Barrier breached, but all end at or above the strike: USD 1,000 back in cash"}</span>
            <div class="eg cash"><span>Nominal</span><span class="r">${fx(NOM)}</span><span class="c">Coupons 2 × ${HALF}</span><span class="r c">+ ${fx(CPN)}</span><span class="t">Total value</span><span class="r t">USD ${fx(NOM + CPN)}</span></div></div>`;
      body.innerHTML = `
        <div class="prd-tr tree" style="top:-24px;height:${BH}px">
          <svg aria-hidden="true">
            <defs><marker id="prd-arr" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse"><path d="M0 0L10 5L0 10z" style="fill:var(--rule);stroke:none"/></marker></defs>
            <g data-step="1"><path d="M${cxs(Q1)} ${Q1[3]}V${L1}H${cxs(A1)}V${A1[1] - 6}" marker-end="url(#prd-arr)"/>${pill((cxs(A1) + cxs(Q1)) / 2, L1, "No", true)}</g>
            <g data-step="2"><path d="M${cxs(Q1)} ${L1}H${Q2c}V${Q2[1] - 6}" marker-end="url(#prd-arr)"/>${pill((cxs(Q1) + Q2c) / 2, L1, "Yes", false)}
              <path d="M${Q2c} ${Q2[1] + Q2[3]}V${L2}H${cxs(B1)}V${B1[1] - 6}" marker-end="url(#prd-arr)"/>${pill((Q2c + cxs(B1)) / 2, L2, "Yes", true)}</g>
            <g data-step="3"><path d="M${Q2c} ${L2}H${cxs(C1)}V${C1[1] - 6}" marker-end="url(#prd-arr)"/>${pill((Q2c + cxs(C1)) / 2, L2, "No", false)}</g>
          </svg>
          <div class="prd-when">
            <div class="ax a1" data-step="1" style="height:${Q1[3] + 40}px"></div>
            <div class="ax a2" data-step="2" style="top:${Q1[3] + 34}px;height:${Q2[1] + Q2[3] - Q1[3] - 6}px"></div>
            <div class="w1" style="top:${Q1[1]}px;height:${Q1[3]}px" data-step="1"><b>During the whole term</b><span>barrier watched continuously</span><span>(American-style)</span></div>
            <div class="w2" style="top:${Q2[1]}px;height:${Q2[3]}px" data-step="2"><b>Only at maturity</b><span>strike checked once</span><span>(European-style)</span></div>
          </div>
          <div class="prd-tb q" style="${pos(Q1)}" data-step="1"><span class="num">?</span><span>Kick-in: did any stock touch ${KI}?</span></div>
          <div class="prd-tb q" style="${pos(Q2)}" data-step="2"><span class="num">?</span><span>Is every stock at or above its strike?</span></div>
          ${cashBox(A1, "1")}
          ${cashBox(B1, "2a")}
          <div class="prd-tb shr" style="${pos(C1)}" data-step="3"><div class="hd"><span class="num k">2b</span><b>Shares of the worst stock</b></div>
            <span class="sm">If the barrier is breached and the stock ends below its strike</span>
            <div class="exl"><p class="eh">Scenario: Adobe at USD ${fx(ST)} (−${f0((1 - EX_WORST) * 100)}%)</p>
              <div class="eg"><span>Conversion ratio (nominal / start)</span><span class="r">${U.fmt(RATIO_W, 4)}</span>
              <span>${WHOLE} Adobe shares delivered</span><span class="r">${fx(WHOLE * ST)}</span>
              <span>${U.fmt(FRAC, 4)} share paid in cash</span><span class="r">+ ${fx(FRAC * ST)}</span>
              <span class="c">Coupons 2 × ${HALF}</span><span class="r c">+ ${fx(CPN)}</span>
              <span class="t">Total value</span><span class="r t">USD ${fx(RATIO_W * ST + CPN)}</span></div></div></div>
          <div class="prd-cpl" style="${pos(CP)}" data-step="1">
            ${[A1, B1, C1].map(r => `<span class="up" style="left:${cxs(r)}px">▲</span>`).join("")}
            <span class="k">Semi-annual coupons</span><span class="v">USD ${CPN} = ${N_CPN} × ${HALF}</span>
          </div>
        </div>`;
      return {};
    }
  });

  // ================= brc-paths: the title slide's simulated years again, the three scenarios one per click =================
  // (the same seed as the title slide, so the same three years; drawn after the payoff chart)
  const NOTES_PA = "";
  Deck.addSlide({
    id: "brc-paths", section: "product", steps: 3, secs: 40,
    title: "The three scenarios simulated",
    subtitle: "Three simulated paths of the worst underlying, one per scenario",
    sources: "Own illustration",
    notes: "",
    render(body) {
      // the chart over the top of the body, the three outcome cards in a row under it (each appears when its year has ended)
      body.innerHTML = `<div class="pa-chart"></div><div class="pa-cards"></div>`;
      const api = U.pathsArt(body.querySelector(".pa-chart"), 7, { inBody: true, steps: true, labelsIn: true, X0: 0, X1: 1690, XR: 1690,
        Y1: 250, SC: 400, LY: 2000, dates: { issue: "ISSUE DATE: 6 OCT 2026", expiry: "MATURITY: 6 OCT 2027", y: [8, 492] } });
      const sc = api.scen(), fx = v => U.fmt(v, 2), NOMv = B.nominal, CPNv = Math.round(XL.coupon * NOMv), HALFv = U.fmt(CPNv / 2, 0);
      const cash = (num, head) => `<div class="pa-card g" data-step="${num === "1" ? 1 : 2}" style="--d:39"><div class="hd"><span class="num g">${num}</span><b>${head}</b></div>
        <div class="eg"><span>Nominal</span><span class="r">${fx(NOMv)}</span><span class="c">Coupons 2 × ${HALFv}</span><span class="r c">+ ${fx(CPNv)}</span>
        <span class="t">Total value</span><span class="r t">USD ${fx(NOMv + CPNv)}</span></div></div>`;
      const shv = NOMv * sc.bad.end;
      body.querySelector(".pa-cards").innerHTML = cash("1", "No kick-in, ended above strike") + cash("2a", "Kick-in, but ended above strike")
        + `<div class="pa-card k" data-step="3" style="--d:39"><div class="hd"><span class="num k">2b</span><b>Kick-in, ended below strike</b></div>
        <div class="eg"><span>Shares of the worst stock</span><span class="r">${fx(shv)}</span><span class="c">Coupons 2 × ${HALFv}</span><span class="r c">+ ${fx(CPNv)}</span>
        <span class="t">Total value</span><span class="r t">USD ${fx(shv + CPNv)}</span></div></div>`;
      return api;
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
    id: "brc-suits", section: "product", steps: 2, secs: 17,
    title: "Advantages and risks of the Multi-BRC",
    subtitle: "A high, fixed coupon in exchange for capped upside and downside risk",
    sources: "Allet (2025)",
    notes: "",
    render(body) {
      // one item: the term in bold, the line under it; the advantages build in at step 1, the risks at step 2
      const item = (ic, h, p, d, st) => `<li class="icard"${d ? ` data-step="${st || 2}" style="--d:${d}"` : ""}><span class="badge"><svg viewBox="0 0 24 24" aria-hidden="true">${ICON[ic]}</svg></span><div><h4>${h}</h4><p>${p}</p></div></li>`;
      body.innerHTML = `
        <div class="prd-su">
          <section class="panel prd-su-ok" data-step="1">
            <h3 class="panel-title">Advantages</h3>
            <ul>
              ${item("pct", "Fixed coupon, generally above the market interest rate", "You get a fixed coupon, generally above the market interest rate.", 1, 1)}
              ${item("cal", "Coupon paid without conditions", "Coupon independent of underlying’s performance", 2, 1)}
              ${item("shield", "Conditional capital protection through the barrier", "As long as no stock touches it, you get the full denomination back, even if the stocks have fallen", 3, 1)}
              ${item("cushion", "Lower risk of loss than a direct investment", "Coupon cushion provides a fixed payment you don’t have when buying the underlyings", 4, 1)}
            </ul>
          </section>
          <section class="panel prd-su-risk" data-step="2">
            <h3 class="panel-title">Risks</h3>
            <ul>
              ${item("loss", "Loss possible after a barrier event", "after a kick-in you take the worst stock’s loss", 1)}
              ${item("cap", `Limited earnings potential (max. ${CPN_PCT})`, `You can not earn more than USD ${f0(NOM + CPN)}, whatever the stocks do`, 2)}
              ${item("div", "No entitlement to dividends", "Dividends are only paid to shareholders", 3)}
              ${item("bank", "Issuer risk (UBS)", "The note is unsecured debt of UBS: if UBS goes bankrupt, you could lose your money, even without a kick-in.", 4)}
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
    subtitle: "You lend UBS USD 1,000 and sell a down-and-in put on the worst of three: the put finances the high coupon",
    sources: "Arnold (2026), slide 14; Wallmeier & Diethelm (2009)",
    notes: "",
    render(body) {
      body.innerHTML = `
        <div class="prd-dec">
          <div class="prd-box gray">
            <span class="chip ink">THE PRODUCT</span>
            <h4>Multi-BRC</h4>
            <p>Pay USD 1,000 today. Get USD ${CPN} in coupons, then USD 1,000 or shares of the worst stock.</p>
            <div class="prd-f">${M_BRC}<small>if a kick-in occurred; otherwise USD ${f0(NOM + CPN)}</small></div>
          </div>
          <div class="prd-op" data-step="1">=</div>
          <div class="prd-box green" data-step="1">
            <span class="chip">BOND</span>
            <h4>UBS bond</h4>
            <p>Pays the coupons and the USD 1,000, whatever the stocks do.</p>
            <div class="prd-f">${M_BOND}<small>in every scenario</small></div>
          </div>
          <div class="prd-op mi" data-step="2" aria-label="minus">−</div>
          <div class="prd-box put" data-step="2">
            <span class="chip put">SOLD PUT</span>
            <h4>Down-and-in put on the worst of three</h4>
            <p>You sold it: after a kick-in, you bear the loss.</p>
            <div class="prd-f">${M_PUT}<small>only after a kick-in</small></div>
          </div>
          <div class="card prd-same" data-step="2" style="--d:3"><span class="badge"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3v18M5 21h14"/><path d="M4 7h16"/><path d="M7 7l-3 7a3 3 0 0 0 6 0z"/><path d="M17 7l-3 7a3 3 0 0 0 6 0z"/></svg></span><div><b>The law of one price</b><span class="eq">Price(Multi-BRC) =</span><span class="eq">Price(bond) − Price(put)</span></div></div>
          <div class="prd-vd easy" data-step="3"><span class="badge">${U.icon("check")}</span><div><h4>Bond: Easy to price</h4><p>just discount it</p></div></div>
          <div class="prd-vd hard" data-step="3" style="--d:3"><span class="badge">${U.icon("warn")}</span><div><h4>Put: Hard to price</h4><p>barrier + three stocks</p></div></div>
          <p class="prd-wdef">W = worst stock at maturity ÷ its starting price</p>
          <p class="prd-mcgo" data-step="3" style="--d:6"><span class="ar">↑</span>Valued with <b>Monte Carlo</b></p>
        </div>`;
      return {};
    }
  });
})();
