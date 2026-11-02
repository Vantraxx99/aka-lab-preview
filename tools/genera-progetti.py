"""Genera progetti/<slug>.html da content/progetti.json, riusando header, menu, CTA e footer della home.
Uso: python3 tools/genera-progetti.py  (dalla cartella del repository)"""
import json, os, re, html

R = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
idx = open(os.path.join(R, 'index.html')).read()
data = json.load(open(os.path.join(R, 'content/progetti.json')))
by = {p['slug']: p for p in data}
SERV = {"strategy": "Strategy & Marketing", "content": "Content, Social & Creator",
        "partnership": "Partnership & Business Development", "event": "Event & Talent Management"}
GRAD = ["radial-gradient(90% 70% at 20% 10%,#E8605B 0%,#9B1E22 38%,#120F0E 85%)",
        "radial-gradient(80% 70% at 80% 20%,#FBFAF9 0%,#E8605B 30%,#9B1E22 62%,#120F0E 100%)",
        "radial-gradient(70% 60% at 50% 0%,#F3D9D2 0%,#9B1E22 45%,#120F0E 100%)",
        "radial-gradient(90% 80% at 90% 90%,#E8605B 0%,#7A161A 40%,#120F0E 90%)"]

head = re.search(r'<head>(.*?)</head>', idx, re.S).group(1)
shell1 = re.search(r'<!-- SHELL-START -->(.*?)<!-- SHELL-END -->', idx, re.S).group(1)
shell2 = re.search(r'<!-- SHELL2-START -->(.*?)<!-- SHELL2-END -->', idx, re.S).group(1)

def rel(s):
    s = re.sub(r'(href|src)="(index\.html[^"]*|admin\.html|assets/[^"]*)"', r'\1="../\2"', s)
    return s

head, shell1, shell2 = rel(head), rel(shell1), rel(shell2)
e = lambda s: html.escape(s, quote=True)
ARROW = '<svg aria-hidden="true" width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M3 11L11 3M5 3h6v6"/></svg>'

def split_title(t):
    words = t.split()
    if len(t) <= 12 or len(words) == 1:
        return [t]
    half = len(t) / 2
    best, bi = 10**9, 1
    for i in range(1, len(words)):
        a = ' '.join(words[:i]); d = abs(len(a) - half)
        if d < best:
            best, bi = d, i
    return [' '.join(words[:bi]), ' '.join(words[bi:])]

def count_attrs(v):
    m = re.match(r'^(\+?)([\d.]+)([A-Za-z]*)$', v.strip())
    if not m:
        return '', e(v)
    pre, num, suf = m.groups()
    shown = pre + num + (f'<em>{suf}</em>' if suf else '')
    return f' data-count="{num}" data-pre="{pre}" data-suf="{suf}"', shown

def page(p, n):
    lines = split_title(p['titolo'])
    h1 = ''.join(f'<span class="ln" data-i="{i}"><span>{e(l)}</span></span>' for i, l in enumerate(lines))
    chips = ''.join(f'<span>{e(d)}</span>' for d in p['discipline'])
    nums = ''
    for i, r in enumerate(p['risultati']):
        attrs, shown = count_attrs(r['valore'])
        nums += f'<div class="num" data-reveal style="--d:{i*90}ms"><b{attrs}>{shown}</b><p>{e(r["label"])}</p></div>'
    steps = ''.join(f'<div class="step" data-reveal style="--d:{i*120}ms"><span class="k">0{i+1}</span><h3>{e(s["titolo"])}</h3><p>{e(s["testo"])}</p></div>' for i, s in enumerate(p['strategia']))
    inits = ''.join(f'<article class="init" data-reveal style="--d:{i*120}ms"><span class="k">{e(x["kicker"])}</span><h3>{e(x["titolo"])}</h3>{f"<p class=pt>{e(x["partner"])}</p>" if x["partner"] else ""}<p>{e(x["testo"])}</p></article>' for i, x in enumerate(p['iniziative']))
    shots = ''.join(f'<figure class="shot" data-reveal="clip" style="--g:{GRAD[(n+i)%4]};--d:{i*120}ms"><div class="grain" aria-hidden="true"></div><figcaption>[ Foto: {e(m)} ]</figcaption></figure>' for i, m in enumerate(p['materiali']))
    servs = ''.join(f'<a class="btn" href="../index.html#{s}">{e(SERV[s])} {ARROW}</a>' for s in p['servizi'])
    nxt = by[p['successivo']]

    sec_steps = f'''
  <section class="cream sec" style="padding-top:0" aria-labelledby="st-title">
    <div class="wrap">
      <p class="eyebrow" data-reveal id="st-title">Strategia e attività</p>
      <div class="steps">{steps}</div>
    </div>
  </section>''' if p['strategia'] else ''
    sec_inits = f'''
  <section class="redbg sec" aria-labelledby="in-title">
    <div class="wrap">
      <h2 class="display h2 lines" id="in-title" style="margin-bottom:clamp(40px,5vw,72px)"><span class="ln"><span>{e(p["iniziative_titolo"])}</span></span></h2>
      <div class="inits">{inits}</div>
    </div>
  </section>''' if p['iniziative'] else ''

    return f'''<!doctype html>
<html lang="it">
<head>{head.replace('<title>AKA LAB — Festival Strategy &amp; Communication</title>', f'<title>{e(p["titolo"])} — Case study AKA LAB</title>').replace("content=\"Aiutiamo a costruire festival che vivono 365 giorni l'anno, attraverso strategia, comunicazione, contenuti e relazioni.\"", f'content="{e(p["obiettivo"])}"')}</head>
<body>
{shell1}
<main id="main">

  <section class="hero p-hero" aria-labelledby="p-title">
    <canvas class="hero-stage" aria-hidden="true"></canvas>
    <div class="grain" aria-hidden="true"></div>
    <div class="hero-vignette" aria-hidden="true"></div>
    <div class="hero-inner wrap" data-hero>
      <a class="p-back up" href="../index.html#portfolio">← Tutti i progetti</a>
      <p class="eyebrow up" style="--d:150ms;margin-top:clamp(40px,8svh,96px)">Progetti · {e(p["etichetta"])}</p>
      <h1 class="display fit" id="p-title" data-fit data-max-vh="{24 if len(lines) == 1 else 19}" aria-label="{e(p["titolo"])}">{h1}</h1>
      <p class="lead up" style="--d:600ms;margin-top:clamp(20px,3svh,36px);color:var(--on-dark)">{e(p["sottotitolo"])}</p>
      <div class="p-chips up" style="--d:750ms">{chips}</div>
    </div>
  </section>

  <section class="dark sec" style="padding-top:clamp(48px,6vw,96px)" aria-labelledby="rs-title">
    <div class="wrap">
      <p class="eyebrow" data-reveal id="rs-title">Risultati documentati</p>
      <div class="nums">{nums}</div>
      <p class="nums-note" data-reveal>{e(p["nota"])}</p>
    </div>
  </section>

  <section class="cream sec" aria-labelledby="ob-title">
    <div class="wrap">
      <p class="eyebrow" data-reveal id="ob-title">Obiettivo</p>
      <p class="scrub obj">{e(p["obiettivo"])}</p>
    </div>
  </section>
{sec_steps}
{sec_inits}

  <section class="cream sec" aria-labelledby="mt-title">
    <div class="wrap">
      <p class="eyebrow" data-reveal id="mt-title">Materiali</p>
      <div class="gallery">{shots}</div>
      <p class="eyebrow" data-reveal style="margin-top:clamp(56px,7vw,96px)">Servizi coinvolti</p>
      <div class="serv-links" data-reveal>{servs}</div>
    </div>
  </section>

  <a class="next" href="{nxt["slug"]}.html" data-cursor="Avanti">
    <div class="wrap">
      <div><p>Progetto successivo</p><b>{e(nxt["titolo"])}</b></div>
      <svg aria-hidden="true" width="64" height="64" viewBox="0 0 14 14" fill="none" stroke="currentColor" stroke-width="1.1"><path d="M2 7h10M8 3l4 4-4 4"/></svg>
    </div>
  </a>
{shell2}
</main>
</body>
</html>
'''

os.makedirs(os.path.join(R, 'progetti'), exist_ok=True)
for n, p in enumerate(data):
    open(os.path.join(R, 'progetti', p['slug'] + '.html'), 'w').write(page(p, n))
    print('ok', p['slug'])
