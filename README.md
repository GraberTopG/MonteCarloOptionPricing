# Monte Carlo Option Pricing

**Pricing a Worst-Of Multi Barrier Reverse Convertible on Adobe, Apple and Microsoft**

Group video project · Corporate Finance (7,107) · University of St.Gallen (HSG) · Fall Term 2026

**Group III:** Ali Bozan Can, Benjamin Marco Bolliger, Cédric Anwar El Soda, Ivan Kissinger, Joaquim Graber, Leandro Broccucci, Mirko Cirantineo

▶️ **Presentation (web app):** https://montecarlooptionpricing.streamlit.app/

📄 **Slides (PDF):** made from the final web app before the hand-in

---

## Objectives

Within the Corporate Finance course, a segment of the evaluation comprises a video, which holds a **30% weightage** in the overall grading criteria.

- **Length:** 15 minutes, with a permissible deviation of ±10%.
- **Audience:** the finished video is made publicly accessible to all other students.
- **Production:** the method is at the group's discretion. Animated videos are expressly permitted, but the narration must be recorded by the group members themselves. Synthetic or AI-generated voices are not allowed.
- **Lecture link:** the video must make explicit references to the lecture material relevant to the topic.
- **Assessment:** besides content, the method of knowledge dissemination and the technical quality (clear, comprehensible audio and visuals) are assessed.
- **Hand-in:** maximum file size 500 MB. Slides shown in the video, the Excel file used for calculations, and an overview of all sources and references are submitted together with the video.

### Topic: Monte Carlo Option Pricing

> In your video, explain to the students how to derive the price of an exotic option using Monte Carlo simulations in Excel. The objective is for the students to be able to calculate the price of a non-trivial option in Excel.

1. **Introduction to the topic**
   - a) Select an exotic option whose price is difficult to calculate due to certain characteristics.
   - b) Briefly explain the fundamental concept or intuition behind the chosen exotic option.
   - c) Provide a brief explanation of the underlying concept of Monte Carlo simulations.
2. **Deriving the price of the chosen option in Excel**
   - a) Explain the template you have created.
   - b) Walk through the steps of the pricing calculation step by step.
3. **Concluding remarks, outlook and conclusion**

---

## Our approach

**The product.** A one-year UBS **Worst-Of Multi Barrier Reverse Convertible (Multi-BRC)** on Adobe, Apple and Microsoft: USD 1,000 nominal, 15% p.a. coupon paid semi-annually, strike 100%, kick-in barrier 65%. If none of the three stocks touches the barrier, you get USD 1,000 back plus coupons. If one does and the worst stock ends below its starting price, you receive shares of the worst performer instead.

**Why Monte Carlo.** The Multi-BRC is a bond minus a down-and-in put on the worst of three stocks. With three correlated underlyings and a path-dependent barrier, there is no Black-Scholes formula, and a binomial tree would need over a billion nodes. Simulating many possible years and averaging the discounted payoffs works instead.

**The Excel model, step by step**

| Step | Excel sheets | What happens |
|---|---|---|
| Calibration | 3–6 | Implied volatilities from 150 option quotes; correlations from 252 daily returns |
| Random numbers | 7 | 2,000 paths × 252 days × 3 stocks of fixed standard-normal draws |
| Engine | 8–9 | Correlated shocks (Cholesky), geometric Brownian motion step, kick-in check and payoff for one path; a data table repeats it 2,000 times |
| Results | 10–11 | Fair value = bond − put, issue premium, fair coupon, sensitivities and engine checks |

**Key results** (2,000 paths, risk-neutral)

- Fair value ≈ **USD 925** for a product sold at USD 1,000, so the bank keeps about USD 75 (≈ 7.5%).
- Fair coupon ≈ **23%** p.a., compared with the 15% paid.
- In about 45% of simulated years, the investor ends below USD 1,000 with coupons included.
- A check with 400,000 scenarios in Python gives a fair value of 92.1% of nominal, within the simulation error of the Excel result.

---

## Repository contents

| Path | Contents |
|---|---|
| `index.html`, `app.js`, `theme.css` | The presentation, built as a web app (used to record the video) |
| `sections/` | One file per section of the video (see *Editing the slides* below) |
| `streamlit_app.py`, `requirements.txt` | Publishes the web app on Streamlit Community Cloud |
| `sections/excel-data.js` | Inputs, results and formulas taken from the group's Excel model |

The list of sources and references is on the last slide and in `sections/07-references.js`.

## Editing the slides

Every push to `main` updates the online presentation automatically (about a minute later). Each section of the video has its own file; every slide in it is one `Deck.addSlide({ … })` block, where `title`, `subtitle` and `sources` are plain text.

| File | Slides |
|---|---|
| `sections/00-title.js` | Title slide and "A quiet year" (price chart, three choices, the Multi-BRC) |
| `sections/02-product.js` | The Multi-BRC: payoff tree, simulated paths, payoff chart, advantages and risks, bond minus put, path dependence |
| `sections/01-lecture.js` | Black-Scholes recap and binomial tree recap |
| `sections/03-montecarlo.js` | Monte Carlo: the die, the three steps, geometric Brownian motion, curse of dimensionality, precision |
| `sections/05-excel.js` | Pricing in Excel |
| `sections/06-conclusion.js` | Conclusion |
| `sections/07-references.js` | Reference list |
| `sections/excel-data.js` | Numbers taken from the Excel model (inputs, results, price history) |
| `theme.css`, `app.js` | Colours and fonts; the slide engine (navigation, animations, menu tabs) |

Before editing, pull the latest version (`git pull`) so you don't overwrite a teammate's changes.

## Viewing the presentation

**Online:** https://montecarlooptionpricing.streamlit.app/ (Streamlit Community Cloud, `streamlit_app.py`). It is open to everyone with the link; a password page appears only if the Streamlit secret `SITE_PASSWORD` is set in the app's settings.

**Locally:** it is a static site with no build step. Open `index.html` through any local web server, for example:

```bash
python3 -m http.server 8000
# then open http://localhost:8000
```

or as online: `pip install streamlit` and `streamlit run streamlit_app.py`.

**Controls:** ← / → or scroll to move through the slides · `F` full screen · `H` show clickable elements
