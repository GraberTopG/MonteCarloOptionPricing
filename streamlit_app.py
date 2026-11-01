"""Monte Carlo Option Pricing: the presentation, served through Streamlit Community Cloud.

The slides are the same static web app as before (index.html, app.js, theme.css, sections/*.js). This file only
1. asks for the group password (Streamlit secret SITE_PASSWORD, never stored in the repo), and
2. puts the whole web app, inlined into one HTML page, on the screen.

Edit the slides in sections/*.js as usual: Streamlit picks up every push to main automatically.
"""
import hmac
import re
from pathlib import Path

import streamlit as st
import streamlit.components.v1 as components

ROOT = Path(__file__).parent

st.set_page_config(page_title="Monte Carlo Option Pricing", layout="wide", initial_sidebar_state="collapsed")

# no Streamlit header, footer or page margins: the slides take the whole window
st.markdown(
    """<style>
    header, footer, [data-testid="stToolbar"], [data-testid="stDecoration"] {display: none !important;}
    .block-container {padding: 0 !important; max-width: 100% !important;}
    iframe {border: 0; height: 100vh !important; width: 100% !important; display: block;}   /* the slides fit any window */
    [data-testid="stMainBlockContainer"], .stMainBlockContainer {padding: 0 !important;}
    </style>""",
    unsafe_allow_html=True,
)


def password_ok() -> bool:
    """Show a password box until the right group password was entered (kept for this browser session)."""
    if st.session_state.get("ok"):
        return True
    secret = st.secrets.get("SITE_PASSWORD", "")
    if not secret:
        st.error("This site is locked because no group password has been set up yet (Streamlit secret SITE_PASSWORD).")
        return False
    _, mid, _ = st.columns([1, 1, 1])
    with mid:
        st.markdown("<div style='height:18vh'></div>", unsafe_allow_html=True)
        st.caption("CORPORATE FINANCE (7,107) · GROUP PROJECT")
        st.subheader("Monte Carlo Option Pricing")
        st.write("This web app is for our group only. Enter the group password to open it.")
        given = st.text_input("Group password", type="password")
        if given:
            if hmac.compare_digest(given, secret):
                st.session_state["ok"] = True
                st.rerun()
            st.error("Wrong password. Please try again.")
    return False


@st.cache_data
def bundle(stamp: float) -> str:
    """index.html with theme.css and every script copied in, so the browser needs no other files."""
    html = (ROOT / "index.html").read_text(encoding="utf-8")
    html = re.sub(
        r'<link[^>]*href="([^"]+\.css)"[^>]*>',
        lambda m: "<style>\n" + (ROOT / m.group(1)).read_text(encoding="utf-8") + "\n</style>",
        html,
    )
    html = re.sub(
        r'<script([^>]*)\ssrc="([^"]+\.js)"([^>]*)>\s*</script>',
        lambda m: "<script>\n" + (ROOT / m.group(2)).read_text(encoding="utf-8").replace("</script", "<\\/script") + "\n</script>",
        html,
    )
    return html


if password_ok():
    # stamp: the newest file time, so a new push is picked up even though the bundle is cached
    files = [ROOT / "index.html", ROOT / "app.js", ROOT / "theme.css", *sorted((ROOT / "sections").glob("*.js"))]
    stamp = max(f.stat().st_mtime for f in files)
    components.html(bundle(stamp), height=880, scrolling=False)
