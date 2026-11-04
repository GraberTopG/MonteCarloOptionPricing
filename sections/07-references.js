/* References (APA 7th edition). Owner: script person.
   Every entry except Arnold (2026) was checked twice by independent agents on 3 Oct 2026 (Crossref, publisher
   and official pages); Arnold (2026) was checked against the Lecture 4 PDF (title slide) on 4 Oct 2026.
   Every link was tested on 4 Oct 2026.
   Eckhardt (1987) and Metropolis (1987) were checked against the original sources. Bloomberg (2026) is the data source of our
   Excel (sheet 0 lists it); Swiss Structured Products Association (2026) gives the product category (1230).
   24 Oct 2026 (rebuild to the final video script): the list is now exactly the script's 15 sources. The Synthetic
   Mind (2026) moved into the list, because part 2 of the video adapts its explanation ("adapted from" on the
   slides). Dropped, because neither the script nor any slide uses them any more: Basle Committee (1996), Board of
   Governors (2026a-d), Brealey et al. (2014), Chetty et al. (2007), Los Alamos National Laboratory (n.d.-a, -b),
   Metropolis & Ulam (1949), Silver et al. (2016), Swiss National Bank (2026), University of St.Gallen (2026).
   24 Oct 2026: every link re-tested with curl. All resolve; the DOIs of Black & Scholes (1973) and Broadie et al.
   (1997) redirect to the publishers' article pages, which block scripts (HTTP 403) but open in a browser.
   28 Oct 2026 (group feedback): the Bloomberg entry now has the group author "Bloomberg." (APA). Johnson (1987)
   added for slide 16, the formula for the worst of several stocks (Stulz (1982) covers two); checked against
   Crossref and the publisher's page. Now 16 sources. Every link re-tested: all answer, the two DOIs above as before
   (HTTP 403 to scripts), learning.unisg.ch with the university's sign-in page.
   4 Nov 2026 (sources check): Boyle (1977), Johnson (1987), Rubinstein & Reiner (1991) and Stulz (1982) removed, because
   no slide uses them since the two slides were removed on 1 Nov. UBS, Vontobel and Swissquote now give the author and
   date shown on the page: Allet (2025), Vontobel Markets (2023; German title with an English translation) and Zoller
   (2026, updated 19 Oct 2026). Wallmeier & Diethelm (2009): pages 59–72 and the DOI (the jod.pm-research.com link is
   dead). SSPA: the map's full title. Glasserman (2003) back for the Cholesky and exponential steps
   (removed on 29 Oct in an edit by Claude, not by a group decision). Now 15 sources. Every link re-tested: all answer; the DOIs of Black & Scholes
   (1973) and Broadie et al. (1997) and the UBS page answer HTTP 403 to scripts but open in a browser. */
(function () {
  const REFS = [
    "Allet, J. (2025, July 18). <i>Barrier reverse convertibles explained clearly</i>. UBS. <a class=\"ext\" href=\"https://www.ubs.com/ch/en/services/guide/investments/articles/barrier-reverse-convertibles.html\" target=\"_blank\" rel=\"noopener\">https://www.ubs.com/ch/en/services/guide/investments/articles/barrier-reverse-convertibles.html</a>",
    "Arnold, M. (2026). <i>7,107 Corporate Finance – Lecture 4: Options and real options</i> [Lecture slides]. Canvas, University of St.Gallen. <a class=\"ext\" href=\"https://learning.unisg.ch/\" target=\"_blank\" rel=\"noopener\">https://learning.unisg.ch/</a>",
    "Black, F., &amp; Scholes, M. (1973). The pricing of options and corporate liabilities. <i>Journal of Political Economy, 81</i>(3), 637–654. <a class=\"ext\" href=\"https://doi.org/10.1086/260062\" target=\"_blank\" rel=\"noopener\">https://doi.org/10.1086/260062</a>",
    "Bloomberg. (2026). <i>Daily closing prices, option quotes, dividends, USD 1-year rate and UBS senior CDS spread for Adobe, Apple and Microsoft</i> [Data set]. Retrieved October 6, 2026, from the Bloomberg Terminal.",
    "Broadie, M., Glasserman, P., &amp; Kou, S. (1997). A continuity correction for discrete barrier options. <i>Mathematical Finance, 7</i>(4), 325–349. <a class=\"ext\" href=\"https://doi.org/10.1111/1467-9965.00035\" target=\"_blank\" rel=\"noopener\">https://doi.org/10.1111/1467-9965.00035</a>",
    "Cox, J. C., Ross, S. A., &amp; Rubinstein, M. (1979). Option pricing: A simplified approach. <i>Journal of Financial Economics, 7</i>(3), 229–263. <a class=\"ext\" href=\"https://doi.org/10.1016/0304-405X(79)90015-1\" target=\"_blank\" rel=\"noopener\">https://doi.org/10.1016/0304-405X(79)90015-1</a>",
    "Eckhardt, R. (1987). Stan Ulam, John von Neumann, and the Monte Carlo method. <i>Los Alamos Science</i>, (15), 131–141. <a class=\"ext\" href=\"https://permalink.lanl.gov/object/tr?what=info:lanl-repo/lareport/LA-UR-88-9068\" target=\"_blank\" rel=\"noopener\">https://permalink.lanl.gov/object/tr?what=info:lanl-repo/lareport/LA-UR-88-9068</a>",
    "Glasserman, P. (2003). <i>Monte Carlo methods in financial engineering</i>. Springer. <a class=\"ext\" href=\"https://doi.org/10.1007/978-0-387-21617-1\" target=\"_blank\" rel=\"noopener\">https://doi.org/10.1007/978-0-387-21617-1</a>",
    "Merton, R. C. (1973). Theory of rational option pricing. <i>The Bell Journal of Economics and Management Science, 4</i>(1), 141–183. <a class=\"ext\" href=\"https://doi.org/10.2307/3003143\" target=\"_blank\" rel=\"noopener\">https://doi.org/10.2307/3003143</a>",
    "Metropolis, N. (1987). The beginning of the Monte Carlo method. <i>Los Alamos Science</i>, (15), 125–130. <a class=\"ext\" href=\"https://permalink.lanl.gov/object/tr?what=info:lanl-repo/lareport/LA-UR-88-9067\" target=\"_blank\" rel=\"noopener\">https://permalink.lanl.gov/object/tr?what=info:lanl-repo/lareport/LA-UR-88-9067</a>",
    "Swiss Structured Products Association. (2026). <i>SSPA Swiss Derivative Map© 2026</i> [Product classification]. <a class=\"ext\" href=\"https://sspa.ch/wp-content/uploads/2026/01/en_sspaswissmap_2026.pdf\" target=\"_blank\" rel=\"noopener\">https://sspa.ch/wp-content/uploads/2026/01/en_sspaswissmap_2026.pdf</a>",
    "The Synthetic Mind. (2026, January 30). <i>Monte Carlo simulation explained visually</i> [Video]. YouTube. <a class=\"ext\" href=\"https://www.youtube.com/watch?v=WjmNedsX1T0\" target=\"_blank\" rel=\"noopener\">https://www.youtube.com/watch?v=WjmNedsX1T0</a>",
    "Vontobel Markets. (2023, November 7). <i>Barrier Reverse Convertibles: Funktionsweise</i> [Barrier reverse convertibles: How they work]. <a class=\"ext\" href=\"https://markets.vontobel.com/de-ch/know-how/40292/barrier-reverse-convertibles-funktionsweise\" target=\"_blank\" rel=\"noopener\">https://markets.vontobel.com/de-ch/know-how/40292/barrier-reverse-convertibles-funktionsweise</a>",
    "Wallmeier, M., &amp; Diethelm, M. (2009). Market pricing of exotic structured products: The case of multi-asset barrier reverse convertibles in Switzerland. <i>The Journal of Derivatives, 17</i>(2), 59–72. <a class=\"ext\" href=\"https://doi.org/10.3905/jod.2009.17.2.059\" target=\"_blank\" rel=\"noopener\">https://doi.org/10.3905/jod.2009.17.2.059</a>",
    "Zoller, C. (2026, October 19). What are barrier reverse convertibles and how do they work? <i>Swissquote</i>. <a class=\"ext\" href=\"https://www.swissquote.com/en-ch/private/inspire/blog/markets-instruments/what-are-barrier-reverse-convertibles-and-how-do-they-work\" target=\"_blank\" rel=\"noopener\">https://www.swissquote.com/en-ch/private/inspire/blog/markets-instruments/what-are-barrier-reverse-convertibles-and-how-do-they-work</a>"
  ];

  Deck.addStyle(`
    .rf-box{background:var(--green-light);border-radius:10px;padding:20px 32px 16px;display:flex;flex-direction:column}
    .slide[data-id="references"] .s-body{top:170px}   /* no subtitle: the list starts under the title rule */
    .rf-list{columns:2;column-gap:44px;margin:0;padding:0;list-style:none;font:17px/1.26 var(--f-body);color:var(--ink)}
    .rf-list a{overflow-wrap:anywhere}
    .rf-list a.ext::after{content:"\\00a0\\2197"}
    .rf-list li{break-inside:avoid;padding-left:30px;text-indent:-30px;margin:0 0 6px}
    .rf-list i{font-style:italic}
    .rf-style{margin:6px 0 0;padding-top:10px;border-top:1px solid #B9D3C1;font:17px/1.3 var(--f-body);color:#3D4A43}
    .rf-style b{color:var(--green-ink)}
    /* download the slides PDF: on the subtitle line, never in the video (hidden in record mode R) */
    .slide a.rf-pdf{position:absolute;right:0;top:-90px;color:#fff;text-decoration:none}
    .slide a.rf-pdf.old{background:#7C8481}
    body.rec .rf-pdf{display:none}
  `);

  Deck.addSlide({
    id: "references", section: "references",   // no tab highlighted: not part of the conclusion
    steps: 0, secs: 0,   // not in the video (it ends on the end card): the source list for the slides PDF
    title: "References",
    sources: "APA 7th edition · links checked 4 November 2026",
    notes: "(Not recorded: the video ends on the end card. This slide is the source list of the slides PDF we hand in: 15 sources.)",
    render(body) {
      const pdf = Deck.util.slidesPdf();
      body.innerHTML = `
        ${pdf ? `<a class="ui-btn rf-pdf${pdf.old ? " old" : ""}" href="${pdf.href}" download="Monte-Carlo-Option-Pricing-slides.pdf" title="${pdf.title}"><span class="ic">↓</span>Download presentation as PDF${pdf.old ? " (older version)" : ""}</a>` : ""}
        <div class="rf-box">
          <ul class="rf-list">${REFS.map(r => `<li>${r.replace(/>(https?:\/\/[^<]+)<\/a>/g, (m, u) => ">" + u.replace(/\//g, "/<wbr>") + "</a>")}</li>`).join("")}</ul>
        </div>`;
      return {};
    }
  });
})();
