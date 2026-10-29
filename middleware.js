/* Password gate for the whole site. Vercel runs this before every request, including the code files,
   so nothing is handed out before the group password was entered.
   - The password lives in the Vercel project as the environment variable SITE_PASSWORD, never in this repo.
   - After the right password a cookie keeps the browser signed in for 60 days.
   - To change it: edit SITE_PASSWORD in Vercel (Settings > Environment Variables) and redeploy.
     Everyone then has to enter the new password once. */
import { next } from "@vercel/functions";

const COOKIE = "cf_gate";
const DAYS = 60;

async function token(pw) {
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode("cf-monte-carlo|" + pw));
  return [...new Uint8Array(buf)].map(b => b.toString(16).padStart(2, "0")).join("");
}
function readCookie(request, name) {
  const m = (request.headers.get("cookie") || "").match(new RegExp("(?:^|;\\s*)" + name + "=([^;]+)"));
  return m ? m[1] : null;
}
// only ever send people back to a page on this site
const safeNext = v => (typeof v === "string" && /^\/(?![/\\])/.test(v) ? v : "/");

export default async function middleware(request) {
  const pw = process.env.SITE_PASSWORD;
  if (!pw) return page("This site is locked because no group password has been set up yet.", 503, false);
  const good = await token(pw);
  const url = new URL(request.url);

  if (url.pathname === "/__login" && request.method === "POST") {
    const form = await request.formData().catch(() => null);
    const given = form ? String(form.get("password") || "") : "";
    const to = safeNext(form ? String(form.get("next") || "/") : "/");
    if (given && (await token(given)) === good) {
      return new Response(null, {
        status: 303,
        headers: {
          Location: to,
          "Set-Cookie": `${COOKIE}=${good}; Path=/; Max-Age=${DAYS * 86400}; HttpOnly; Secure; SameSite=Lax`,
          "Cache-Control": "no-store"
        }
      });
    }
    await new Promise(r => setTimeout(r, 800));   // slows down guessing
    return page("Wrong password. Please try again.", 401, true, to);
  }

  if (readCookie(request, COOKIE) === good) return next();
  return page("", 401, true);
}

const esc = s => s.replace(/[&<>"']/g, c => "&#" + c.charCodeAt(0) + ";");

function page(message, status, form, back = "/") {
  const html = `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="robots" content="noindex,nofollow"><title>Monte Carlo Option Pricing</title>
<style>
  :root{--green:#00802F;--green-ink:#1F3B2D;--muted:#6B716E;--rule:#D5DAD8;--red:#C9302C}
  *{box-sizing:border-box}
  body{margin:0;min-height:100vh;display:grid;place-items:center;background:#F4F6F5;font:16px/1.5 Arial,Helvetica,sans-serif;color:#1A1D1B;padding:16px}
  .box{width:100%;max-width:420px;background:#fff;border:1px solid var(--rule);border-top:6px solid var(--green);border-radius:6px;padding:32px 28px 28px;box-shadow:0 8px 30px rgba(0,0,0,.06)}
  .kicker{font:700 12px/1 Arial,sans-serif;letter-spacing:.14em;color:var(--green);text-transform:uppercase;margin:0 0 12px}
  h1{font:800 26px/1.2 Arial,sans-serif;color:var(--green-ink);margin:0 0 8px}
  p{margin:0 0 20px;color:var(--muted)}
  label{display:block;font-weight:700;font-size:14px;margin-bottom:6px}
  input{width:100%;font:16px Arial,sans-serif;padding:11px 12px;border:1px solid #B8C0BC;border-radius:4px}
  input:focus{outline:2px solid var(--green);outline-offset:1px;border-color:var(--green)}
  button{margin-top:16px;width:100%;font:700 16px Arial,sans-serif;color:#fff;background:var(--green);border:0;border-radius:999px;padding:12px;cursor:pointer;box-shadow:0 2px 6px rgba(0,0,0,.18)}
  button:hover{background:#006B27}
  .err{color:var(--red);font-weight:700;margin:0 0 14px}
</style></head><body>
<main class="box">
  <div class="kicker">Corporate Finance (7,107) · group project</div>
  <h1>Monte Carlo Option Pricing</h1>
  <p>This web app is for our group only. Enter the group password to open it.</p>
  ${message ? `<p class="err" role="alert">${message}</p>` : ""}
  ${form ? `<form method="post" action="/__login">
    <label for="pw">Group password</label>
    <input id="pw" name="password" type="password" autocomplete="current-password" required autofocus>
    <input type="hidden" name="next" id="next" value="${esc(back)}">
    <button type="submit">Open</button>
  </form>
  <script>if (location.pathname !== "/__login") document.getElementById("next").value = location.pathname + location.search + location.hash;</script>` : ""}
</main></body></html>`;
  return new Response(html, {
    status,
    headers: { "Content-Type": "text/html; charset=utf-8", "Cache-Control": "no-store", "X-Robots-Tag": "noindex, nofollow" }
  });
}
